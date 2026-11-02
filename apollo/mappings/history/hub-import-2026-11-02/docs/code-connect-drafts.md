# Черновики Code Connect — на ревью

Сгенерировано `node tools/code-connect-drafts.mjs --report`. Источник — `entities/**/code-connect.overrides.draft.json`.

Как принимать: проверь записи, поправь черновик при необходимости и выполни
`node tools/code-connect-drafts.mjs --accept <id> [--min high|medium|low]`, затем `node tools/build-entities.mjs`.

| Уверенность | Смысл |
|---|---|
| high | прямое соответствие по типам и описанию пропа — можно принимать пакетно |
| medium | соответствие по смыслу или «нет пропа, это данные/поведение» — проверить |
| low | гипотеза, нужно решение мейнтейнера |

## `corp.amount-styles`

Покрытие: none 0/1 → complete 1/1

| | Figma | Код | Уверенность | Почему |
|---|---|---|---|---|
| только Figma | Negative | Знак задаётся значением суммы в amount (отрицательное value), отдельного флага нет | medium | В API CorporateAmount нет пропа знака; amount содержит value |

## `corp.banner-wrapper-mobile`

Покрытие: none 0/2 → complete 2/2

| | Figma | Код | Уверенность | Почему |
|---|---|---|---|---|
| только Figma | Banner | Баннер — содержимое компонента (mainIcon, текст), отдельного пропа нет | low | Нет пропа banner; смысл свойства нужно уточнить у автора Figma-компонента |
| только Figma | Skeleton | У BannerWrapperMobile нет пропа скелетона | medium | В пропсах нет showSkeleton/loading |

## `corp.card-image`

Покрытие: partial 0/4 → partial 3/4

| | Figma | Код | Уверенность | Почему |
|---|---|---|---|---|
| свойство | Size | `size`: 212x132→212, 24x16→24, 264x164→264, 44x28→44, 68x42→68 | high | Числовые значения size совпадают с шириной из названия варианта |
| свойство | Stack | `stacked`: false→false, true→true | high | stacked: «Свойство, которое включает колоду карт» |
| свойство | State | Active→mode="default"; Locked→mode="status"; Inactive→? | low | mode=status показывает иконку статуса (modeIcon); соответствие Inactive не найдено |
| только Figma | Cover | Обложка задаётся кодом карты cardId (и baseUrl сервиса изображений) | medium | Картинка карты грузится по cardId, а не выбирается пропом |

## `corp.content-card-wrapper`

Покрытие: partial 2/4 → complete 4/4

| | Figma | Код | Уверенность | Почему |
|---|---|---|---|---|
| свойство | State | `state`: Active→"normal", Disabled→"disabled", Empty→"empty", Error→"error" | high | state: "disabled" | "error" | "normal" | "empty"; Active = normal |

## `corp.corporate-topbar`

Покрытие: none 0/2 → complete 2/2

| | Figma | Код | Уверенность | Почему |
|---|---|---|---|---|
| свойство | Filtered | `isCountMode`: false→false, true→true | medium | Filtered показывает панель найденных элементов: isCountMode + count |
| только Figma | Skeleton | У CorporateTopbar нет пропа скелетона | medium | В пропсах нет showSkeleton/loading |

## `corp.divider`

Покрытие: none 0/1 → complete 1/1

| | Figma | Код | Уверенность | Почему |
|---|---|---|---|---|
| только Figma | Presets | Вариант light не выражен пропом; нужен проп или className | low | У Divider только className и dataTestId — решение за мейнтейнером |

## `corp.file-upload`

Покрытие: partial 2/4 → complete 4/4

| | Figma | Код | Уверенность | Почему |
|---|---|---|---|---|
| свойство | State | Default→—; Disable→disabled=true; Error→error="Текст ошибки" | high | disabled: boolean; error: string (текст ошибки) |

## `corp.navigation-card-view`

Покрытие: partial 4/16 → complete 16/16

| | Figma | Код | Уверенность | Почему |
|---|---|---|---|---|
| компонент | [D][Promo] NavigationCardView | desktopBackgroundPlateProps={"promo":true} | low | Promo-вариант → promo у BackgroundPlate; отдельного пропа promo нет |
| компонент | [M][Promo] NavigationCardView | mobileBackgroundPlateProps={"promo":true} | low | Promo-вариант → promo у BackgroundPlate; отдельного пропа promo нет |
| свойство | View | `size`: Large→"large", Small→"small" | high | size: "small" | "large" — «Размер карточки (только десктоп)» |
| свойство | State | Active→—; Disable→disabled=true | high | disabled: «Выключенное состояние» |
| свойство | Image Centred | `rightAddonPosition`: True→"center", False→"bottom" | medium | rightAddonPosition: "center" | "bottom" — позиция картинки справа |
| свойство | Page BG | Gray→mobileBackgroundPlateProps={"backgroundColor":"base-bg-alt"}; White→mobileBackgroundPlateProps={"backgroundColor":"base-bg"} | low | Фон страницы влияет на BackgroundPlate; проверить, что это так в коде |
| только Figma | Bottom | Футер появляется при передаче buttons или customFooterContent | medium | Нет булева пропа футера; футер — производная от контента |

## `corp.result-screen`

Покрытие: none 0/2 → complete 2/2

| | Figma | Код | Уверенность | Почему |
|---|---|---|---|---|
| свойство | View | `state`: Error→"error", Success→"success", Warning→"warning" | high | state: error | success | warning |

## `promo.footer`

Покрытие: none 0/4 → complete 4/4

| | Figma | Код | Уверенность | Почему |
|---|---|---|---|---|
| только Figma | Compact | Компактный вид не выражен пропом | low | Нет пропа compact у Footer |
| только Figma | Variations | Состав футера (FAQ / Form) собирается из отдельных компонентов, а не пропом Footer | low | Footer в коде — копирайт и версия; FAQ и форма — отдельные блоки |
| только Figma | View | Modal / Page — контекст размещения, а не проп | low | Нет пропа view у Footer |

## `promo.promo-card`

Покрытие: partial 4/6 → complete 6/6

| | Figma | Код | Уверенность | Почему |
|---|---|---|---|---|
| свойство | Image | Bottom→imageOrientation="bottom"; Top→imageOrientation="top"; None (Figma only)→— | high | imageOrientation: "bottom" | "top"; без картинки — не передавать image |

## `promo.promo-table-view`

Покрытие: partial 2/4 → complete 4/4

| | Figma | Код | Уверенность | Почему |
|---|---|---|---|---|
| только Figma | Style preset | Фон Gray/White — от фона страницы/BackgroundPlate, отдельного пропа нет | low | Есть только backgroundPlateBorder — смысл Style preset нужно уточнить |

## `corp.account-select`

Покрытие: none 0/8 → complete 8/8

| | Figma | Код | Уверенность | Почему |
|---|---|---|---|---|
| свойство | SelectType | `multiple`: Single→false, Multi→true | high | multiple наследуется от core Select |
| только Figma | Grouped | Группировка счетов определяется данными accounts | medium | Нет пропа grouped; группы строятся из данных |
| только Figma | Presets | Формат строки счёта (name / name + sum / number) задаётся данными accounts и accountNumberFirst | medium | Пресеты отображения — производная от данных |
| только Figma | Type | Тип строки счёта задаётся данными; SwapMe и ❌ Number — нарушение паттерна account-select | medium | AccountItem — внутренняя часть списка |

## `corp.button-group`

Покрытие: partial 2/4 → complete 4/4

| | Figma | Код | Уверенность | Почему |
|---|---|---|---|---|
| только Figma | Overflow | Кнопка «Ещё» появляется автоматически, когда элементов больше maxVisibleButtons | high | Поведение компонента, а не проп |

## `corp.card-swiper-mobile`

Покрытие: none 0/1 → complete 1/1

| | Figma | Код | Уверенность | Почему |
|---|---|---|---|---|
| только Figma | Screen Size | Адаптив по ширине экрана — поведение компонента | high | Вариант Figma показывает брейкпоинт, а не проп |

## `corp.chat`

Покрытие: none 0/11 → complete 11/11

| | Figma | Код | Уверенность | Почему |
|---|---|---|---|---|
| только Figma | Length | Вид пузыря и ленты задаётся данными сообщений data (Message: отправитель, статус, порядок) | medium | У Chat только data, onRetry, className |
| только Figma | Position | Вид пузыря и ленты задаётся данными сообщений data (Message: отправитель, статус, порядок) | medium | У Chat только data, onRetry, className |
| только Figma | Sender | Вид пузыря и ленты задаётся данными сообщений data (Message: отправитель, статус, порядок) | medium | У Chat только data, onRetry, className |
| только Figma | Style | Вид пузыря и ленты задаётся данными сообщений data (Message: отправитель, статус, порядок) | medium | У Chat только data, onRetry, className |
| только Figma | State | Вид пузыря и ленты задаётся данными сообщений data (Message: отправитель, статус, порядок) | medium | У Chat только data, onRetry, className |
| только Figma | Type | Вид пузыря и ленты задаётся данными сообщений data (Message: отправитель, статус, порядок) | medium | У Chat только data, onRetry, className |
| только Figma | Bubbles | Вид пузыря и ленты задаётся данными сообщений data (Message: отправитель, статус, порядок) | medium | У Chat только data, onRetry, className |
| только Figma | Status | Вид пузыря и ленты задаётся данными сообщений data (Message: отправитель, статус, порядок) | medium | У Chat только data, onRetry, className |

## `corp.corporate-app-header-mobile`

Покрытие: none 0/7 → complete 7/7

| | Figma | Код | Уверенность | Почему |
|---|---|---|---|---|
| свойство | [M] NavigationBar · Presets | Home→showHomeBar=true; Page→showPageBar=true | high | showHomeBar / showPageBar переключают режим NavigationBar |
| свойство | LeftAddon · Content | Back→showBackButton=true; Logo→showLogo=true; None→— | high | showBackButton / showLogo |
| свойство | CenteredMainSlot · Content | None→—; Title→pageBarTitle="Заголовок"; Title + Subtitle→pageBarTitle="Заголовок", pageBarSubtitle="Подзаголовок" | medium | pageBarTitle / pageBarSubtitle; тексты — пример |
| только Figma | RightAddon · Content | Правый слот передаётся ReactNode через rightAddons | medium | rightAddons: ReactNode |
| только Figma | BottomAddon · Content | Нижний слот — дочерние элементы (children) | low | Предположение: BottomAddon рендерится из children |
| только Figma | Active Tab | selectedTabId = id таба из tabBarOptions | medium | Id табов задаёт продукт |
| только Figma | BackgroundColor | Фон шапки не управляется пропом | low | Нет пропа фона у CorporateAppHeaderMobile |

## `corp.corporate-app-header-new`

Покрытие: none 0/4 → complete 4/4

| | Figma | Код | Уверенность | Почему |
|---|---|---|---|---|
| свойство | Edit Mode | `isSettingsMode`: False→false, True→true | high | isSettingsMode: «меню находится в режиме настройки» |
| только Figma | Back | Кнопка «Назад» управляется навигацией (onBeforeNavigationBack, useNewBackButton) | low | Нет прямого булева пропа — уточнить у мейнтейнера |
| только Figma | [D] Header · Tablet | Планшетный вид — адаптив компонента, а не проп | high | Свойство без значений: показывает брейкпоинт |

## `corp.corporate-system-message`

Покрытие: partial 4/6 → complete 6/6

| | Figma | Код | Уверенность | Почему |
|---|---|---|---|---|
| свойство | BG plate | `useBackgroundPlate`: False→false, True→true | high | useBackgroundPlate: «Использовать ли компонент BackgroundPlate» |

## `corp.date-range-picker`

Покрытие: none 0/1 → complete 1/1

| | Figma | Код | Уверенность | Почему |
|---|---|---|---|---|
| только Figma | Preset | Tags — ярлыки периодов через rangeShortcuts; SwapMe — слот headerCustomSlot | medium | Верхний аддон собирается из rangeShortcuts или кастомного слота |

## `corp.filter-bar`

Покрытие: partial 2/3 → complete 3/3

| | Figma | Код | Уверенность | Почему |
|---|---|---|---|---|
| свойство | View | `view`: Field→"filled", Muted→"muted" | high | view: "filled" | "muted"; Field = filled |

## `corp.filter-company-select`

Покрытие: partial 2/9 → complete 9/9

| | Figma | Код | Уверенность | Почему |
|---|---|---|---|---|
| свойство | View | `singleFieldView`: Compact→"compact", FilterTag→"filterTag", Select→"default" | high | singleFieldView: default | compact | filterTag |
| свойство | ShowFirstCompany | `showFirstCompanyCaption`: False→false, True→true | medium | Паттерн требует ShowFirstCompany=False; в коде — подпись первой компании |
| только Figma | Selected | Выбранность задаётся пропом selected (данные), а не флагом | medium | selected: OptionShape | OptionShape[] |
| только Figma | SelectedState | Выбранность задаётся пропом selected (данные), а не флагом | medium | CompactTag — внутренняя часть |

## `corp.onboarding-hint`

Покрытие: none 0/3 → complete 3/3

| | Figma | Код | Уверенность | Почему |
|---|---|---|---|---|
| свойство | Tail Direction | ↑→position="bottom"; ↓→position="top"; ←→position="right"; →→position="left" | medium | Хвост указывает на якорь: хвост вверх = подсказка под якорем |
| только Figma | Tail Position | Start/End — суффикс -start/-end к position (bottom-start, …) | medium | Два свойства Figma складываются в одно значение position |
| только Figma | Tail · Direction | Внутренняя часть хвоста — следует за Tail Direction | high | Tail — служебный компонент |

## `corp.onboarding-tooltip`

Покрытие: none 0/2 → complete 2/2

| | Figma | Код | Уверенность | Почему |
|---|---|---|---|---|
| свойство | Tail Direction | ↑→position="bottom"; ↓→position="top"; ←→position="right"; →→position="left" | medium | Хвост указывает на якорь: хвост вверх = тултип под якорем |
| только Figma | Tail Position | Start/End — суффикс -start/-end к position (bottom-start, …) | medium | Два свойства Figma складываются в одно значение position |

## `corp.pagination`

Покрытие: none 0/1 → complete 1/1

| | Figma | Код | Уверенность | Почему |
|---|---|---|---|---|
| только Figma | Skeleton | У Pagination нет пропа скелетона | medium | В пропсах нет showSkeleton/loading |

## `corp.payment-control`

Покрытие: none 0/1 → complete 1/1

| | Figma | Код | Уверенность | Почему |
|---|---|---|---|---|
| свойство | State | Active→—; ActiveFilled→inputValue="1000"; DisabledEmpty→disabled=true; DisabledFilled→disabled=true, inputValue="1000"; Empty→—; ErrorFilled→error=true, inputValue="1000"; Filled→inputValue="1000" | medium | Active — фокус (поведение); Filled — пример значения inputValue |

## `corp.table-basic`

Покрытие: none 0/7 → complete 7/7

| | Figma | Код | Уверенность | Почему |
|---|---|---|---|---|
| компонент | [D] BodyRow :: Basic | mode="basic" | medium | Table Basic = Table mode="basic" |
| только Figma | Presets | Содержимое ячеек задаётся columns/rows (рендер ячейки), а не пропом | medium | Ячейки Figma — представление данных таблицы |
| только Figma | Skeleton | Скелетон таблицы — состояние загрузки строк, прямого пропа нет | low | Нет пропа скелетона у Table |

## `corp.table-bulk-actions`

Покрытие: none 0/4 → complete 4/4

| | Figma | Код | Уверенность | Почему |
|---|---|---|---|---|
| свойство | TopRow | `buttonWrap`: false→false, true→true | low | buttonWrap: «Отображать кнопки на новой строке» — проверить смысл TopRow |
| только Figma | Amount | Блок сумм показывается при передаче amounts | medium | Нет булева пропа; производная от данных |
| только Figma | Tablet | Адаптив — поведение компонента | high | Вариант Figma показывает брейкпоинт |

## `corp.table-wide`

Покрытие: none 0/10 → complete 10/10

| | Figma | Код | Уверенность | Почему |
|---|---|---|---|---|
| компонент | [D] BodyRow :: Wide | mode="wide" | medium | Table Wide = Table mode="wide" |
| только Figma | Presets | Содержимое ячеек задаётся columns/rows (рендер ячейки), а не пропом | medium | Ячейки Figma — представление данных таблицы |
| только Figma | Skeleton | Скелетон таблицы — состояние загрузки строк, прямого пропа нет | low | Нет пропа скелетона у Table |
| только Figma | Group | Групповые строки — TableGroupedRow в rows | medium | Группы задаются данными |

## `corp.voc`

Покрытие: none 0/2 → complete 2/2

| | Figma | Код | Уверенность | Почему |
|---|---|---|---|---|
| только Figma | State | Шаг (оценка → отправлено → статус) меняется внутри компонента; StatusScreen — при shouldShowStatusScreen | medium | Внутреннее состояние сценария |
| только Figma | Step | Шаг (оценка → отправлено → статус) меняется внутри компонента; StatusScreen — при shouldShowStatusScreen | medium | Внутреннее состояние сценария |

## `promo.benefits-block`

Покрытие: partial 3/6 → complete 6/6

| | Figma | Код | Уверенность | Почему |
|---|---|---|---|---|
| свойство | [D] BenefitsBlock · Image | `imagePositionDesktop`: Left→"left", Right→"right" | high | imagePositionDesktop: right | left |
| свойство | [M] BenefitsBlock · Image | `imagePositionMobile`: Bottom→"bottom", Top→"top" | high | imagePositionMobile: bottom | top |
| только Figma | HeightCustom | Передайте высоту числом в heightCustom (px) | medium | heightCustom: number, не булево |
