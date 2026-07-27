"""Deterministically route an Apollo request and load only selected pattern files."""

from __future__ import annotations

import json
import re
from pathlib import PurePosixPath
from typing import Any

from langflow.base.data.storage_utils import read_file_bytes
from langflow.custom.custom_component.component import Component
from langflow.io import FileInput, IntInput, MessageTextInput, Output
from langflow.schema.message import Message


class PatternSourceSelector(Component):
    display_name = "Apollo Pattern Source Selector"
    description = "Routes an Apollo request through pattern-registry.json and reads only matching sources."
    icon = "route"
    name = "ApolloPatternSourceSelector"

    inputs = [
        MessageTextInput(
            name="request",
            display_name="Apollo Request",
            required=True,
            info="JSON request received by apollo_reading_patterns.",
        ),
        FileInput(
            name="registry_file",
            display_name="Pattern Registry",
            file_types=["json"],
            required=True,
            real_time_refresh=True,
        ),
        FileInput(
            name="pattern_files",
            display_name="Pattern Files",
            file_types=["md"],
            required=True,
            is_list=True,
            real_time_refresh=True,
        ),
        IntInput(
            name="max_files",
            display_name="Maximum Selected Files",
            value=3,
            advanced=True,
        ),
        IntInput(
            name="max_total_characters",
            display_name="Maximum Source Characters",
            value=60000,
            advanced=True,
        ),
    ]

    outputs = [
        Output(
            display_name="Selected Pattern Context",
            name="selected_context",
            method="select_context",
            types=["Message"],
        )
    ]

    async def select_context(self) -> Message:
        try:
            request = self._parse_request(self.request)
            registry_path = self._single_path(self.registry_file)
            registry = json.loads(await self._read_text(registry_path))
            routes = registry.get("routes")
            if not isinstance(routes, list):
                raise ValueError("pattern registry does not contain routes[]")

            selected_routes = self._select_routes(request, routes)
            if not selected_routes:
                return self._message(
                    {
                        "routeStatus": "no_route",
                        "routeReason": "no-registry-match",
                        "selectedSources": [],
                        "limits": self._limits(),
                    }
                )

            available_files = self._index_paths(self.pattern_files)
            selected_sources = []
            total_characters = 0

            for selected in selected_routes:
                route = selected["route"]
                source_file = route.get("sourceFile")
                source_path = available_files.get(source_file)
                if not source_path:
                    return self._technical_error(
                        "pattern_source_missing",
                        f"Selected source is not attached to the selector: {source_file}",
                    )

                content = await self._read_text(source_path)
                next_total = total_characters + len(content)
                if next_total > self._max_total_characters():
                    return self._technical_error(
                        "pattern_context_too_large",
                        f"Selected source context exceeds {self._max_total_characters()} characters",
                    )

                selected_sources.append(
                    {
                        "patternId": route.get("patternId"),
                        "patternKey": route.get("patternKey"),
                        "patternName": route.get("patternName"),
                        "sourceFile": source_file,
                        "routeScore": selected["score"],
                        "routeReasons": selected["reasons"],
                        "content": content,
                    }
                )
                total_characters = next_total

            return self._message(
                {
                    "routeStatus": "ok",
                    "routeReason": "registry-match",
                    "selectedSources": selected_sources,
                    "limits": {
                        **self._limits(),
                        "selectedFiles": len(selected_sources),
                        "selectedCharacters": total_characters,
                    },
                }
            )
        except Exception as error:  # noqa: BLE001
            return self._technical_error("pattern_router_failure", str(error))

    def _select_routes(self, request: dict[str, Any], routes: list[dict[str, Any]]) -> list[dict[str, Any]]:
        query = self._query_context(request)
        matches = []

        for route in routes:
            score = 0
            reasons = []
            route_rule_ids = set(self._strings(route.get("ruleIds")))
            exact_rules = query["rule_ids"] & route_rule_ids
            if exact_rules:
                score += 1000 + len(exact_rules)
                reasons.append("ruleId-exact")

            if route.get("patternId") in query["pattern_ids"]:
                score += 950
                reasons.append("patternId-exact")

            if route.get("sourceFile") in query["source_files"]:
                score += 925
                reasons.append("sourceFile-exact")

            component_names = {self._normalize(value) for value in self._strings(route.get("components"))}
            if query["component"] and query["component"] in component_names:
                score += 850
                reasons.append("component-exact")
            elif query["component"] and self._has_related_value(query["component"], component_names):
                score += 700
                reasons.append("component-alias")

            route_categories = {
                self._normalize(value)
                for value in self._strings(route.get("categories")) + self._strings(route.get("tags"))
            }
            if query["category"] and query["category"] in route_categories:
                score += 600
                reasons.append("category-exact")

            normalized_aliases = {
                self._normalize(value)
                for value in self._strings(route.get("aliases")) + self._strings(route.get("components"))
            }
            matched_aliases = [
                alias
                for alias in normalized_aliases
                if len(alias) >= 4 and self._contains_phrase(query["search_text"], alias)
            ]
            if matched_aliases:
                score += 400 + min(max(len(alias) for alias in matched_aliases), 100)
                reasons.append("question-alias")

            if score > 0:
                matches.append({"route": route, "score": score, "reasons": reasons})

        matches.sort(
            key=lambda item: (
                -item["score"],
                str(item["route"].get("sourceFile") or ""),
            )
        )
        if matches and matches[0]["score"] >= 1000:
            matches = [item for item in matches if item["score"] >= 1000]
        return matches[: self._max_files()]

    def _query_context(self, request: dict[str, Any]) -> dict[str, Any]:
        component = request.get("component")
        component_name = component.get("name") if isinstance(component, dict) else component
        rule_ids = set(self._strings(request.get("ruleIds")))

        changes = request.get("changes")
        if isinstance(changes, list):
            for change in changes:
                if not isinstance(change, dict):
                    continue
                assessment = change.get("assessment")
                if isinstance(assessment, dict) and assessment.get("ruleId"):
                    rule_ids.add(str(assessment["ruleId"]))

        pattern_ids = set(self._strings(request.get("patternIds")))
        if request.get("patternId"):
            pattern_ids.add(str(request["patternId"]))
        source_files = set(self._strings(request.get("sourceFiles")))
        if request.get("sourceFile"):
            source_files.add(str(request["sourceFile"]))

        search_parts = [
            request.get("question"),
            request.get("taskSummary"),
            component_name,
            request.get("category"),
        ]
        search_text = self._normalize(" ".join(str(value) for value in search_parts if value))

        return {
            "rule_ids": rule_ids,
            "pattern_ids": pattern_ids,
            "source_files": source_files,
            "component": self._normalize(component_name),
            "category": self._normalize(request.get("category")),
            "search_text": search_text,
        }

    @staticmethod
    def _parse_request(value: Any) -> dict[str, Any]:
        text = PatternSourceSelector._text_value(value).strip()
        parsed = json.loads(text)
        if not isinstance(parsed, dict):
            raise ValueError("Apollo request must be a JSON object")
        return parsed

    @staticmethod
    def _text_value(value: Any) -> str:
        if isinstance(value, str):
            return value
        text = getattr(value, "text", None)
        if isinstance(text, str):
            return text
        return str(value or "")

    @staticmethod
    def _strings(value: Any) -> list[str]:
        if isinstance(value, list):
            return [str(item) for item in value if item is not None]
        if value is None:
            return []
        return [str(value)]

    @staticmethod
    def _normalize(value: Any) -> str:
        text = str(value or "").lower().replace("ё", "е")
        text = re.sub(r"\[(?:d|m)\]", " ", text, flags=re.IGNORECASE)
        text = re.sub(r"[^\w]+", " ", text, flags=re.UNICODE)
        return " ".join(text.split())

    @staticmethod
    def _contains_phrase(search_text: str, phrase: str) -> bool:
        return bool(phrase) and f" {phrase} " in f" {search_text} "

    @staticmethod
    def _has_related_value(value: str, candidates: set[str]) -> bool:
        if len(value) < 4:
            return False
        return any(
            len(candidate) >= 4 and (value in candidate or candidate in value)
            for candidate in candidates
        )

    @staticmethod
    def _path_value(value: Any) -> str | None:
        if isinstance(value, str):
            return value
        if isinstance(value, dict):
            candidate = value.get("path") or value.get("file_path")
            return str(candidate) if candidate else None
        candidate = getattr(value, "path", None) or getattr(value, "file_path", None)
        return str(candidate) if candidate else None

    @classmethod
    def _paths(cls, value: Any) -> list[str]:
        items = value if isinstance(value, list) else [value]
        return [path for item in items if (path := cls._path_value(item))]

    @classmethod
    def _single_path(cls, value: Any) -> str:
        paths = cls._paths(value)
        if len(paths) != 1:
            raise ValueError("Pattern Registry must contain exactly one JSON file")
        return paths[0]

    @classmethod
    def _index_paths(cls, value: Any) -> dict[str, str]:
        paths = cls._paths(value)
        indexed = {PurePosixPath(path.replace("\\", "/")).name: path for path in paths}
        if not indexed:
            raise ValueError("No pattern files are attached to the selector")
        return indexed

    @staticmethod
    async def _read_text(path: str) -> str:
        raw = await read_file_bytes(path)
        return raw.decode("utf-8-sig", errors="replace")

    def _max_files(self) -> int:
        return max(1, min(int(self.max_files or 3), 3))

    def _max_total_characters(self) -> int:
        return max(1000, min(int(self.max_total_characters or 60000), 60000))

    def _limits(self) -> dict[str, Any]:
        return {
            "maxFiles": self._max_files(),
            "maxTotalCharacters": self._max_total_characters(),
            "fallbackToAllFiles": False,
        }

    @staticmethod
    def _message(payload: dict[str, Any]) -> Message:
        return Message(text=json.dumps(payload, ensure_ascii=False))

    def _technical_error(self, code: str, message: str) -> Message:
        return self._message(
            {
                "routeStatus": "technical_error",
                "routeReason": "selector-error",
                "selectedSources": [],
                "limits": self._limits(),
                "error": {"code": code, "message": message},
            }
        )
