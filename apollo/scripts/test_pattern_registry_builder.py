#!/usr/bin/env python3
"""Check that routing comes from pattern metadata, including new patterns."""

from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import build_pattern_registry as builder


class PatternRoutingMetadataTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)

    def pattern(self, name: str = "p_future.md", **routing: object) -> Path:
        values = {
            "components": ["FutureCard", "Table Basic [D]"],
            "categories": ["cards"],
            "aliases": ["карточка, новая", "метка: действие"],
        }
        values.update(routing)
        slug = name.removeprefix("p_").removesuffix(".md")
        header = [
            "# Pattern: Future card", "", "- documentType: pattern",
            "- patternType: controls", f"- patternId: ptrn:test.{slug}",
            f"- patternKey: test.{slug}", "- status: active",
            "- platforms: desktop, mobileweb", "- tags: card, future",
        ]
        header += [f"- {key}: {json.dumps(value, ensure_ascii=False)}" for key, value in values.items()]
        header += ["- relatedPatterns:", "  - ptrn:controls.buttons-and-button-groups", "- sections: 10", ""]
        path = self.root / name
        path.write_text("\n".join(header) + f"\n## Section 1: Определение\n\nExample.\n\n### Rule 1: Example\n\n- ruleId: rule:test.{slug}\n", encoding="utf-8")
        return path

    def test_new_pattern_reads_its_own_routing_without_script_registration(self) -> None:
        path = self.pattern()
        route = builder.build_route(path)
        self.assertEqual(route["components"], ["FutureCard", "Table Basic [D]"])
        self.assertEqual(route["aliases"], ["карточка, новая", "метка: действие"])
        self.assertEqual(route["categories"], ["cards"])
        self.assertEqual(route["ruleIds"], ["rule:test.future"])
        self.assertEqual(route["platforms"], ["desktop", "mobileweb"])

    def test_new_files_are_discovered_in_stable_order(self) -> None:
        self.pattern("p_zeta.md")
        self.pattern("p_alpha.md", components=["Alpha"])
        with patch.object(builder, "PATTERNS_DIR", self.root):
            first = builder.build_registry()
            self.assertEqual(first, builder.build_registry())
        self.assertEqual([r["sourceFile"] for r in first["routes"]], ["p_alpha.md", "p_zeta.md"])

    def test_routing_fields_must_be_explicit_arrays_of_strings(self) -> None:
        for field in ["components", "categories", "aliases"]:
            for value in ["Button", None, True, {}, [1], [None], [""], [" "], [" Button"], ["Button", "Button"]]:
                with self.subTest(field=field, value=value):
                    path = self.pattern("p_title-view.md", **{field: value})
                    with self.assertRaises(ValueError):
                        builder.build_route(path)

    def test_missing_top_field_cannot_be_supplied_by_body_example(self) -> None:
        for field in ["components", "categories", "aliases"]:
            with self.subTest(field=field):
                path = self.pattern("p_title-view.md")
                lines = [line for line in path.read_text(encoding="utf-8").splitlines() if not line.startswith(f"- {field}:")]
                path.write_text("\n".join(lines) + f'\n- {field}: ["Body example"]\n', encoding="utf-8")
                with self.assertRaises(ValueError):
                    builder.build_route(path)

    def test_duplicate_top_field_is_rejected(self) -> None:
        path = self.pattern("p_title-view.md")
        path.write_text(path.read_text(encoding="utf-8").replace("- categories:", '- components: ["Other"]\n- categories:'), encoding="utf-8")
        with self.assertRaises(ValueError):
            builder.build_route(path)

    def test_malformed_json_names_the_invalid_source_file(self) -> None:
        path = self.pattern()
        text = path.read_text(encoding="utf-8")
        line = next(line for line in text.splitlines() if line.startswith("- categories:"))
        path.write_text(text.replace(line, '- categories: ["cards",]'), encoding="utf-8")
        with patch.object(builder, "PATTERNS_DIR", self.root):
            with self.assertRaisesRegex(ValueError, "p_future.md: Metadata categories"):
                builder.build_registry()

    def test_empty_component_list_is_valid_for_a_general_pattern(self) -> None:
        path = self.pattern(components=[])
        self.assertEqual(builder.build_route(path)["components"], [])

    def test_pattern_without_components_or_aliases_is_rejected(self) -> None:
        path = self.pattern("p_title-view.md", components=[], aliases=[])
        with self.assertRaises(ValueError):
            builder.build_route(path)


if __name__ == "__main__":
    unittest.main()
