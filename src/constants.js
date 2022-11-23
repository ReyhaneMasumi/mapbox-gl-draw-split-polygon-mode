export const modeName = "split_polygon";

/// This mode uses the `mapbox-gl-draw-passing-mode` mode to draw the spilitting lineString.
/// here is the name used to add that mode:
export const passingModeName = `${modeName}_passing_draw_line_string`;

/// when a (multi-)polygon feature is selected to be splitted, it gets highlighted.
/// here is the name of the property indicating the highlight.
export const highlightPropertyName = `${modeName}_highlight`;

export const defaultOptions = {
  highlightColor: "#222",
  lineWidth: 0,
  lineWidthUnit: "kilometers",
  onSelectFeatureRequest() {
    throw new Error("no Feature is selected to split.");
  },
};
