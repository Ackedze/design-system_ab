#!/usr/bin/env python3
"""Build Apollo pattern metadata for isolated RAG ingestion and coverage checks."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
PATTERNS_DIR = ROOT / "patterns"
REGISTRY_PATH = ROOT / "apollo" / "pattern-registry.json"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    return parser.parse_args()


def read_top_metadata(text: str) -> dict[str, str]:
    metadata: dict[str, str] = {}
    for line in text.splitlines()[2:]:
        if not line:
            break
        if line.startswith("  - "):
            continue
        match = re.fullmatch(r"- ([A-Za-z][A-Za-z0-9]*):\s*(.*)", line)
        if not match:
            raise ValueError(f"Invalid pattern metadata line: {line}")
        key, value = match.groups()
        if key in metadata:
            raise ValueError(f"Duplicate metadata {key}")
        metadata[key] = value
    return metadata


def metadata_value(metadata: dict[str, str], key: str) -> str:
    if key not in metadata or not metadata[key].strip():
        raise ValueError(f"Missing metadata {key}")
    return metadata[key].strip()


def metadata_list(metadata: dict[str, str], key: str) -> list[str]:
    try:
        values = json.loads(metadata_value(metadata, key))
    except json.JSONDecodeError as error:
        raise ValueError(f"Metadata {key} must be a JSON string array") from error
    if (
        not isinstance(values, list)
        or any(not isinstance(value, str) or not value or value.strip() != value for value in values)
        or len(values) != len(set(values))
    ):
        raise ValueError(f"Metadata {key} must contain unique non-empty strings without outer whitespace")
    return values


def split_csv(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


def build_route(path: Path) -> dict[str, object]:
    text = path.read_text(encoding="utf-8")
    first_line = text.splitlines()[0]
    if not first_line.startswith("# Pattern: "):
        raise ValueError(f"Invalid pattern title in {path.name}")

    metadata = read_top_metadata(text)
    if metadata_value(metadata, "documentType") != "pattern":
        raise ValueError(f"Invalid documentType in {path.name}")
    routing = {key: metadata_list(metadata, key) for key in ("components", "categories", "aliases")}
    if not routing["components"] and not routing["aliases"]:
        raise ValueError(f"Missing retrieval terms in {path.name}")
    rule_ids = re.findall(r"^- ruleId:\s*(\S+)\s*$", text, re.MULTILINE)
    route = {
        "patternId": metadata_value(metadata, "patternId"),
        "patternKey": metadata_value(metadata, "patternKey"),
        "patternName": first_line.removeprefix("# Pattern: ").strip(),
        "sourceFile": path.name,
        "status": metadata_value(metadata, "status"),
        "platforms": split_csv(metadata_value(metadata, "platforms")),
        "tags": split_csv(metadata_value(metadata, "tags")),
        "components": routing["components"],
        "categories": routing["categories"],
        "aliases": routing["aliases"],
        "ruleIds": rule_ids,
    }
    return route


def build_registry() -> dict[str, object]:
    files = sorted(PATTERNS_DIR.glob("p_*.md"))
    routes = []
    for path in files:
        try:
            routes.append(build_route(path))
        except ValueError as error:
            raise ValueError(f"{path.name}: {error}") from error

    return {
        "schemaVersion": 1,
        "sourceRoot": "patterns",
        "usage": "pattern-evidence-catalog",
        "retrievalPolicy": {
            "runtimeScope": "design-space",
            "acceptRelevantDocumentTypes": True,
            "normativeDocumentType": "pattern",
            "maxQueriesPerRequest": 2,
            "fallbackToModelKnowledge": False,
            "requiredSourceFields": ["sourceTitle", "sourceUrl"],
            "localCatalogLookupOrder": [
                "ruleId-exact",
                "patternId-exact",
                "sourceFile-exact",
                "component-and-property",
                "component-and-question",
                "scenario-and-platform",
            ],
        },
        "routes": routes,
    }


def main() -> int:
    args = parse_args()
    registry = build_registry()
    rendered = json.dumps(registry, ensure_ascii=False, indent=2) + "\n"

    if args.check:
        current = REGISTRY_PATH.read_text(encoding="utf-8") if REGISTRY_PATH.exists() else ""
        if current != rendered:
            raise SystemExit("pattern-registry.json is out of date")
        print(f"Pattern registry is current: {len(registry['routes'])} routes")
        return 0

    REGISTRY_PATH.write_text(rendered, encoding="utf-8")
    print(f"Wrote {REGISTRY_PATH}: {len(registry['routes'])} routes")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
