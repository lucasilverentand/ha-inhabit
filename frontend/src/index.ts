/**
 * Inhabit Floor Plan Builder - Panel Entry Point
 */

import { HaFloorplanBuilder } from "./ha-floorplan-builder";

// Register the custom element
customElements.define("ha-floorplan-builder", HaFloorplanBuilder);

// Export for module usage
export { HaFloorplanBuilder };

// Declare the custom element for TypeScript
declare global {
  interface HTMLElementTagNameMap {
    "ha-floorplan-builder": HaFloorplanBuilder;
  }
}
