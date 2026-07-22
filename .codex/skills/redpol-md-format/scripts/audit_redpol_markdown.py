#!/usr/bin/env python3

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


DOC_SPECS = {
    "context": {
        "heading_prefix": "# Context: ",
        "meta_keys": [
            "documentType",
            "contextId",
            "productType",
            "flowName",
            "platforms",
            "pageId",
            "pageName",
            "selectionId",
            "selectionName",
            "exportedAt",
            "sourceType",
            "sections",
            "figmaPageUrl",
        ],
    },
    "snapshot": {
        "heading_prefix": "# Snapshot: ",
        "meta_keys": [
            "documentType",
            "contextId",
            "snapshotId",
            "pageId",
            "pageName",
            "selectionId",
            "selectionName",
            "exportedAt",
            "platforms",
            "pageType",
            "itemsCount",
            "figmaSelectionUrl",
        ],
        "fragment_keys": [
            "fragmentId",
            "contextId",
            "snapshotId",
            "orderIndex",
            "location",
            "contentType",
            "typographyRole",
            "layerName",
            "componentName",
            "componentKey",
            "path",
            "shortPath",
        ],
    },
    "pattern": {
        "heading_prefix": "# Pattern: ",
        "meta_keys": [
            "documentType",
            "patternType",
            "patternId",
            "patternKey",
            "productType",
            "platforms",
            "locale",
            "owner",
            "status",
            "updatedAt",
            "sourceType",
            "tags",
            "figmaLink",
            "sections",
        ],
        "optional_meta_keys": ["relatedPatterns"],
        "rule_keys": [
            "ruleId",
            "severity",
            "appliesTo",
            "checkType",
            "autofix",
        ],
    },
}

PATTERN_COMPONENT_META_KEYS = [
    "documentType",
    "patternType",
    "component",
    "patternId",
    "patternKey",
    "productType",
    "platforms",
    "locale",
    "owner",
    "status",
    "updatedAt",
    "sourceType",
    "tags",
    "figmaLink",
    "sections",
]


META_RE = re.compile(r"^- ([^:]+):\s*(.*)$")
SECTION_RE = re.compile(r"^## Section (\d+):\s+(.+)$")
FRAGMENT_RE = re.compile(r"^## Fragment (\d+)$")
RULE_RE = re.compile(r"^### Rule (\d+):\s+(.+)$")


def discover_files(paths: list[str]) -> list[Path]:
    if not paths:
        paths = [
            "standards/redpol",
            "patterns",
            "redpol",
            "shared/design-system_ab/patterns",
            "shared/design-system_ab/redpol",
            "shared/assets/design-system_ab/redpol",
        ]

    files: list[Path] = []
    for raw in paths:
        path = Path(raw)
        if path.is_dir():
            files.extend(sorted(p for p in path.rglob("*.md") if p.is_file()))
        elif path.is_file() and path.suffix == ".md":
            files.append(path)
    return files


def find_document_type(lines: list[str]) -> str | None:
    for line in lines[:30]:
        match = META_RE.match(line)
        if match and match.group(1) == "documentType":
            doc_type = match.group(2).strip()
            if doc_type in DOC_SPECS:
                return doc_type
    return None


def read_top_metadata_values(lines: list[str]) -> dict[str, str]:
    values: dict[str, str] = {}
    idx = 2
    while idx < len(lines) and (lines[idx].startswith("- ") or lines[idx].startswith("  - ")):
        if lines[idx].startswith("- "):
            match = META_RE.match(lines[idx])
            if match:
                key, value = match.groups()
                values[key] = value.strip()
        idx += 1
    return values


def is_component_pattern(meta: dict[str, str]) -> bool:
    return (
        meta.get("patternType") == "component"
        or bool(meta.get("component"))
        or meta.get("patternId", "").startswith("ptrn:components.")
        or meta.get("sourceType") == "component-guideline"
    )


def parse_top_metadata(
    lines: list[str],
    issues: list[str],
    expected_keys: list[str],
    optional_keys: list[str] | None = None,
) -> dict[str, str]:
    if len(lines) < 2:
        issues.append("file is too short")
        return {}

    if lines[1] != "":
        issues.append("expected exactly one blank line after H1")

    idx = 2
    meta_lines: list[str] = []
    while idx < len(lines) and (lines[idx].startswith("- ") or lines[idx].startswith("  - ")):
        if lines[idx].startswith("- "):
            meta_lines.append(lines[idx])
        idx += 1

    if not meta_lines:
        issues.append("metadata block is missing or not placed immediately after H1")
        return {}

    keys: list[str] = []
    values: dict[str, str] = {}
    for line in meta_lines:
        match = META_RE.match(line)
        if not match:
            issues.append(f"invalid metadata line: {line}")
            continue
        key, value = match.groups()
        keys.append(key)
        values[key] = value

    optional_keys = optional_keys or []
    required_from_actual = [key for key in keys if key not in optional_keys]
    unknown_keys = [key for key in keys if key not in expected_keys and key not in optional_keys]

    if required_from_actual != expected_keys or unknown_keys:
        issues.append(
            "metadata keys/order mismatch: expected "
            + ", ".join(expected_keys)
            + (f" | optional {', '.join(optional_keys)}" if optional_keys else "")
            + " | got "
            + ", ".join(keys)
        )

    if "patternType" in expected_keys and not values.get("patternType", "").strip():
        issues.append("pattern metadata requires non-empty `patternType` value")
    if values.get("patternType", "").strip() == "component" and not values.get("component", "").strip():
        issues.append("component pattern metadata requires non-empty `component` value")
    if values.get("component", "").strip() and values.get("patternType", "").strip() != "component":
        issues.append("`component` metadata is allowed only when `patternType` is `component`")

    if idx >= len(lines) or lines[idx] != "":
        issues.append("expected exactly one blank line after metadata block")

    return values


def audit_context_sections(lines: list[str], issues: list[str], declared_count: str | None) -> None:
    section_indexes = [i for i, line in enumerate(lines) if SECTION_RE.match(line)]
    if not section_indexes:
        issues.append("no sections found")
        return

    for expected_num, idx in enumerate(section_indexes, start=1):
        match = SECTION_RE.match(lines[idx])
        assert match is not None
        found_num = int(match.group(1))
        if found_num != expected_num:
            issues.append(f"section numbering is not consecutive at line {idx + 1}")
        if idx + 1 >= len(lines) or lines[idx + 1] != "":
            issues.append(f"expected blank line after section heading at line {idx + 1}")
            continue
        if idx + 2 >= len(lines) or not lines[idx + 2].startswith("- sectionKey: "):
            issues.append(f"missing `- sectionKey:` after section heading at line {idx + 1}")
            continue
        if idx + 3 >= len(lines) or lines[idx + 3] != "":
            issues.append(f"expected blank line after `sectionKey` at line {idx + 3}")

    if declared_count is not None:
        try:
            declared = int(declared_count)
            if declared != len(section_indexes):
                issues.append(
                    f"`sections` is {declared}, but found {len(section_indexes)} section blocks"
                )
        except ValueError:
            issues.append(f"`sections` is not an integer: {declared_count}")


def audit_pattern_sections(lines: list[str], issues: list[str], declared_count: str | None) -> None:
    section_indexes = [i for i, line in enumerate(lines) if SECTION_RE.match(line)]
    if not section_indexes:
        issues.append("no sections found")
        return

    expected_titles = [
        "Определение",
        "Когда использовать",
        "Когда не использовать",
        "Принципы",
        "Структура текста",
        "Правила",
        "Шаблоны",
        "Примеры",
        "Антипримеры",
        "Машинная обработка",
    ]

    for expected_num, idx in enumerate(section_indexes, start=1):
        match = SECTION_RE.match(lines[idx])
        assert match is not None
        found_num = int(match.group(1))
        found_title = match.group(2).strip()
        if found_num != expected_num:
            issues.append(f"section numbering is not consecutive at line {idx + 1}")
        if expected_num <= len(expected_titles) and found_title != expected_titles[expected_num - 1]:
            issues.append(
                f"unexpected pattern section title at line {idx + 1}: expected "
                f"`{expected_titles[expected_num - 1]}`, got `{found_title}`"
            )
        if idx + 1 >= len(lines) or lines[idx + 1] != "":
            issues.append(f"expected blank line after section heading at line {idx + 1}")
        if idx + 2 < len(lines) and lines[idx + 2].startswith("- sectionKey: "):
            issues.append(f"`sectionKey` is not used in pattern sections near line {idx + 1}")

    if declared_count is not None:
        try:
            declared = int(declared_count)
            if declared != len(section_indexes):
                issues.append(
                    f"`sections` is {declared}, but found {len(section_indexes)} section blocks"
                )
            if declared != 10:
                issues.append(f"pattern `sections` should be 10, got {declared}")
        except ValueError:
            issues.append(f"`sections` is not an integer: {declared_count}")


def audit_pattern_rules(lines: list[str], issues: list[str], expected_rule_keys: list[str]) -> None:
    rule_indexes = [i for i, line in enumerate(lines) if RULE_RE.match(line)]
    if not rule_indexes:
        issues.append("no `### Rule N:` blocks found")
        return

    for expected_num, idx in enumerate(rule_indexes, start=1):
        match = RULE_RE.match(lines[idx])
        assert match is not None
        found_num = int(match.group(1))
        if found_num != expected_num:
            issues.append(f"rule numbering is not consecutive at line {idx + 1}")
        if idx + 1 >= len(lines) or lines[idx + 1] != "":
            issues.append(f"expected blank line after rule heading at line {idx + 1}")
            continue

        cursor = idx + 2
        rule_meta: list[str] = []
        while cursor < len(lines) and lines[cursor].startswith("- "):
            rule_meta.append(lines[cursor])
            cursor += 1

        keys: list[str] = []
        for line in rule_meta:
            match = META_RE.match(line)
            if not match:
                issues.append(f"invalid rule metadata line near line {idx + 1}: {line}")
                continue
            keys.append(match.group(1))

        if keys != expected_rule_keys:
            issues.append(
                f"rule metadata keys/order mismatch near line {idx + 1}: expected "
                + ", ".join(expected_rule_keys)
                + " | got "
                + ", ".join(keys)
            )

        if cursor >= len(lines) or lines[cursor] != "":
            issues.append(f"expected blank line after rule metadata near line {idx + 1}")


def audit_machine_processing(lines: list[str], issues: list[str]) -> None:
    required_headings = [
        "### Детерминированные проверки",
        "### Словарные проверки",
        "### LLM-проверки",
        "### Не проверяется автоматически",
        "### Автоисправления",
    ]
    for heading in required_headings:
        if heading not in lines:
            issues.append(f"missing machine-processing heading `{heading}`")


def audit_fragments(
    lines: list[str],
    issues: list[str],
    declared_count: str | None,
    expected_fragment_keys: list[str],
) -> None:
    fragment_indexes = [i for i, line in enumerate(lines) if FRAGMENT_RE.match(line)]
    if not fragment_indexes:
        issues.append("no fragments found")
        return

    for expected_num, idx in enumerate(fragment_indexes, start=1):
        match = FRAGMENT_RE.match(lines[idx])
        assert match is not None
        found_num = int(match.group(1))
        if found_num != expected_num:
            issues.append(f"fragment numbering is not consecutive at line {idx + 1}")
        if idx + 1 >= len(lines) or lines[idx + 1] != "":
            issues.append(f"expected blank line after fragment heading at line {idx + 1}")
            continue

        cursor = idx + 2
        fragment_meta: list[str] = []
        while cursor < len(lines) and lines[cursor].startswith("- "):
            fragment_meta.append(lines[cursor])
            cursor += 1

        keys: list[str] = []
        for line in fragment_meta:
            match = META_RE.match(line)
            if not match:
                issues.append(f"invalid fragment metadata line: {line}")
                continue
            keys.append(match.group(1))

        if keys != expected_fragment_keys:
            issues.append(
                f"fragment metadata keys/order mismatch near line {idx + 1}: expected "
                + ", ".join(expected_fragment_keys)
                + " | got "
                + ", ".join(keys)
            )

        if cursor >= len(lines) or lines[cursor] != "":
            issues.append(f"expected blank line after fragment metadata near line {idx + 1}")

    if declared_count is not None:
        try:
            declared = int(declared_count)
            if declared != len(fragment_indexes):
                issues.append(
                    f"`itemsCount` is {declared}, but found {len(fragment_indexes)} fragment blocks"
                )
        except ValueError:
            issues.append(f"`itemsCount` is not an integer: {declared_count}")


def audit_file(path: Path) -> list[str]:
    issues: list[str] = []
    lines = path.read_text(encoding="utf-8").splitlines()
    if not lines:
        return ["empty file"]

    doc_type = find_document_type(lines)
    if doc_type is None:
        return []

    spec = DOC_SPECS[doc_type]
    if not lines[0].startswith(spec["heading_prefix"]):
        issues.append(f"H1 must start with `{spec['heading_prefix']}`")
    if lines[0].strip() == spec["heading_prefix"].strip():
        issues.append("H1 title is empty")

    raw_meta = read_top_metadata_values(lines)
    expected_meta_keys = spec["meta_keys"]
    if doc_type == "pattern" and is_component_pattern(raw_meta):
        expected_meta_keys = PATTERN_COMPONENT_META_KEYS

    meta = parse_top_metadata(
        lines,
        issues,
        expected_meta_keys,
        spec.get("optional_meta_keys", []),
    )

    if doc_type == "context":
        audit_context_sections(lines, issues, meta.get("sections"))
    elif doc_type == "pattern":
        audit_pattern_sections(lines, issues, meta.get("sections"))
        audit_pattern_rules(lines, issues, spec["rule_keys"])
        audit_machine_processing(lines, issues)
    elif doc_type == "snapshot":
        audit_fragments(lines, issues, meta.get("itemsCount"), spec["fragment_keys"])

    return issues


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Audit Redpol markdown documents against the current corpus format."
    )
    parser.add_argument(
        "paths",
        nargs="*",
        help="Files or directories to scan. Defaults to standards/redpol.",
    )
    args = parser.parse_args()

    files = discover_files(args.paths)
    if not files:
        print("No markdown files found in the requested scope.", file=sys.stderr)
        return 2

    checked = 0
    failed = 0
    for path in files:
        issues = audit_file(path)
        if issues == [] and find_document_type(path.read_text(encoding="utf-8").splitlines()):
            checked += 1
            continue
        if issues:
            checked += 1
            failed += 1
            print(path)
            for issue in issues:
                print(f"  - {issue}")

    if failed:
        print(f"\nFAIL: {failed} of {checked} Redpol markdown files need normalization.")
        return 1

    print(f"OK: checked {checked} Redpol markdown files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
