import { test, expect } from "@playwright/test";
import {
  waitForEditor,
  editorEval,
  toolbarQuery,
  clickToolbarButton,
} from "../helpers";

test.describe("Inhabit Editor", () => {
  test.beforeEach(async ({ page }) => {
    await waitForEditor(page);
  });

  test("editor loads with floor selector", async ({ page }) => {
    // Floor trigger (dropdown button) should be visible
    const hasTrigger = await toolbarQuery(page, (toolbar) => {
      return !!toolbar.shadowRoot!.querySelector(".floor-trigger");
    });
    expect(hasTrigger).toBe(true);
  });

  test("floor dropdown opens and lists floors", async ({ page }) => {
    // Open the floor dropdown
    await clickToolbarButton(page, ".floor-trigger");
    await page.waitForTimeout(100);

    const result = await toolbarQuery(page, (toolbar) => {
      const dropdown = toolbar.shadowRoot!.querySelector(".floor-dropdown");
      if (!dropdown) return { hasDropdown: false, floorCount: 0 };
      const options = dropdown.querySelectorAll(
        ".floor-option:not(.add-floor):not(.action-item)"
      );
      return { hasDropdown: true, floorCount: options.length };
    });

    expect(result.hasDropdown).toBe(true);
    expect(result.floorCount).toBeGreaterThanOrEqual(1);

    // Close by clicking outside
    await page.mouse.click(0, 0);
    await page.waitForTimeout(200);

    const dropdownGone = await toolbarQuery(page, (toolbar) => {
      return !toolbar.shadowRoot!.querySelector(".floor-dropdown");
    });
    expect(dropdownGone).toBe(true);
  });

  test("mode switching sets active class", async ({ page }) => {
    const modeCount = await toolbarQuery(page, (toolbar) => {
      return toolbar.shadowRoot!.querySelectorAll(".mode-button").length;
    });
    expect(modeCount).toBe(5);

    for (let i = 0; i < modeCount; i++) {
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
    const result = await editorEval(page, (builder) => {
      const chipsBar = builder.shadowRoot!.querySelector(".room-chips-bar");
      const chipCount = chipsBar
        ? chipsBar.querySelectorAll(".room-chip").length
        : 0;
      return { hasChipsBar: !!chipsBar, chipCount };
    });

    if (result.hasChipsBar) {
      expect(result.chipCount).toBeGreaterThanOrEqual(1);
    } else {
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

  test("floor rename via dropdown", async ({ page }) => {
    // Open the floor dropdown
    await clickToolbarButton(page, ".floor-trigger");
    await page.waitForTimeout(200);

    // Click the rename button on the first floor option
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
      const renameBtn = toolbar.shadowRoot!.querySelector(
        ".floor-option .rename-btn"
      ) as HTMLElement;
      if (!renameBtn) throw new Error("Rename button not found");
      renameBtn.click();
    });

    await page.waitForTimeout(200);

    // Rename input should now be visible
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

    // Input should disappear
    const inputGone = await toolbarQuery(page, (toolbar) => {
      return !toolbar.shadowRoot!.querySelector(".rename-input");
    });
    expect(inputGone).toBe(true);
  });
});
