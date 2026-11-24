import { defineConfig } from 'steiger';
import fsd from '@feature-sliced/steiger-plugin';

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // Виджеты-блоки подключаются в конструктор динамически (поле type в layout.json → реестр в pages/home),
    // поэтому статический подсчёт «сколько мест использует слайс» даёт ложные срабатывания.
    // Остальные правила FSD (границы слоёв, публичный API, именование) остаются строгими.
    rules: { 'fsd/insignificant-slice': 'off' },
  },
  {
    // тесты лежат рядом с кодом, это нормально
    files: ['./src/**/*.spec.ts'],
    rules: { 'fsd/public-api': 'off' },
  },
]);
