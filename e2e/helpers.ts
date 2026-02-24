import type { Page } from "@playwright/test";

/**
 * Recursively find an element by tag name through shadow DOM boundaries.
 * This JS string is evaluated in-page by page.evaluate().
 */
const FIND_IN_SHADOW = `
function findInShadow(root, tag) {
  if (root.querySelector(tag)) return root.querySelector(tag);
  for (const el of root.querySelectorAll("*")) {
    if (el.shadowRoot) {
      const found = findInShadow(el.shadowRoot, tag);
      if (found) return found;
    }
  }
  return null;
}
`;

/**
 * Wait for the Inhabit editor to fully load through HA's shadow DOM layers.
 * The editor panel is at /inhabit-editor.
 */
export async function waitForEditor(page: Page): Promise<void> {
  await page.goto("/inhabit-editor");
  await page.waitForLoadState("networkidle");

  // Wait until fpb-toolbar is rendered (deepest component we need)
  await page.waitForFunction(
    () => {
      const findInShadow = (
        root: Document | ShadowRoot,
        tag: string
      ): Element | null => {
        const direct = root.querySelector(tag);
        if (direct) return direct;
        for (const el of root.querySelectorAll("*")) {
          if (el.shadowRoot) {
            const found = findInShadow(el.shadowRoot, tag);
            if (found) return found;
          }
        }
        return null;
      };

      const toolbar = findInShadow(document, "fpb-toolbar");
      return !!toolbar?.shadowRoot;
    },
    { timeout: 20_000 }
  );
}

/**
 * Evaluate a function with the ha-floorplan-builder element as argument.
 */
export function editorEval<T>(
  page: Page,
  fn: (builder: Element) => T
): Promise<T> {
  return page.evaluate((fnStr) => {
    const findInShadow = (
      root: Document | ShadowRoot,
      tag: string
    ): Element | null => {
      const direct = root.querySelector(tag);
      if (direct) return direct;
      for (const el of root.querySelectorAll("*")) {
        if (el.shadowRoot) {
          const found = findInShadow(el.shadowRoot, tag);
          if (found) return found;
        }
      }
      return null;
    };

    const builder = findInShadow(document, "ha-floorplan-builder");
    if (!builder) throw new Error("ha-floorplan-builder not found");
    const f = new Function("builder", `return (${fnStr})(builder)`);
    return f(builder);
  }, fn.toString()) as Promise<T>;
}

/**
 * Evaluate a function with the fpb-toolbar element as argument.
 */
export function toolbarQuery<T>(
  page: Page,
  fn: (toolbar: Element) => T
): Promise<T> {
  return page.evaluate((fnStr) => {
    const findInShadow = (
      root: Document | ShadowRoot,
      tag: string
    ): Element | null => {
      const direct = root.querySelector(tag);
      if (direct) return direct;
      for (const el of root.querySelectorAll("*")) {
        if (el.shadowRoot) {
          const found = findInShadow(el.shadowRoot, tag);
          if (found) return found;
        }
      }
      return null;
    };

    const toolbar = findInShadow(document, "fpb-toolbar");
    if (!toolbar) throw new Error("fpb-toolbar not found");
    const f = new Function("toolbar", `return (${fnStr})(toolbar)`);
    return f(toolbar);
  }, fn.toString()) as Promise<T>;
}

/**
 * Click a button inside the toolbar's shadow root by CSS selector.
 */
export async function clickToolbarButton(
  page: Page,
  selector: string
): Promise<void> {
  await page.evaluate((sel) => {
    const findInShadow = (
      root: Document | ShadowRoot,
      tag: string
    ): Element | null => {
      const direct = root.querySelector(tag);
      if (direct) return direct;
      for (const el of root.querySelectorAll("*")) {
        if (el.shadowRoot) {
          const found = findInShadow(el.shadowRoot, tag);
          if (found) return found;
        }
      }
      return null;
    };

    const toolbar = findInShadow(document, "fpb-toolbar");
    if (!toolbar?.shadowRoot) throw new Error("fpb-toolbar not found");
    const el = toolbar.shadowRoot.querySelector(sel) as HTMLElement | null;
    if (!el) throw new Error(`Element not found in toolbar: ${sel}`);
    el.click();
  }, selector);
}
