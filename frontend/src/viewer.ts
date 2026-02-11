/**
 * Inhabit Floorplan Viewer - Panel Entry Point
 */

import { HaFloorplanViewer } from "./ha-floorplan-viewer";

// Register the custom element
customElements.define("ha-floorplan-viewer", HaFloorplanViewer);

// Export for module usage
export { HaFloorplanViewer };

// Declare the custom element for TypeScript
declare global {
  interface HTMLElementTagNameMap {
    "ha-floorplan-viewer": HaFloorplanViewer;
  }
}
