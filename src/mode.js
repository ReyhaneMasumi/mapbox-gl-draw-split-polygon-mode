import { events } from "@mapbox/mapbox-gl-draw/src/constants";

import lineIntersect from "@turf/line-intersect";
import booleanDisjoint from "@turf/boolean-disjoint";
import { lineString } from "@turf/helpers";
import lineOffset from "@turf/line-offset";
import lineToPolygon from "@turf/line-to-polygon";
import difference from "@turf/difference";

import { passingModeName } from "./constants";

const SplitPolygonMode = {};

SplitPolygonMode.onSetup = function () {
  console.log(this);
  let main = this.getSelected()
    .filter((f) => f.type === "Polygon" || f.type === "MultiPolygon")
    .map((f) => f.toGeoJSON());

  // const api = this._ctx.api;
  // api.options.modes["passing_draw_line_string"] = passing_draw_line_string;

  setTimeout(() => {
    this.changeMode(passingModeName, (cuttingLineString) => {
      let allPoly = [];
      main.forEach((el) => {
        if (booleanDisjoint(el, cuttingLineString)) {
          throw new Error("Line must be outside of Polygon");
        } else {
          let polycut = polygonCut(
            el.geometry,
            cuttingLineString.geometry,
            "piece-"
          );
          polycut.id = el.id;
          this._ctx.api.add(polycut);
          allPoly.push(polycut);
        }
      });
      this.fireUpdate(allPoly);
    });
  }, 0);

  console.log("🚀 ~ file: mode.js ~ line 25 ~ main", main);

  const f = this._ctx.api.get(main[0].id);
  console.log("🚀 ~ file: mode.js ~ line 49 ~ f", f);

  if (main?.[0]?.id)
    this._ctx.store.setFeatureProperty(main[0].id, "highlight", "yes");

  return {
    main,
  };
};

SplitPolygonMode.toDisplayFeatures = function (state, geojson, display) {
  console.log("🚀 ~ file: mode.js ~ line 29 ~ geojson", geojson);
  display(geojson);
};

SplitPolygonMode.fireUpdate = function (newF) {
  this.map.fire(events.UPDATE, {
    action: "SplitPolygon",
    features: newF,
  });
};

SplitPolygonMode.onStop = function () {
  console.log("🚀 ~ file: mode.js ~ line 60 ~ onStop");
};

export default SplitPolygonMode;

// from https://gis.stackexchange.com/a/344277/145409
function polygonCut(poly, line, idPrefix) {
  const THICK_LINE_UNITS = "kilometers";
  const THICK_LINE_WIDTH = 0.001;
  var i, j, intersectPoints, forCut, forSelect;
  var thickLineString, thickLinePolygon, clipped;
  var polyCoords = [];
  var offsetLine = [];
  var retVal = null;

  if (
    (poly.type != "Polygon" && poly.type != "MultiPolygon") ||
    line.type != "LineString"
  ) {
    return retVal;
  }

  if (typeof idPrefix === "undefined") {
    idPrefix = "";
  }

  intersectPoints = lineIntersect(poly, line);
  if (intersectPoints.features.length == 0) {
    return retVal;
  }

  if (booleanDisjoint(line, poly)) {
    return retVal;
  }

  offsetLine[0] = lineOffset(line, THICK_LINE_WIDTH, {
    units: THICK_LINE_UNITS,
  });
  offsetLine[1] = lineOffset(line, -THICK_LINE_WIDTH, {
    units: THICK_LINE_UNITS,
  });

  for (i = 0; i <= 1; i++) {
    forCut = i;
    forSelect = (i + 1) % 2;
    polyCoords = [];
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
