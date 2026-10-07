/** Lightweight TODO helpers — safe to import anywhere (no content, no zod). */

export const TODO_PREFIX = "TODO:";

export const isTodo = (value: unknown): value is string =>
  typeof value === "string" && value.startsWith(TODO_PREFIX);

export const isProduction = process.env.NODE_ENV === "production";

/** True when `value` should be rendered: real content always, TODOs only in dev. */
export const shouldRender = (value: unknown) => !(isProduction && isTodo(value));

export type TodoItem = { path: string; text: string };

export function collectTodos(value: unknown, path: string): TodoItem[] {
  if (isTodo(value)) return [{ path, text: value }];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectTodos(item, `${path}[${index}]`));
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) => collectTodos(item, `${path}.${key}`));
  }
  return [];
}
