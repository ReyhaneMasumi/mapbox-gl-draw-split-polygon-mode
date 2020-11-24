import lineIntersect from "@turf/line-intersect";
// import booleanWithin from "@turf/boolean-within";
import booleanDisjoint from "@turf/boolean-disjoint";
// import { getCoords } from "@turf/invariant";
import { lineString, polygon, featureCollection } from "@turf/helpers";
import lineOffset from "@turf/line-offset";
import lineToPolygon from "@turf/line-to-polygon";
import difference from "@turf/difference";

const SplitPolygonMode = {};

SplitPolygonMode.onSetup = function () {

  let main = this.getSelected()
    .filter((f) => f.type === "Polygon" || f.type === "MultiPolygon")
    .map((f) => f.toGeoJSON());

  if (main.length < 1) {
    throw new Error(
      "Please select a feature/features (Polygon or MultiPolygon) to split!"
    );
  }

  return {
    main,
  };
};

SplitPolygonMode.toDisplayFeatures = function (state, geojson, display) {
  display(geojson);

  this.changeMode("passing_mode_line_string", (cuttingLineString) => {
    state.main.forEach((el) => {
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
      }
    });
  });
};

export default SplitPolygonMode;

// from https://gis.stackexchange.com/a/344277/145409
function polygonCut(poly, line, idPrefix) {
  const THICK_LINE_UNITS = "kilometers";
  const THICK_LINE_WIDTH = 0.001;
  var i, j, id, intersectPoints, lineCoords, forCut, forSelect;
  var thickLineString, thickLinePolygon, clipped, polyg, intersect;
  var polyCoords = [];
  var cutPolyGeoms = [];
  var cutFeatures = [];
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

  // var lineCoords = getCoords(line);
  if (
    booleanDisjoint(line, poly)

    // originaly these methods were used, but booleanWithin has problem with MultiPolygons
    // booleanWithin(point(lineCoords[0]), poly) ||
    // booleanWithin(point(lineCoords[lineCoords.length - 1]), poly)
  ) {
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

    // cutPolyGeoms = [];
    // for (j = 0; j < clipped.geometry.coordinates.length; j++) {
    //   polyg = polygon(clipped.geometry.coordinates[j]);
    //   intersect = lineIntersect(polyg, offsetLine[forSelect]);
    //   if (intersect.features.length > 0) {
    //     cutPolyGeoms.push(polyg.geometry.coordinates);
    //   }
    // }

    // cutPolyGeoms.forEach(function (geometry, index) {
    //   id = idPrefix + (i + 1) + "." + (index + 1);
    //   cutFeatures.push(
    //     polygon(geometry, {
    //       id: id,
    //     })
    //   );
    // });
  }

  // if (cutFeatures.length > 0) retVal = featureCollection(cutFeatures);

  return clipped;
}
