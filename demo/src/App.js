import React, { useRef, useEffect } from "react";
import mapboxGl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import SplitPolygonMode from "mapbox-gl-draw-split-polygon-mode";
import mapboxGlDrawPassingMode from "mapbox-gl-draw-passing-mode";
import "./App.css";

let map;
let draw;
let drawBar;

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

function App() {
  if (mapboxGl.getRTLTextPluginStatus() === "unavailable")
    mapboxGl.setRTLTextPlugin(
      "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js",
      (err) => {
        err && console.error(err);
      },
      true
    );
  let mapRef = useRef(null);

  useEffect(() => {
    map = new mapboxGl.Map({
      container: mapRef.current || "",
      style: `https://map.ir/vector/styles/main/mapir-xyz-light-style.json`,
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
        ...MapboxDraw.modes,
        splitPolygonMode: SplitPolygonMode,
        passing_mode_line_string: mapboxGlDrawPassingMode(
          MapboxDraw.modes.draw_line_string
        ),
      },
      userProperties: true,
    });
    drawBar = new extendDrawBar({
      draw: draw,
      buttons: [
        {
          on: "click",
          action: splitPolygon,
          classes: ["split-icon"]
        }
      ],
    });
    map.once("load", () => {
      map.resize();
      map.addControl(drawBar, "top-right");
      draw.set({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            id: "example-id",
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
    });
  }, []);
  const splitPolygon = () => {
    try {
      draw?.changeMode("splitPolygonMode");
    } catch (err) {
      alert(err.message);
      console.error(err);
    }
  };

  return (
    <div className="map-wrapper">
      <div id="map" ref={mapRef} />
    </div>
  );
}

export default App;
