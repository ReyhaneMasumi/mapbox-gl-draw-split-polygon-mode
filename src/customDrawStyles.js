const customDrawStyles = (defaultStyle) =>
  defaultStyle
    .map((style) => {
      if (style.id.endsWith("inactive")) {
        return {
          ...style,
          filter: [...style.filter, ["!=", "mode", "passing_mode_line_string"]],
        };
      }

      return style;
    })
    .concat([
      {
        id: "split-gl-draw-polygon-fill-active",
        type: "fill",
        filter: [
          "all",
          ["==", "active", "false"],
          ["==", "$type", "Polygon"],
          ["==", "mode", "passing_mode_line_string"],
        ],
        paint: {
          "fill-color": "#fbb03b",
          "fill-outline-color": "#fbb03b",
          "fill-opacity": 0.1,
        },
      },
      {
        id: "split-gl-draw-polygon-stroke-active",
        type: "line",
        filter: [
          "all",
          ["==", "active", "false"],
          ["==", "$type", "Polygon"],
          ["==", "mode", "passing_mode_line_string"],
        ],
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": "#fbb03b",
          "line-dasharray": [0.2, 2],
          "line-width": 2,
        },
      },
    ]);

export default customDrawStyles;
