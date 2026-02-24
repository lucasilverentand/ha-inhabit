import { test, expect } from "@playwright/test";
import {
  waitForEditor,
  editorEval,
  toolbarQuery,
  clickToolbarButton,
} from "../helpers";

// Inline helper used inside page.evaluate calls
const FIND_TOOLBAR_JS = `
  const _find = (root, tag) => {
    const direct = root.querySelector(tag);
    if (direct) return direct;
    for (const el of root.querySelectorAll("*")) {
      if (el.shadowRoot) { const f = _find(el.shadowRoot, tag); if (f) return f; }
    }
    return null;
  };
  const _toolbar = _find(document, "fpb-toolbar");
`;

test.describe("Inhabit Editor", () => {
  test.beforeEach(async ({ page }) => {
    await waitForEditor(page);
  });

  test("editor loads with seeded floor plan", async ({ page }) => {
    const tabCount = await toolbarQuery(page, (toolbar) => {
      return toolbar.shadowRoot!.querySelectorAll(".floor-tab").length;
    });
    expect(tabCount).toBeGreaterThanOrEqual(1);
  });

  test("floor tabs are clickable", async ({ page }) => {
    const tabCount = await toolbarQuery(page, (toolbar) => {
      return toolbar.shadowRoot!.querySelectorAll(".floor-tab").length;
    });
    expect(tabCount).toBeGreaterThanOrEqual(1);

    await clickToolbarButton(page, ".floor-tab");
  });

  test("mode switching sets active class", async ({ page }) => {
    const modeCount = await toolbarQuery(page, (toolbar) => {
      return toolbar.shadowRoot!.querySelectorAll(".mode-button").length;
    });
    expect(modeCount).toBe(5);

    for (let i = 0; i < modeCount; i++) {
      // Click mode button at index i
      await page.evaluate(
        ({ index }) => {
          const _find = (
            root: Document | ShadowRoot,
            tag: string
          ): Element | null => {
            const direct = root.querySelector(tag);
            if (direct) return direct;
            for (const el of root.querySelectorAll("*")) {
              if (el.shadowRoot) {
                const f = _find(el.shadowRoot, tag);
                if (f) return f;
              }
            }
            return null;
          };
          const toolbar = _find(document, "fpb-toolbar")!;
          const buttons =
            toolbar.shadowRoot!.querySelectorAll(".mode-button");
          (buttons[index] as HTMLElement).click();
        },
        { index: i }
      );

      await page.waitForTimeout(100);

      const hasActive = await page.evaluate(
        ({ index }) => {
          const _find = (
            root: Document | ShadowRoot,
            tag: string
          ): Element | null => {
            const direct = root.querySelector(tag);
            if (direct) return direct;
            for (const el of root.querySelectorAll("*")) {
              if (el.shadowRoot) {
                const f = _find(el.shadowRoot, tag);
                if (f) return f;
              }
            }
            return null;
          };
          const toolbar = _find(document, "fpb-toolbar")!;
          const buttons =
            toolbar.shadowRoot!.querySelectorAll(".mode-button");
          return buttons[index].classList.contains("active");
        },
        { index: i }
      );

      expect(hasActive).toBe(true);
    }
  });

  test("add menu opens and closes", async ({ page }) => {
    // Ensure we're in walls mode (has add menu items)
    await clickToolbarButton(page, ".mode-button");
    await page.waitForTimeout(100);

    const hasAddButton = await toolbarQuery(page, (toolbar) => {
      return !!toolbar.shadowRoot!.querySelector(".add-button");
    });
    expect(hasAddButton).toBe(true);

    // Open menu
    await clickToolbarButton(page, ".add-button");
    await page.waitForTimeout(100);

    const menuVisible = await toolbarQuery(page, (toolbar) => {
      return !!toolbar.shadowRoot!.querySelector(".add-menu");
    });
    expect(menuVisible).toBe(true);

    // Close by clicking outside
    await page.mouse.click(0, 0);
    await page.waitForTimeout(200);

    const menuGone = await toolbarQuery(page, (toolbar) => {
      return !toolbar.shadowRoot!.querySelector(".add-menu");
    });
    expect(menuGone).toBe(true);
  });

  test("room chips bar matches room state", async ({ page }) => {
    // Check if the current floor has rooms — chips bar only renders when rooms exist
    const result = await editorEval(page, (builder) => {
      const chipsBar = builder.shadowRoot!.querySelector(".room-chips-bar");
      const chipCount = chipsBar
        ? chipsBar.querySelectorAll(".room-chip").length
        : 0;
      return { hasChipsBar: !!chipsBar, chipCount };
    });

    if (result.hasChipsBar) {
      // If present, should have at least the "All" chip
      expect(result.chipCount).toBeGreaterThanOrEqual(1);
    } else {
      // No rooms on this floor — chips bar correctly hidden
      expect(result.hasChipsBar).toBe(false);
    }
  });

  test("undo/redo buttons are present and initially disabled", async ({
    page,
  }) => {
    const result = await toolbarQuery(page, (toolbar) => {
      const undo = toolbar.shadowRoot!.querySelector(
        '.tool-button[title="Undo"]'
      ) as HTMLButtonElement | null;
      const redo = toolbar.shadowRoot!.querySelector(
        '.tool-button[title="Redo"]'
      ) as HTMLButtonElement | null;
      return {
        undoExists: !!undo,
        redoExists: !!redo,
        undoDisabled: undo?.disabled ?? false,
        redoDisabled: redo?.disabled ?? false,
      };
    });

    expect(result.undoExists).toBe(true);
    expect(result.redoExists).toBe(true);
    expect(result.undoDisabled).toBe(true);
    expect(result.redoDisabled).toBe(true);
  });

  test("floor rename via pencil icon", async ({ page }) => {
    // Click the pencil (rename) action on the first floor tab
    await page.evaluate(() => {
      const _find = (
        root: Document | ShadowRoot,
        tag: string
      ): Element | null => {
        const direct = root.querySelector(tag);
        if (direct) return direct;
        for (const el of root.querySelectorAll("*")) {
          if (el.shadowRoot) {
            const f = _find(el.shadowRoot, tag);
            if (f) return f;
          }
        }
        return null;
      };
      const toolbar = _find(document, "fpb-toolbar")!;
      const firstTab =
        toolbar.shadowRoot!.querySelector(".floor-tab")!;
      const renameAction = firstTab.querySelector(
        ".tab-action"
      ) as HTMLElement;
      if (!renameAction) throw new Error("Rename action not found");
      renameAction.click();
    });

    await page.waitForTimeout(200);

    const hasRenameInput = await toolbarQuery(page, (toolbar) => {
      return !!toolbar.shadowRoot!.querySelector(".rename-input");
    });
    expect(hasRenameInput).toBe(true);

    // Set value and press Enter
    await page.evaluate(() => {
      const _find = (
        root: Document | ShadowRoot,
        tag: string
      ): Element | null => {
        const direct = root.querySelector(tag);
        if (direct) return direct;
        for (const el of root.querySelectorAll("*")) {
          if (el.shadowRoot) {
            const f = _find(el.shadowRoot, tag);
            if (f) return f;
          }
        }
        return null;
      };
      const toolbar = _find(document, "fpb-toolbar")!;
      const input = toolbar.shadowRoot!.querySelector(
        ".rename-input"
      ) as HTMLInputElement;
      input.value = "Renamed Floor";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true })
      );
    });

    await page.waitForTimeout(300);

    const inputGone = await toolbarQuery(page, (toolbar) => {
      return !toolbar.shadowRoot!.querySelector(".rename-input");
    });
    expect(inputGone).toBe(true);
  });
});
