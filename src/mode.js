import polygonSplitter from "polygon-splitter";

import { geojsonTypes, events } from "@mapbox/mapbox-gl-draw/src/constants";

import lineIntersect from "@turf/line-intersect";
import booleanDisjoint from "@turf/boolean-disjoint";
import lineOffset from "@turf/line-offset";
import lineToPolygon from "@turf/line-to-polygon";
import difference from "@turf/difference";
// import polygonToLine from "@turf/polygon-to-line";
// import union from "@turf/union";
// import polygonize from "@turf/polygonize";
import { lineString } from "@turf/helpers";

import {
  passingModeName,
  highlightPropertyName,
  defaultOptions,
} from "./constants";

const SplitPolygonMode = {};

SplitPolygonMode.onSetup = function (opt) {
  const {
    highlightColor = defaultOptions.highlightColor,
    lineWidth = defaultOptions.lineWidth,
    lineWidthUnit = defaultOptions.lineWidthUnit,
  } = opt || {};

  const state = {
    options: {
      highlightColor,
    },
    selectedFeatures: null,
  };

  /// `onSetup` job should complete for this mode to work.
  /// so `setTimeout` is used to bupass mode change after `onSetup` is done executing.
  setTimeout(this.magick.bind(this, state), 0);

  console.log("SplitPolygonMode.onSetup");

  return state;
};

SplitPolygonMode.magick = function (state) {
  console.log("SplitPolygonMode.magick");

  const selected = this.getSelected()
    .filter(
      (f) =>
        f.type === geojsonTypes.POLYGON || f.type === geojsonTypes.MULTI_POLYGON
    )
    .map((f) => f.toGeoJSON());

  state.selectedFeatures = selected;

  const api = this._ctx.api;

  const _this = this;
  if (selected.length === 0) {
    this.changeMode("select_feature", {
      onSelect(selectedFeatureID) {
        const f = api.get(selectedFeatureID);
        selected.push(f);
        console.log("🚀 ~ file: mode.js ~ line 64 ~ onSelect ~ onSelect");
        SplitPolygonMode.drawAndSplit.call(_this, state);
      },
    });
  } else {
    SplitPolygonMode.drawAndSplit.call(_this, state);
  }
};

SplitPolygonMode.drawAndSplit = function (state) {
  console.log("🚀 ~ file: mode.js ~ line 75 ~ drawAndSplit ~ state", state);
  const api = this._ctx.api;

  try {
    this.changeMode(passingModeName, {
      onDraw: (cuttingLineString) => {
        console.log(
          "🚀 ~ file: mode.js ~ line 81 ~ cuttingLineString",
          cuttingLineString
        );
        const allPoly = [];
        state.selectedFeatures.forEach((el) => {
          if (booleanDisjoint(el, cuttingLineString)) {
            throw new Error("Line must be outside of Polygon");
          } else {
            const polycut = polygonCut2(
              el.geometry,
              cuttingLineString.geometry,
              {
                // line_width: lineWidth,
                // line_width_unit: lineWidthUnit,
              }
            );
            polycut.id = el.id;
            api.add(polycut);
            allPoly.push(polycut);
          }
        });

        this.fireUpdate(allPoly);

        if (state.selectedFeatures?.[0]?.id)
          api.setFeatureProperty(
            state.selectedFeatures[0].id,
            highlightPropertyName,
            undefined
          );
      },
      onCancel: () => {
        if (state.selectedFeatures?.[0]?.id)
          api.setFeatureProperty(
            state.selectedFeatures[0].id,
            highlightPropertyName,
            undefined
          );
      },
    });
  } catch (err) {
    console.log("🚀 ~ file: mode.js ~ line 116 ~ err", err);
  }
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

SplitPolygonMode.onStop = function (state) {
  console.log("🚀 ~ file: mode.js ~ line 60 ~ onStop ~ state", state);
};

export default SplitPolygonMode;

// Adopted from https://gis.stackexchange.com/a/344277/145409
function polygonCut(poly, line, options) {
  const { line_width, line_width_unit } = options || {};

  const offsetLine = [];
  const retVal = null;
  let i, j, intersectPoints, forCut, forSelect;
  let thickLineString, thickLinePolygon, clipped;

  if (
    typeof line_width === "undefined" ||
    typeof line_width_unit === "undefined" ||
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
  offsetLine[0] = lineOffset(line, line_width / 2, {
    units: line_width_unit,
  });
  offsetLine[1] = lineOffset(line, -line_width / 2, {
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

function polygonCut2(poly, line) {
  return polygonSplitter(poly, line);
}
