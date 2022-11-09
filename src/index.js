import { default as splitPolygonMode } from "./mode.js";
import { default as drawStyles } from "./customDrawStyles.js";

import { passing_draw_line_string } from "mapbox-gl-draw-passing-mode";
import { passingModeName } from "./constants";

export { splitPolygonMode };
export { drawStyles };

export default function SplitPolygonMode(modes) {
  return {
    ...modes,
    [passingModeName]: passing_draw_line_string,
    splitPolygonMode,
  };
}
