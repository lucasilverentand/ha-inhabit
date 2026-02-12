/**
 * SVG furniture shape renderers for top-down architectural floor plan visualizations.
 * Each furniture type has configurable part colors AND numeric proportions (parametric).
 */

import { svg, type TemplateResult } from "lit";

export interface FurniturePart {
  key: string;
  label: string;
  type: "color" | "number";
  default: string | number;
  min?: number;
  max?: number;
  step?: number;
}

export interface BBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

type StyleMap = Record<string, string | number>;

const PART_DEFS: Record<string, FurniturePart[]> = {
  bed: [
    { key: "frame", label: "Frame", type: "color", default: "#8d6e63" },
    { key: "headboard", label: "Headboard", type: "color", default: "#6d4c41" },
    { key: "pillow", label: "Pillow", type: "color", default: "#e8e8e8" },
    { key: "sheet", label: "Sheet", type: "color", default: "#bbdefb" },
    { key: "headboard_height", label: "Headboard Height", type: "number", default: 0.12, min: 0.04, max: 0.3, step: 0.02 },
    { key: "pillow_height", label: "Pillow Height", type: "number", default: 0.14, min: 0.05, max: 0.3, step: 0.02 },
    { key: "pillow_gap", label: "Pillow Gap", type: "number", default: 0.06, min: 0, max: 0.2, step: 0.02 },
    { key: "pillow_inset", label: "Pillow Inset", type: "number", default: 0.08, min: 0.02, max: 0.2, step: 0.02 },
  ],
  couch: [
    { key: "frame", label: "Frame", type: "color", default: "#8d6e63" },
    { key: "backrest", label: "Backrest", type: "color", default: "#795548" },
    { key: "seat", label: "Seat", type: "color", default: "#a1887f" },
    { key: "arm", label: "Arms", type: "color", default: "#6d4c41" },
    { key: "backrest_depth", label: "Backrest Depth", type: "number", default: 0.22, min: 0.1, max: 0.4, step: 0.02 },
    { key: "arm_width", label: "Arm Width", type: "number", default: 0.12, min: 0.05, max: 0.25, step: 0.02 },
    { key: "seat_inset", label: "Seat Inset", type: "number", default: 1.5, min: 0, max: 5, step: 0.5 },
  ],
  table: [
    { key: "top", label: "Top", type: "color", default: "#d7ccc8" },
    { key: "border", label: "Border", type: "color", default: "#8d6e63" },
    { key: "border_inset", label: "Border Inset", type: "number", default: 0.08, min: 0.02, max: 0.2, step: 0.02 },
  ],
  desk: [
    { key: "top", label: "Top", type: "color", default: "#d7ccc8" },
    { key: "border", label: "Border", type: "color", default: "#8d6e63" },
    { key: "legspace", label: "Legspace", type: "color", default: "#efebe9" },
    { key: "legspace_height", label: "Legspace Height", type: "number", default: 0.3, min: 0.1, max: 0.5, step: 0.05 },
    { key: "legspace_inset", label: "Legspace Inset", type: "number", default: 0.15, min: 0.05, max: 0.35, step: 0.05 },
  ],
  chair: [
    { key: "seat", label: "Seat", type: "color", default: "#bcaaa4" },
    { key: "backrest", label: "Backrest", type: "color", default: "#8d6e63" },
    { key: "seat_radius", label: "Seat Radius", type: "number", default: 0.38, min: 0.2, max: 0.48, step: 0.02 },
    { key: "backrest_width", label: "Backrest Width", type: "number", default: 0.6, min: 0.3, max: 0.9, step: 0.05 },
    { key: "backrest_height", label: "Backrest Height", type: "number", default: 0.18, min: 0.08, max: 0.3, step: 0.02 },
  ],
  wardrobe: [
    { key: "body", label: "Body", type: "color", default: "#a1887f" },
    { key: "door_line", label: "Door Line", type: "color", default: "#6d4c41" },
    { key: "handle", label: "Handle", type: "color", default: "#4e342e" },
    { key: "handle_size", label: "Handle Size", type: "number", default: 0.04, min: 0.02, max: 0.08, step: 0.01 },
    { key: "handle_offset", label: "Handle Offset", type: "number", default: 3, min: 1.5, max: 5, step: 0.5 },
  ],
  bookcase: [
    { key: "body", label: "Body", type: "color", default: "#a1887f" },
    { key: "shelf", label: "Shelves", type: "color", default: "#6d4c41" },
    { key: "shelf_count", label: "Shelf Count", type: "number", default: 4, min: 1, max: 8, step: 1 },
  ],
  kitchen: [
    { key: "counter", label: "Counter", type: "color", default: "#e0e0e0" },
    { key: "sink", label: "Sink", type: "color", default: "#90a4ae" },
    { key: "burner", label: "Burners", type: "color", default: "#424242" },
    { key: "sink_x", label: "Sink Position", type: "number", default: 0.28, min: 0.1, max: 0.45, step: 0.02 },
    { key: "sink_radius", label: "Sink Radius", type: "number", default: 0.15, min: 0.08, max: 0.25, step: 0.02 },
    { key: "burner_area_x", label: "Burner Area X", type: "number", default: 0.55, min: 0.4, max: 0.75, step: 0.05 },
    { key: "burner_radius", label: "Burner Radius", type: "number", default: 0.2, min: 0.1, max: 0.35, step: 0.02 },
    { key: "burner_spread", label: "Burner Spread", type: "number", default: 0.28, min: 0.15, max: 0.45, step: 0.02 },
  ],
  custom: [
    { key: "fill", label: "Fill", type: "color", default: "#e0e0e0" },
    { key: "pattern", label: "Pattern", type: "color", default: "#bdbdbd" },
    { key: "hatch_density", label: "Hatch Density", type: "number", default: 0.2, min: 0.08, max: 0.5, step: 0.02 },
  ],
};

export function getFurnitureParts(type: string): FurniturePart[] {
  return PART_DEFS[type] ?? PART_DEFS.custom;
}

export function getDefaultStyle(type: string): StyleMap {
  const parts = getFurnitureParts(type);
  const style: StyleMap = {};
  for (const p of parts) {
    style[p.key] = p.default;
  }
  return style;
}

function resolve(style: StyleMap | undefined, type: string): StyleMap {
  const defaults = getDefaultStyle(type);
  if (!style) return defaults;
  return { ...defaults, ...style };
}

/** Helper to read a numeric param from the style map with fallback. */
function num(s: StyleMap, key: string, fallback: number): number {
  const v = s[key];
  return typeof v === "number" ? v : fallback;
}

/** Helper to read a color string from the style map. */
function col(s: StyleMap, key: string): string {
  const v = s[key];
  return typeof v === "string" ? v : "#888";
}

// ─── Individual shape renderers ──────────────────────────────

function renderBed(b: BBox, s: StyleMap): TemplateResult {
  const headH = b.h * num(s, "headboard_height", 0.12);
  const pillowH = b.h * num(s, "pillow_height", 0.14);
  const pillowPad = b.w * num(s, "pillow_inset", 0.08);
  const pillowGap = b.w * num(s, "pillow_gap", 0.06);
  const pillowW = (b.w - 2 * pillowPad - pillowGap) / 2;
  const pillowY = b.y + headH + b.h * 0.04;
  const pillowR = Math.min(pillowW, pillowH) * 0.25;

  return svg`
    <rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="2" fill="${col(s, "sheet")}" stroke="${col(s, "frame")}" stroke-width="1.5"/>
    <rect x="${b.x}" y="${b.y}" width="${b.w}" height="${headH}" rx="2" fill="${col(s, "headboard")}"/>
    <rect x="${b.x + pillowPad}" y="${pillowY}" width="${pillowW}" height="${pillowH}" rx="${pillowR}" fill="${col(s, "pillow")}" stroke="${col(s, "frame")}" stroke-width="0.5"/>
    <rect x="${b.x + pillowPad + pillowW + pillowGap}" y="${pillowY}" width="${pillowW}" height="${pillowH}" rx="${pillowR}" fill="${col(s, "pillow")}" stroke="${col(s, "frame")}" stroke-width="0.5"/>
  `;
}

function renderCouch(b: BBox, s: StyleMap): TemplateResult {
  const backH = b.h * num(s, "backrest_depth", 0.22);
  const armW = b.w * num(s, "arm_width", 0.12);
  const seatPad = num(s, "seat_inset", 1.5);

  return svg`
    <rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="3" fill="${col(s, "seat")}" stroke="${col(s, "frame")}" stroke-width="1.5"/>
    <rect x="${b.x}" y="${b.y}" width="${b.w}" height="${backH}" rx="3" fill="${col(s, "backrest")}"/>
    <rect x="${b.x}" y="${b.y}" width="${armW}" height="${b.h}" rx="3" fill="${col(s, "arm")}"/>
    <rect x="${b.x + b.w - armW}" y="${b.y}" width="${armW}" height="${b.h}" rx="3" fill="${col(s, "arm")}"/>
    <rect x="${b.x + armW + seatPad}" y="${b.y + backH + seatPad}" width="${b.w - 2 * armW - 2 * seatPad}" height="${b.h - backH - 2 * seatPad}" rx="2" fill="${col(s, "seat")}" opacity="0.6"/>
  `;
}

function renderTable(b: BBox, s: StyleMap): TemplateResult {
  const inset = Math.min(b.w, b.h) * num(s, "border_inset", 0.08);
  return svg`
    <rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="2" fill="${col(s, "top")}" stroke="${col(s, "border")}" stroke-width="1.5"/>
    <rect x="${b.x + inset}" y="${b.y + inset}" width="${b.w - 2 * inset}" height="${b.h - 2 * inset}" rx="1" fill="none" stroke="${col(s, "border")}" stroke-width="0.5" opacity="0.4"/>
  `;
}

function renderDesk(b: BBox, s: StyleMap): TemplateResult {
  const legH = b.h * num(s, "legspace_height", 0.3);
  const legInset = b.w * num(s, "legspace_inset", 0.15);
  return svg`
    <rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="2" fill="${col(s, "top")}" stroke="${col(s, "border")}" stroke-width="1.5"/>
    <rect x="${b.x + legInset}" y="${b.y + b.h - legH}" width="${b.w - 2 * legInset}" height="${legH}" rx="1" fill="${col(s, "legspace")}" opacity="0.5"/>
  `;
}

function renderChair(b: BBox, s: StyleMap): TemplateResult {
  const seatR = Math.min(b.w, b.h) * num(s, "seat_radius", 0.38);
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2 + b.h * 0.05;
  const backW = b.w * num(s, "backrest_width", 0.6);
  const backH = b.h * num(s, "backrest_height", 0.18);
  const backY = b.y + b.h * 0.02;

  return svg`
    <circle cx="${cx}" cy="${cy}" r="${seatR}" fill="${col(s, "seat")}" stroke="${col(s, "backrest")}" stroke-width="1"/>
    <rect x="${cx - backW / 2}" y="${backY}" width="${backW}" height="${backH}" rx="${backH / 2}" fill="${col(s, "backrest")}"/>
  `;
}

function renderWardrobe(b: BBox, s: StyleMap): TemplateResult {
  const handleR = Math.min(b.w, b.h) * num(s, "handle_size", 0.04);
  const handleOff = num(s, "handle_offset", 3);
  const midX = b.x + b.w / 2;
  const handleY = b.y + b.h / 2;

  return svg`
    <rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="2" fill="${col(s, "body")}" stroke="${col(s, "door_line")}" stroke-width="1.5"/>
    <line x1="${midX}" y1="${b.y + 2}" x2="${midX}" y2="${b.y + b.h - 2}" stroke="${col(s, "door_line")}" stroke-width="1"/>
    <circle cx="${midX - handleR * handleOff}" cy="${handleY}" r="${handleR}" fill="${col(s, "handle")}"/>
    <circle cx="${midX + handleR * handleOff}" cy="${handleY}" r="${handleR}" fill="${col(s, "handle")}"/>
  `;
}

function renderBookcase(b: BBox, s: StyleMap): TemplateResult {
  const shelfCount = Math.round(num(s, "shelf_count", 4));
  const gap = b.h / (shelfCount + 1);
  const shelves = [];
  for (let i = 1; i <= shelfCount; i++) {
    const sy = b.y + gap * i;
    shelves.push(svg`<line x1="${b.x + 2}" y1="${sy}" x2="${b.x + b.w - 2}" y2="${sy}" stroke="${col(s, "shelf")}" stroke-width="1.2"/>`);
  }
  return svg`
    <rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="2" fill="${col(s, "body")}" stroke="${col(s, "shelf")}" stroke-width="1.5"/>
    ${shelves}
  `;
}

function renderKitchen(b: BBox, s: StyleMap): TemplateResult {
  const sinkX = num(s, "sink_x", 0.28);
  const sinkRadius = num(s, "sink_radius", 0.15);
  const burnerAreaX = num(s, "burner_area_x", 0.55);
  const burnerR = num(s, "burner_radius", 0.2);
  const burnerSpread = num(s, "burner_spread", 0.28);

  const sinkCx = b.x + b.w * sinkX;
  const sinkCy = b.y + b.h * 0.5;
  const sinkR = Math.min(b.w * sinkRadius, b.h * 0.28);

  const burnerArea = { x: b.x + b.w * burnerAreaX, y: b.y + b.h * 0.15, w: b.w * 0.38, h: b.h * 0.7 };
  const br = Math.min(burnerArea.w, burnerArea.h) * burnerR;
  const bOffX = burnerArea.w * burnerSpread;
  const bOffY = burnerArea.h * burnerSpread;
  const bCx = burnerArea.x + burnerArea.w / 2;
  const bCy = burnerArea.y + burnerArea.h / 2;

  return svg`
    <rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="2" fill="${col(s, "counter")}" stroke="#9e9e9e" stroke-width="1.5"/>
    <circle cx="${sinkCx}" cy="${sinkCy}" r="${sinkR}" fill="none" stroke="${col(s, "sink")}" stroke-width="1.5"/>
    <circle cx="${sinkCx}" cy="${sinkCy}" r="${sinkR * 0.35}" fill="${col(s, "sink")}" opacity="0.4"/>
    <circle cx="${bCx - bOffX}" cy="${bCy - bOffY}" r="${br}" fill="none" stroke="${col(s, "burner")}" stroke-width="1.2"/>
    <circle cx="${bCx + bOffX}" cy="${bCy - bOffY}" r="${br}" fill="none" stroke="${col(s, "burner")}" stroke-width="1.2"/>
    <circle cx="${bCx - bOffX}" cy="${bCy + bOffY}" r="${br}" fill="none" stroke="${col(s, "burner")}" stroke-width="1.2"/>
    <circle cx="${bCx + bOffX}" cy="${bCy + bOffY}" r="${br}" fill="none" stroke="${col(s, "burner")}" stroke-width="1.2"/>
  `;
}

function renderCustom(b: BBox, s: StyleMap): TemplateResult {
  const density = num(s, "hatch_density", 0.2);
  const step = Math.max(Math.min(b.w, b.h) * density, 4);
  const lines = [];
  const maxDim = b.w + b.h;
  for (let d = step; d < maxDim; d += step) {
    const x1 = b.x + Math.min(d, b.w);
    const y1 = b.y + Math.max(0, d - b.w);
    const x2 = b.x + Math.max(0, d - b.h);
    const y2 = b.y + Math.min(d, b.h);
    lines.push(svg`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col(s, "pattern")}" stroke-width="0.8" opacity="0.5"/>`);
  }
  return svg`
    <rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="2" fill="${col(s, "fill")}" stroke="${col(s, "pattern")}" stroke-width="1.5"/>
    ${lines}
  `;
}

const RENDERERS: Record<string, (b: BBox, s: StyleMap) => TemplateResult> = {
  bed: renderBed,
  couch: renderCouch,
  table: renderTable,
  desk: renderDesk,
  chair: renderChair,
  wardrobe: renderWardrobe,
  bookcase: renderBookcase,
  kitchen: renderKitchen,
  custom: renderCustom,
};

/**
 * Render a top-down SVG furniture shape inside the given bounding box.
 * @param type Furniture type key
 * @param bbox Bounding box {x, y, w, h} in SVG coordinates
 * @param style Optional per-part color and numeric param overrides
 * @param rotation Degrees to rotate around bbox center
 */
export function renderFurnitureShape(
  type: string,
  bbox: BBox,
  style?: StyleMap,
  rotation?: number,
): TemplateResult {
  const resolved = resolve(style, type);
  const renderer = RENDERERS[type] ?? RENDERERS.custom;
  const inner = renderer(bbox, resolved);

  if (rotation) {
    const cx = bbox.x + bbox.w / 2;
    const cy = bbox.y + bbox.h / 2;
    return svg`<g transform="rotate(${rotation}, ${cx}, ${cy})">${inner}</g>`;
  }
  return inner;
}
