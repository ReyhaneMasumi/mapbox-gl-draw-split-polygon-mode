import lineIntersect from '@turf/line-intersect';
import booleanWithin from '@turf/boolean-within';
import { getCoords } from '@turf/invariant';
import { point, lineString, polygon, featureCollection } from '@turf/helpers';
import lineOffset from '@turf/line-offset';
import lineToPolygon from '@turf/line-to-polygon';
import difference from '@turf/difference';

import DrawLineString from '@mapbox/mapbox-gl-draw/src/modes/draw_line_string';

import doubleClickZoom from '@mapbox/mapbox-gl-draw/src/lib/double_click_zoom';
import * as Constants from '@mapbox/mapbox-gl-draw/src/constants';
import createVertex from '@mapbox/mapbox-gl-draw/src/lib/create_vertex';

const SplitPolygonMode = { ...DrawLineString };

SplitPolygonMode.onSetup = function (opts) {
  opts = opts || {};
  const featureId = opts.featureId;

  let main = this.getSelected()
    .filter((f) => f.type === 'Polygon' || f.type === 'MultiPolygon')
    .map((f) => f.toGeoJSON());
  if (main.length < 1) {
    throw new Error(
      'Please select a feature/features (Polygon or MultiPolygon) to split!'
    );
  }

  let line, currentVertexPosition;
  let direction = 'forward';
  if (featureId) {
    line = this.getFeature(featureId);
    if (!line) {
      throw new Error('Could not find a feature with the provided featureId');
    }
    let from = opts.from;
    if (
      from &&
      from.type === 'Feature' &&
      from.geometry &&
      from.geometry.type === 'Point'
    ) {
      from = from.geometry;
    }
    if (
      from &&
      from.type === 'Point' &&
      from.coordinates &&
      from.coordinates.length === 2
    ) {
      from = from.coordinates;
    }
    if (!from || !Array.isArray(from)) {
      throw new Error(
        'Please use the `from` property to indicate which point to continue the line from'
      );
    }
    const lastCoord = line.coordinates.length - 1;
    if (
      line.coordinates[lastCoord][0] === from[0] &&
      line.coordinates[lastCoord][1] === from[1]
    ) {
      currentVertexPosition = lastCoord + 1;
      // add one new coordinate to continue from
      line.addCoordinate(currentVertexPosition, ...line.coordinates[lastCoord]);
    } else if (
      line.coordinates[0][0] === from[0] &&
      line.coordinates[0][1] === from[1]
    ) {
      direction = 'backwards';
      currentVertexPosition = 0;
      // add one new coordinate to continue from
      line.addCoordinate(currentVertexPosition, ...line.coordinates[0]);
    } else {
      throw new Error(
        '`from` should match the point at either the start or the end of the provided LineString'
      );
    }
  } else {
    line = this.newFeature({
      type: Constants.geojsonTypes.FEATURE,
      properties: {},
      geometry: {
        type: Constants.geojsonTypes.LINE_STRING,
        coordinates: [],
      },
    });
    currentVertexPosition = 0;
    this.addFeature(line);
  }

  this.clearSelectedFeatures();
  doubleClickZoom.disable(this);
  this.updateUIClasses({ mouse: Constants.cursors.ADD });
  this.activateUIButton(Constants.types.LINE);
  this.setActionableState({
    trash: true,
  });

  return {
    main,
    line,
    currentVertexPosition,
    direction,
  };
};

SplitPolygonMode.onStop = function (state) {
  doubleClickZoom.enable(this);
  this.activateUIButton();

  // check to see if we've deleted this feature
  if (this.getFeature(state.line.id) === undefined) return;

  //remove last added coordinate
  state.line.removeCoordinate(`${state.currentVertexPosition}`);
  if (state.line.isValid()) {
    state.main.forEach((el) => {
      if (
        booleanWithin(point(state.line.coordinates[0]), el) ||
        booleanWithin(
          point(state.line.coordinates[state.line.coordinates.length - 1]),
          el
        )
      ) {
        throw new Error('Line must be outside of Polygon');
      } else {
        let polycut = polygonCut(
          el.geometry,
          state.line.toGeoJSON().geometry,
          'piece-'
        );
        polycut.features.forEach((el2) => {
          let afterSplit = this.newFeature(el2);
          this.addFeature(afterSplit);
        });
        this.deleteFeature([el.id], { silent: true });
      }
    });
    this.deleteFeature([state.line.id], { silent: true });
  } else {
    this.deleteFeature([state.line.id], { silent: true });
    this.changeMode(Constants.modes.SIMPLE_SELECT, {}, { silent: true });
  }
};

SplitPolygonMode.toDisplayFeatures = function (state, geojson, display) {
  const isActiveLine = geojson.properties.id === state.line.id;
  geojson.properties.active = isActiveLine
    ? Constants.activeStates.ACTIVE
    : Constants.activeStates.INACTIVE;
  if (!isActiveLine) return display(geojson);
  // Only render the line if it has at least one real coordinate
  if (geojson.geometry.coordinates.length < 2) return;
  geojson.properties.meta = Constants.meta.FEATURE;
  display(
    createVertex(
      state.line.id,
      geojson.geometry.coordinates[
        state.direction === 'forward'
          ? geojson.geometry.coordinates.length - 2
          : 1
      ],
      `${
        state.direction === 'forward'
          ? geojson.geometry.coordinates.length - 2
          : 1
      }`,
      false
    )
  );

  display(geojson);
};

export default SplitPolygonMode;

function polygonCut(poly, line, idPrefix) {
  const THICK_LINE_UNITS = 'kilometers';
  const THICK_LINE_WIDTH = 0.001;
  var i, j, id, intersectPoints, lineCoords, forCut, forSelect;
  var thickLineString, thickLinePolygon, clipped, polyg, intersect;
  var polyCoords = [];
  var cutPolyGeoms = [];
  var cutFeatures = [];
  var offsetLine = [];
  var retVal = null;

  if (
    (poly.type != 'Polygon' && poly.type != 'MultiPolygon') ||
    line.type != 'LineString'
  ) {
    return retVal;
  }

  if (typeof idPrefix === 'undefined') {
    idPrefix = '';
  }

  intersectPoints = lineIntersect(poly, line);
  if (intersectPoints.features.length == 0) {
    return retVal;
  }

  var lineCoords = getCoords(line);
  if (
    booleanWithin(point(lineCoords[0]), poly) ||
    booleanWithin(point(lineCoords[lineCoords.length - 1]), poly)
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

    cutPolyGeoms = [];
    for (j = 0; j < clipped.geometry.coordinates.length; j++) {
      polyg = polygon(clipped.geometry.coordinates[j]);
      intersect = lineIntersect(polyg, offsetLine[forSelect]);
      if (intersect.features.length > 0) {
        cutPolyGeoms.push(polyg.geometry.coordinates);
      }
    }

    cutPolyGeoms.forEach(function (geometry, index) {
      id = idPrefix + (i + 1) + '.' + (index + 1);
      cutFeatures.push(
        polygon(geometry, {
          id: id,
        })
      );
    });
  }

  if (cutFeatures.length > 0) retVal = featureCollection(cutFeatures);

  return retVal;
}
