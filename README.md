# Интерактивное демо «Я живой»

Автономный frontend-only пакет (Vite + React + TypeScript). Весь код и статика демо живут в этой папке.

## Продукт и роли

- **Пациент** — экран «Мой день», уведомления, опрос самочувствия, «Забота», контакты; пункт **«Ещё»** открывает разделы семьи **только для просмотра** (обзор, наблюдение, план и т.д.).
- **Опекун / координатор** — **консоль**: устройства (мастер подключения), расписание и состав опроса, лекарства, журнал изменений; нижнее меню **«Ещё»** — полный Hub и остальные модули.
- **Демо**: роли не защищены как в проде; PIN опекуна по умолчанию `1234` (см. `src/lib/terminology.ts`). Данные опросов, журнал и уведомления хранятся в **localStorage** в браузере.

Визуальный язык: **светлый тёплый зелёный**, шрифт **Nunito** (Google Fonts; для prod можно self-host), объёмные кнопки (`KeyButton` / `KeyLink`), иконки **Lucide** + **BrandMark**. Без Framer Motion — CSS и `prefers-reduced-motion`.

## Локальный запуск

```bash
cd sites/ya-zhivoy
npm ci
npm run dev
```

Откройте **http://localhost:5173/** (корень — единственная точка входа).

## Скрипты

| Команда | Назначение |
|--------|------------|
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest (unit) |
| `npm run test:e2e` | Playwright (нужен предварительный `npm run build`; см. `playwright.config`) |
| `npm run test:e2e:install` | Установка браузера Chromium для Playwright |
| `npm run build` | `tsc -b` + Vite production |

## Сборка

```bash
npm run build
```

Артефакты: **`dist/index.html`** и `dist/assets/*`. Файл `public/.nojekyll` копируется в `dist` для GitHub Pages.

## Ссылка на основную презентацию (опционально)

При сборке задайте `VITE_PRESENTATION_URL` — на экране контактов появится ссылка «Презентация». Подробнее: [RELEASE-RUNBOOK.md](./RELEASE-RUNBOOK.md).

## Документы

- [IA-UX-GOALS.md](./IA-UX-GOALS.md) — IA и цели UX
- [TECH-ARCHITECTURE.md](./TECH-ARCHITECTURE.md) — стек и структура кода
- [RELEASE-RUNBOOK.md](./RELEASE-RUNBOOK.md) — деплой, smoke, откат

## Деплой

Корневой workflow `.github/workflows/deploy-github-pages.yml`: `lint`, `typecheck`, `test`, `build`, затем Playwright e2e, публикация `sites/ya-zhivoy/dist`.

Быстрый чек-лист для GitHub Pages:

1. В репозитории: **Settings → Pages → Source = GitHub Actions**.
2. Запустить workflow вручную (**Actions → Deploy to GitHub Pages → Run workflow**) или сделать push в `main/master`.
3. Дождаться job `deploy` и открыть URL из environment `github-pages`.

Примечание: `public/.nojekyll` добавляется в `dist`, чтобы Pages не пропускал статику с файлами/путями, чувствительными к Jekyll-обработке.

## Производительность

- Тяжёлые сцены подгружаются **лениво** (`React.lazy` в `YaZhivoyApp.tsx`).
- Для снижения нагрузки на слабых устройств: `prefers-reduced-transparency` отключает blur у нижней панели (`well-layout.css`).
