import { geojsonTypes, events } from "@mapbox/mapbox-gl-draw/src/constants";

import lineIntersect from "@turf/line-intersect";
import booleanDisjoint from "@turf/boolean-disjoint";
import lineOffset from "@turf/line-offset";
import lineToPolygon from "@turf/line-to-polygon";
import difference from "@turf/difference";
import { lineString } from "@turf/helpers";

import {
  passingModeName,
  highlightPropertyName,
  defaultOptions,
} from "./constants";

const SplitPolygonMode = {};

SplitPolygonMode.onSetup = function (opt) {
  const { highlightColor, lineWidth, lineWidthUnit } = opt || {};

  const main = this.getSelected()
    .filter(
      (f) =>
        f.type === geojsonTypes.POLYGON || f.type === geojsonTypes.MULTI_POLYGON
    )
    .map((f) => f.toGeoJSON());

  const api = this._ctx.api;

  /// `onSetup` job should complete for this mode to work.
  /// so `setTimeout` is used to bupass mode change after `onSetup` is done executing.
  setTimeout(() => {
    this.changeMode(passingModeName, {
      onDraw: (cuttingLineString) => {
        const allPoly = [];
        main.forEach((el) => {
          if (booleanDisjoint(el, cuttingLineString)) {
            throw new Error("Line must be outside of Polygon");
          } else {
            const polycut = polygonCut(
              el.geometry,
              cuttingLineString.geometry,
              {
                line_width: lineWidth,
                line_width_unit: lineWidthUnit,
              }
            );
            polycut.id = el.id;
            api.add(polycut);
            allPoly.push(polycut);
          }
        });

        this.fireUpdate(allPoly);

        if (main?.[0]?.id)
          api.setFeatureProperty(main[0].id, highlightPropertyName, undefined);
      },
      onCancel: () => {
        if (main?.[0]?.id)
          api.setFeatureProperty(main[0].id, highlightPropertyName, undefined);
      },
    });
  }, 0);

  if (main?.[0]?.id)
    api.setFeatureProperty(
      main[0].id,
      highlightPropertyName,
      highlightColor || defaultOptions.highlightColor
    );

  return {
    main,
  };
};

SplitPolygonMode.toDisplayFeatures = function (state, geojson, display) {
  display(geojson);
};

SplitPolygonMode.fireUpdate = function (newF) {
  this.map.fire(events.UPDATE, {
    action: "SplitPolygon",
    features: newF,
  });
};

// SplitPolygonMode.onStop = function ({ main }) {
//   console.log("🚀 ~ file: mode.js ~ line 60 ~ onStop");
// };

export default SplitPolygonMode;

// Adopted from https://gis.stackexchange.com/a/344277/145409
function polygonCut(poly, line, options) {
  const {
    line_width = defaultOptions.line_width,
    line_width_unit = defaultOptions.line_width_unit,
  } = options || {};

  const offsetLine = [];
  const retVal = null;
  let i, j, intersectPoints, forCut, forSelect;
  let thickLineString, thickLinePolygon, clipped;

  if (
    (poly.type != geojsonTypes.POLYGON &&
      poly.type != geojsonTypes.MULTI_POLYGON) ||
    line.type != geojsonTypes.LINE_STRING
  ) {
    return retVal;
  }

  /// if line and polygon don't intersect return.
  if (booleanDisjoint(line, poly)) {
    return retVal;
  }

  intersectPoints = lineIntersect(poly, line);
  if (intersectPoints.features.length === 0) {
    return retVal;
  }

  /// Creating two new lines at sides of the splitting lineString
  offsetLine[0] = lineOffset(line, line_width, {
    units: line_width_unit,
  });
  offsetLine[1] = lineOffset(line, -line_width, {
    units: line_width_unit,
  });

  for (i = 0; i <= 1; i++) {
    forCut = i;
    forSelect = (i + 1) % 2;
    const polyCoords = [];
    for (j = 0; j < line.coordinates.length; j++) {
      polyCoords.push(line.coordinates[j]);
    }
    for (j = offsetLine[forCut].geometry.coordinates.length - 1; j >= 0; j--) {
      polyCoords.push(offsetLine[forCut].geometry.coordinates[j]);
    }
    polyCoords.push(line.coordinates[0]);

    thickLineString = lineString(polyCoords);
    thickLinePolygon = lineToPolygon(thickLineString);
    clipped = difference(poly, thickLinePolygon);
  }

  return clipped;
}
