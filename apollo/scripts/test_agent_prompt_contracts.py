#!/usr/bin/env python3
"""Guard critical source-grounding rules in Apollo Agent prompts."""

from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
INSTRUCTIONS = ROOT / "apollo" / "instructions"

REQUIRED_FRAGMENTS = {
    "a_pattern_agent_system.md": [
        "closed-book",
        "source_quote",
        "source_url",
        "Нулевой допуск к неподтверждённым фактам",
        "Не переписывай его, не переводи и не добавляй синонимы",
        "Фраза «паттерн описывает, какие брейкпоинты использовать» не подтверждает конкретные значения",
    ],
    "a_orchestrator_agent_system.md": [
        "closed-book",
        "source_quote",
        "source_url",
        "не подменяй его `classifierResult.taskSummary`",
        "Этот запрет действует и при найденном документе",
        "Форматирование evidence и ссылок",
        "Никогда не показывай пользователю названия этих полей",
        "Не используй псевдоцитаты вида `【source_quote: ...】`",
        "Не создавай `Итого`, если оно только повторяет",
    ],
}


def main() -> int:
    for file_name, fragments in REQUIRED_FRAGMENTS.items():
        text = (INSTRUCTIONS / file_name).read_text(encoding="utf-8")
        missing = [fragment for fragment in fragments if fragment not in text]
        if missing:
            raise SystemExit(f"Missing prompt guardrails in {file_name}: {missing}")

    print("Agent prompt contract checks passed: strict source grounding is enabled")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
