import {
  modeName,
  highlightPropertyName as _highlightPropertyName,
} from "./constants";

const highlightPropertyName = `user_${_highlightPropertyName}`;

const customDrawStyles = (defaultStyle) =>
  defaultStyle
    .map((style) => {
      if (style.id.endsWith("inactive")) {
        return {
          ...style,
          /// here "!has" is used cause the gl-draw supported that instead of ['!', ['has', ...]]
          filter: [...style.filter, ["!has", highlightPropertyName]],
        };
      }

      return style;
    })
    .concat([
      {
        id: `${modeName}-fill-active`,
        type: "fill",
        filter: [
          "all",
          ["==", "active", "false"],
          ["==", "$type", "Polygon"],
          ["has", highlightPropertyName],
        ],
        paint: {
          "fill-color": ["get", highlightPropertyName],
          "fill-outline-color": ["get", highlightPropertyName],
          "fill-opacity": 0.1,
        },
      },
      {
        id: `${modeName}-stroke-active`,
        type: "line",
        filter: [
          "all",
          ["==", "active", "false"],
          ["==", "$type", "Polygon"],
          ["has", highlightPropertyName],
        ],
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": ["get", highlightPropertyName],
          "line-dasharray": [0.2, 2],
          "line-width": 2,
        },
      },
    ]);

export default customDrawStyles;
