import { default as splitPolygonMode } from "./mode.js";
import { default as DrawStyles } from "./customDrawStyles.js";

import { passing_draw_line_string } from "mapbox-gl-draw-passing-mode";

export { splitPolygonMode };
export { DrawStyles };

export default function SplitPolygonMode(modes) {
  return {
    ...modes,
    splitPolygonMode__passing_draw_line_string: passing_draw_line_string,
    splitPolygonMode,
  };
}
