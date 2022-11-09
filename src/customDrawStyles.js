import { passingModeName } from "./constants";

const customDrawStyles = (defaultStyle) =>
  defaultStyle
    .map((style) => {
      if (style.id.endsWith("inactive")) {
        return {
          ...style,
          filter: [...style.filter, ["!=", "user_highlight", "yes"]],
        };
      }

      return style;
    })
    .concat([
      {
        id: "splitpolygon-fill-active",
        type: "fill",
        filter: [
          "all",
          ["==", "active", "false"],
          ["==", "$type", "Polygon"],
          ["==", "user_highlight", "yes"],
        ],
        paint: {
          "fill-color": "#fbb03b",
          "fill-outline-color": "#fbb03b",
          "fill-opacity": 0.1,
        },
      },
      {
        id: "splitpolygon-stroke-active",
        type: "line",
        filter: [
          "all",
          ["==", "active", "false"],
          ["==", "$type", "Polygon"],
          ["==", "user_highlight", "yes"],
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
