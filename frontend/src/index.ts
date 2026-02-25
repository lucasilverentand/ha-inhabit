/**
 * Inhabit Floorplan Panel - Entry Point
 */

import { HaFloorplanPanel } from "./ha-floorplan-panel";

// Register the custom element
customElements.define("ha-floorplan-panel", HaFloorplanPanel);

// Export for module usage
export { HaFloorplanPanel };

// Declare the custom element for TypeScript
declare global {
  interface HTMLElementTagNameMap {
    "ha-floorplan-panel": HaFloorplanPanel;
  }
}
