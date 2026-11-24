/**
 * Файл блока в CMS (blocks/<id>.json): у всех блоков одинаковая форма.
 * `serverTime` в проде присылает CMS, чтобы ротация и статусы считались по часам сервера.
 */
export interface BlockPayload {
  settings?: Record<string, unknown>;
  content?: Record<string, unknown>;
  serverTime?: string;
}
