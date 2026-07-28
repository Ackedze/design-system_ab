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


ROUTING = {
    "p_account-select.md": {
        "components": ["AccountSelect", "OptionList"],
        "categories": ["accounts", "choice", "select"],
        "aliases": ["выбор счета", "выбор счетов", "список счетов", "account select"],
    },
    "p_adaptive-alfa-business.md": {
        "components": [],
        "categories": ["adaptive", "breakpoints", "responsive"],
        "aliases": ["адаптив", "адаптивность", "брейкпоинт", "desktop и mobileweb"],
    },
    "p_amount_component.md": {
        "components": ["Amount", "AmountStyles", "PaymentMaskedNumber"],
        "categories": ["amount", "currency", "numeric-data"],
        "aliases": ["сумма", "денежная сумма", "валюта", "формат суммы", "числовые данные"],
    },
    "p_background-plate.md": {
        "components": ["BackgroundPlate", "Style Level 1"],
        "categories": ["background", "container", "surface"],
        "aliases": ["фоновая подложка", "уровень фона", "background plate"],
    },
    "p_benefit-card.md": {
        "components": ["BenefitCard", "Benefits", "BenefitsBlock"],
        "categories": ["benefits", "promo", "card"],
        "aliases": ["карточка преимущества", "преимущества", "benefit card"],
    },
    "p_border-radius.md": {
        "components": [],
        "categories": ["border-radius", "corners", "visual"],
        "aliases": ["скругление", "скругления", "радиус", "радиусы", "углы"],
    },
    "p_buttons-and-buttons-group.md": {
        "components": [
            "Button",
            "ButtonsGroup",
            "ButtonGroup",
            "ButtonStack",
            "PickerButton",
            "IconButton",
            "ActionButton",
            "CustomButton",
        ],
        "categories": ["buttons", "button-group", "cta", "actions"],
        "aliases": [
            "кнопка",
            "кнопки",
            "кнопок",
            "группа кнопок",
            "группы кнопок",
            "групп кнопок",
            "иерархия действий",
            "главное действие",
            "overflow действий",
        ],
    },
    "p_content-card-wrapper.md": {
        "components": ["ContentCardWrapper"],
        "categories": ["content-card", "card", "wrapper"],
        "aliases": ["контентная карточка", "обертка карточки", "content card wrapper"],
    },
    "p_corporate-app-navigation.md": {
        "components": [
            "CorporateAppHeaderNew",
            "CorporateAppHeaderMobile",
            "CorporateTopbar",
            "Header",
            "SideMenu",
            "HeaderMenu",
            "HubMenu",
        ],
        "categories": ["navigation", "header", "side-menu"],
        "aliases": ["навигация приложения", "хедер", "боковое меню", "меню продукта"],
    },
    "p_corporate-page.md": {
        "components": ["CorporatePage", "CorporateContent", "GridAndCols"],
        "categories": ["page", "page-template", "layout"],
        "aliases": ["корпоративная страница", "шаблон страницы", "corporate page"],
    },
    "p_faq.md": {
        "components": ["FAQ", "Accordion"],
        "categories": ["faq", "questions", "accordion"],
        "aliases": ["частые вопросы", "вопросы и ответы", "аккордеон faq"],
    },
    "p_file-upload.md": {
        "components": ["FileUpload"],
        "categories": ["file-upload", "files", "documents"],
        "aliases": ["загрузка файла", "загрузка файлов", "прикрепить файл", "дропзона"],
    },
    "p_filter-bar.md": {
        "components": ["FilterBar", "FiltersBlock", "FilterCompanySelect"],
        "categories": ["filters", "filtering", "search"],
        "aliases": ["панель фильтров", "фильтры", "поиск и фильтрация", "filter bar"],
    },
    "p_form-construction-rules.md": {
        "components": ["Form"],
        "categories": ["forms", "form-layout", "construction"],
        "aliases": ["построение формы", "структура формы", "компоновка формы", "форма"],
    },
    "p_images_format.md": {
        "components": ["IconView", "CardImage"],
        "categories": ["images", "illustrations", "media"],
        "aliases": ["изображение", "картинка", "иллюстрация", "формат изображения", "safe area"],
    },
    "p_input-fields.md": {
        "components": ["Input", "Field", "Select", "Textarea"],
        "categories": ["input", "fields", "controls"],
        "aliases": ["поле ввода", "поля ввода", "инпут", "лейбл поля", "валидация поля"],
    },
    "p_interruption-scenario.md": {
        "components": ["ScenarioModel", "Modal", "PopupSheet"],
        "categories": ["interruption", "unsaved-changes", "confirmation"],
        "aliases": ["прерывание сценария", "несохраненные изменения", "выйти без сохранения"],
    },
    "p_islands.md": {
        "components": ["IsleBlock", "IsleHeader", "IsleContent", "IsleFooter"],
        "categories": ["islands", "secondary-content", "layout"],
        "aliases": ["островок", "островки", "правая колонка", "вторичный контент"],
    },
    "p_landing-pages.md": {
        "components": ["PromoMainBlock", "LandingPage"],
        "categories": ["landing", "promo", "editorial"],
        "aliases": ["лендинг", "лендинговая страница", "промо страница", "landing page"],
    },
    "p_link.md": {
        "components": ["Link", "PseudoLink"],
        "categories": ["link", "navigation", "legal"],
        "aliases": ["ссылка", "псевдоссылка", "внешняя ссылка", "юридическая ссылка"],
    },
    "p_promo-card.md": {
        "components": ["PromoCard", "BentoGrid"],
        "categories": ["promo-card", "promo", "offer"],
        "aliases": ["промокарточка", "промо карточка", "карточка предложения", "promo card"],
    },
    "p_status-model.md": {
        "components": ["Status", "StatusPreset", "StatusBadge", "Status & Property"],
        "categories": ["status", "semantics", "ux-writing"],
        "aliases": ["статус", "статусная модель", "семантика статуса", "цвет статуса"],
    },
    "p_status-screen.md": {
        "components": ["StatusScreen", "ResultScreen", "CorporateSystemMessage"],
        "categories": ["status-screen", "result-screen", "empty-state"],
        "aliases": ["экран статуса", "экран результата", "пустое состояние", "техническая ошибка"],
    },
    "p_table-basic-d.md": {
        "components": ["Table Basic [D]", "TableBasic"],
        "categories": ["table-basic", "table", "data-grid"],
        "aliases": ["базовая таблица", "простая таблица", "table basic"],
    },
    "p_table-view.md": {
        "components": ["TableView"],
        "categories": ["table-view", "data-view", "table"],
        "aliases": ["представление таблицы", "горизонтальная таблица", "вертикальная таблица"],
    },
    "p_table-wide-d.md": {
        "components": ["Table Wide [D]", "TableWide", "TableBulkActions"],
        "categories": ["table-wide", "table", "data-grid"],
        "aliases": ["широкая таблица", "таблица wide", "table wide", "массовые действия таблицы"],
    },
    "p_table_format.md": {
        "components": ["BodyCell", "BodyRow", "TableCell"],
        "categories": ["tables", "data-formatting", "cells"],
        "aliases": ["форматирование таблицы", "данные в таблице", "выравнивание колонок", "ячейка таблицы"],
    },
    "p_tabs-view.md": {
        "components": ["TabsView", "TabsPrimary", "TabsSecondary"],
        "categories": ["tabs", "navigation", "view"],
        "aliases": ["табы", "вкладки", "навигация табами", "tabs view"],
    },
    "p_title-view-editable.md": {
        "components": ["TitleViewEditable", "EditableTitleView"],
        "categories": ["editable-title", "page-header", "editing"],
        "aliases": ["редактируемый заголовок", "редактируемый titleview", "editable title"],
    },
    "p_title-view.md": {
        "components": ["TitleView", "TitleViewMobile"],
        "categories": ["title-view", "page-header", "heading"],
        "aliases": ["заголовок страницы", "шапка страницы", "title view", "подзаголовок страницы"],
    },
    "p_tooltip_hint.md": {
        "components": ["Tooltip", "Hint", "Onboarding Tooltip", "Onboarding Hint"],
        "categories": ["tooltip", "hint", "help"],
        "aliases": ["тултип", "хинт", "подсказка", "информационная подсказка"],
    },
    "p_wide-grid.md": {
        "components": ["WideGrid", "GridAndCols"],
        "categories": ["wide-grid", "grid", "columns"],
        "aliases": ["широкая сетка", "сетка страницы", "колонки", "гаттер", "wide grid"],
    },
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    return parser.parse_args()


def metadata_value(text: str, key: str) -> str:
    match = re.search(rf"^- {re.escape(key)}:\s*(.+)$", text, re.MULTILINE)
    if not match:
        raise ValueError(f"Missing metadata {key}")
    return match.group(1).strip()


def split_csv(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


def build_route(path: Path) -> dict[str, object]:
    text = path.read_text(encoding="utf-8")
    first_line = text.splitlines()[0]
    if not first_line.startswith("# Pattern: "):
        raise ValueError(f"Invalid pattern title in {path.name}")

    routing = ROUTING[path.name]
    rule_ids = re.findall(r"^- ruleId:\s*(\S+)\s*$", text, re.MULTILINE)
    route = {
        "patternId": metadata_value(text, "patternId"),
        "patternKey": metadata_value(text, "patternKey"),
        "patternName": first_line.removeprefix("# Pattern: ").strip(),
        "sourceFile": path.name,
        "status": metadata_value(text, "status"),
        "platforms": split_csv(metadata_value(text, "platforms")),
        "tags": split_csv(metadata_value(text, "tags")),
        "components": routing["components"],
        "categories": routing["categories"],
        "aliases": routing["aliases"],
        "ruleIds": rule_ids,
    }
    return route


def build_registry() -> dict[str, object]:
    files = sorted(PATTERNS_DIR.glob("p_*.md"))
    actual_names = {path.name for path in files}
    configured_names = set(ROUTING)
    if actual_names != configured_names:
        missing = sorted(actual_names - configured_names)
        stale = sorted(configured_names - actual_names)
        raise ValueError(f"Routing coverage mismatch: missing={missing}, stale={stale}")

    return {
        "schemaVersion": 1,
        "sourceRoot": "patterns",
        "usage": "pattern-rag-ingestion",
        "retrievalPolicy": {
            "domainIsolationRequired": True,
            "documentType": "pattern",
            "maxQueriesPerRequest": 2,
            "fallbackToModelKnowledge": False,
            "requiredEvidenceFields": ["sourceFile", "ruleText"],
            "preferredLookupOrder": [
                "ruleId-exact",
                "patternId-exact",
                "sourceFile-exact",
                "component-and-property",
                "component-and-question",
                "scenario-and-platform",
            ],
        },
        "routes": [build_route(path) for path in files],
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
