[![NPM](https://img.shields.io/npm/v/mapbox-gl-draw-split-polygon-mode.svg)](https://www.npmjs.com/package/mapbox-gl-draw-split-polygon-mode)
![Develop](https://github.com/reyhanemasumi/mapbox-gl-draw-split-polygon-mode/workflows/Develop/badge.svg)
![Release](https://github.com/reyhanemasumi/mapbox-gl-draw-split-polygon-mode/workflows/Release/badge.svg)

# mapbox-gl-draw-split-polygon-mode

A custom mode for [MapboxGL-Draw](https://github.com/mapbox/mapbox-gl-draw) to split polygons based on a drawn lineString.

> Check [mapbox-gl-draw-split-line-mode](https://github.com/ReyhaneMasumi/mapbox-gl-draw-split-line-mode) For splitting lineStrings.

## [DEMO](https://reyhanemasumi.github.io/mapbox-gl-draw-split-polygon-mode/)

![A Gif showing demo usage](demo/public/demo.gif)

## Install

```bash
npm install mapbox-gl-draw-split-polygon-mode
```

or use CDN:

```html
<script src="https://unpkg.com/mapbox-gl-draw-split-polygon-mode"></script>
```

## Usage

```js
import mapboxGl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import defaultDrawStyle from "https://unpkg.com/@mapbox/mapbox-gl-draw@1.3.0/src/lib/theme.js";

import SplitPolygonMode, { drawStyles as splitPolygonDrawStyles } from "..";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11",
  center: [-91.874, 42.76],
  zoom: 12,
});

draw = new MapboxDraw({
  modes: {
    ...SplitPolygonMode(MapboxDraw.modes),
  },
  styles: [...splitPolygonDrawStyles(defaultDrawStyle)],
  userProperties: true,
});

map.addControl(draw);

// when mode drawing should be activated
draw.changeMode("splitPolygonMode");
```

## [Example](https://github.com/ReyhaneMasumi/mapbox-gl-draw-split-polygon-mode/blob/main/demo/src/App.js)

## Development

use `vite` to run the demo:

```bash
cd demo
npx vite --host
```

## Acknowledgement

The main function responsible for cutting the features is from:
https://gis.stackexchange.com/a/344277/145409

## License

MIT © [ReyhaneMasumi](LICENSE)
