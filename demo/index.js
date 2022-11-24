import SelectFeatureMode, {
  drawStyles as selectFeatureDrawStyles,
} from "mapbox-gl-draw-select-mode";
import defaultDrawStyle from "https://unpkg.com/@mapbox/mapbox-gl-draw@1.3.0/src/lib/theme.js";

import SplitPolygonMode, {
  drawStyles as splitPolygonDrawStyles,
  Constants as splitPolygonConstants,
} from "..";

const { MODE } = import.meta.env;

import "./index.css";

let map, draw, drawBar;

function goSplitMode(selectedFeatureIDs) {
  try {
    draw?.changeMode("split_polygon", {
      featureIds: selectedFeatureIDs,
      /** Default option vlaues: */
      highlightColor: "#222",
      // lineWidth: 0,
      // lineWidthUnit: "kilometers",
    });
  } catch (err) {
    console.error(err);
  }
}

function splitPolygon() {
  const selectedFeatureIDs = draw.getSelectedIds();

  if (selectedFeatureIDs.length > 0) {
    goSplitMode(selectedFeatureIDs);
  } else {
    draw.changeMode("select_feature", {
      selectHighlightColor: "yellow",
      onSelect(selectedFeatureID) {
        goSplitMode([selectedFeatureID]);
      },
    });
  }
}

class extendDrawBar {
  constructor(opt) {
    let ctrl = this;
    ctrl.draw = opt.draw;
    ctrl.buttons = opt.buttons || [];
    ctrl.onAddOrig = opt.draw.onAdd;
    ctrl.onRemoveOrig = opt.draw.onRemove;
  }
  onAdd(map) {
    let ctrl = this;
    ctrl.map = map;
    ctrl.elContainer = ctrl.onAddOrig(map);
    ctrl.buttons.forEach((b) => {
      ctrl.addButton(b);
    });
    return ctrl.elContainer;
  }
  onRemove(map) {
    let ctrl = this;
    ctrl.buttons.forEach((b) => {
      ctrl.removeButton(b);
    });
    ctrl.onRemoveOrig(map);
  }
  addButton(opt) {
    let ctrl = this;
    var elButton = document.createElement("button");
    elButton.className = "mapbox-gl-draw_ctrl-draw-btn";
    if (opt.classes instanceof Array) {
      opt.classes.forEach((c) => {
        elButton.classList.add(c);
      });
    }
    elButton.addEventListener(opt.on, opt.action);
    ctrl.elContainer.appendChild(elButton);
    opt.elButton = elButton;
  }
  removeButton(opt) {
    opt.elButton.removeEventListener(opt.on, opt.action);
    opt.elButton.remove();
  }
}

if (mapboxgl.getRTLTextPluginStatus() === "unavailable")
  mapboxgl.setRTLTextPlugin(
    "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js",
    (err) => {
      err && console.error(err);
    },
    true
  );

map = new mapboxgl.Map({
  container: "map",
  style:
    MODE === "development"
      ? { version: 8, sources: {}, layers: [] }
      : `https://map.ir/vector/styles/main/mapir-xyz-light-style.json`,
  center: [51.3857, 35.6102],
  zoom: 7.78,
  pitch: 0,
  interactive: true,
  hash: true,
  attributionControl: true,
  customAttribution: "© Map © Openstreetmap",
  transformRequest: (url) => {
    return {
      url: url,
      headers: {
        "x-api-key":
          "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImRiZWU0YWU4OTk4OTA3MmQ3OTFmMjQ4ZDE5N2VhZTgwZWU2NTUyYjhlYjczOWI2NDdlY2YyYzIzNWRiYThiMzIzOTM5MDkzZDM0NTY2MmU3In0.eyJhdWQiOiI5NDMyIiwianRpIjoiZGJlZTRhZTg5OTg5MDcyZDc5MWYyNDhkMTk3ZWFlODBlZTY1NTJiOGViNzM5YjY0N2VjZjJjMjM1ZGJhOGIzMjM5MzkwOTNkMzQ1NjYyZTciLCJpYXQiOjE1OTA4MjU0NzIsIm5iZiI6MTU5MDgyNTQ3MiwiZXhwIjoxNTkzNDE3NDcyLCJzdWIiOiIiLCJzY29wZXMiOlsiYmFzaWMiXX0.M_z4xJlJRuYrh8RFe9UrW89Y_XBzpPth4yk3hlT-goBm8o3x8DGCrSqgskFfmJTUD2wC2qSoVZzQKB67sm-swtD5fkxZO7C0lBCMAU92IYZwCdYehIOtZbP5L1Lfg3C6pxd0r7gQOdzcAZj9TStnKBQPK3jSvzkiHIQhb6I0sViOS_8JceSNs9ZlVelQ3gs77xM2ksWDM6vmqIndzsS-5hUd-9qdRDTLHnhdbS4_UBwNDza47Iqd5vZkBgmQ_oDZ7dVyBuMHiQFg28V6zhtsf3fijP0UhePCj4GM89g3tzYBOmuapVBobbX395FWpnNC3bYg7zDaVHcllSUYDjGc1A", //dev api key
        "Mapir-SDK": "reactjs",
      },
    };
  },
});

draw = new MapboxDraw({
  modes: {
    ...SplitPolygonMode(SelectFeatureMode(MapboxDraw.modes)),
  },
  styles: [
    ...splitPolygonDrawStyles(selectFeatureDrawStyles(defaultDrawStyle)),
  ],
  userProperties: true,
});

window.draw = draw;

drawBar = new extendDrawBar({
  draw: draw,
  buttons: [
    {
      on: "click",
      action: splitPolygon,
      classes: ["split-polygon"],
    },
  ],
});

map.once("load", () => {
  map.resize();
  map.addControl(drawBar, "top-right");
  draw.set({
    type: "FeatureCollection",
    features: [
      {
        id: "example",
        type: "Feature",
        properties: {},
        geometry: {
          coordinates: [
            [
              [
                [52, 35],
                [53, 35],
                [53, 36],
                [52, 36],
                [52, 35],
              ],
            ],
            [
              [
                [50, 35],
                [51, 35],
                [51, 36],
                [50, 36],
                [50, 35],
              ],
              [
                [50.2, 35.2],
                [50.8, 35.2],
                [50.8, 35.8],
                [50.2, 35.8],
                [50.2, 35.2],
              ],
            ],
          ],
          type: "MultiPolygon",
        },
      },
    ],
  });

  map.on("draw.update", function (e) {
    console.log("🚀 ~ file: index.js ~ line 158 ~ e", e);

    /// Fixing an issue caused by mapbox-gl-draw. check `Readme.md` section ##Notes.
    if (e.action === "split_polygon") {
      const allFeatures = draw.getAll().features;

      allFeatures.forEach(({ id }) =>
        draw.setFeatureProperty(
          id,
          splitPolygonConstants.highlightPropertyName,
          undefined
        )
      );
    }
  });
});
