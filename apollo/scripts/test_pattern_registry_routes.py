#!/usr/bin/env python3
"""Validate Apollo pattern registry coverage and critical ingest metadata."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
REGISTRY_PATH = ROOT / "apollo" / "pattern-registry.json"


EXPECTED_COMPONENT_ROUTES = {
    "Button": "p_buttons-and-buttons-group.md",
    "ButtonsGroup": "p_buttons-and-buttons-group.md",
    "BackgroundPlate": "p_background-plate.md",
    "BenefitCard": "p_benefit-card.md",
    "FileUpload": "p_file-upload.md",
    "FilterBar": "p_filter-bar.md",
    "IconView": "p_images_format.md",
    "Input": "p_input-fields.md",
    "IsleBlock": "p_islands.md",
    "HoldingPlate": "p_holding-company-selection.md",
    "ProgressBar": "p_progress-bar.md",
    "Status": "p_status-model.md",
    "StatusScreen": "p_status-screen.md",
    "TableView": "p_table-view.md",
    "TabsView": "p_tabs-view.md",
    "TitleView": "p_title-view.md",
    "Tooltip": "p_tooltip_hint.md",
    "WideGrid": "p_wide-grid.md",
}


def main() -> int:
    registry = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
    if registry.get("usage") != "pattern-evidence-catalog":
        raise SystemExit("Registry is not configured as a pattern evidence catalog")

    policy = registry.get("retrievalPolicy", {})
    if policy.get("runtimeScope") != "design-space":
        raise SystemExit("Runtime search must cover the DESIGN space")
    if policy.get("acceptRelevantDocumentTypes") is not True:
        raise SystemExit("Runtime search must accept relevant documents of every type")
    if policy.get("normativeDocumentType") != "pattern":
        raise SystemExit("Only pattern documents may be treated as normative")
    if policy.get("fallbackToModelKnowledge") is not False:
        raise SystemExit("Model-knowledge fallback must be disabled")
    required_source_fields = policy.get("requiredSourceFields", [])
    if not {"sourceTitle", "sourceUrl"}.issubset(required_source_fields):
        raise SystemExit("Every accepted document must retain its title and URL")

    routes = registry.get("routes", [])
    if len(routes) != 34:
        raise SystemExit(f"Expected 34 routes, got {len(routes)}")

    component_routes: dict[str, list[str]] = {}
    rule_routes: dict[str, str] = {}
    source_files: set[str] = set()
    for route in routes:
        source_file = route["sourceFile"]
        source_files.add(source_file)
        if not route.get("patternId") or not route.get("patternKey"):
            raise SystemExit(f"Missing pattern identity for {source_file}")
        source_text = (ROOT / "patterns" / source_file).read_text(encoding="utf-8")
        if "- documentType: pattern" not in source_text:
            raise SystemExit(f"Invalid documentType for {source_file}")
        if not route.get("aliases") and not route.get("components"):
            raise SystemExit(f"Missing retrieval terms for {source_file}")

        for component in route["components"]:
            component_routes.setdefault(component, []).append(source_file)
        for rule_id in route["ruleIds"]:
            if rule_id in rule_routes:
                raise SystemExit(f"Duplicate ruleId: {rule_id}")
            rule_routes[rule_id] = source_file

    pattern_files = {path.name for path in (ROOT / "patterns").glob("p_*.md")}
    if source_files != pattern_files:
        raise SystemExit(
            "Pattern source coverage mismatch: "
            f"missing={sorted(pattern_files - source_files)}, "
            f"stale={sorted(source_files - pattern_files)}"
        )

    for component, expected_file in EXPECTED_COMPONENT_ROUTES.items():
        actual_files = component_routes.get(component, [])
        if actual_files != [expected_file]:
            raise SystemExit(
                f"Unexpected source for {component}: expected {expected_file}, got {actual_files}"
            )

    required_rule = "rule:controls.buttons-and-button-groups.primary-left"
    if rule_routes.get(required_rule) != "p_buttons-and-buttons-group.md":
        raise SystemExit(f"Missing critical rule metadata: {required_rule}")

    print(
        "Pattern registry checks passed: "
        f"{len(routes)} patterns, {len(rule_routes)} ruleIds, "
        f"{len(component_routes)} components"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
