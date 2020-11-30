[![NPM](https://img.shields.io/npm/v/mapbox-gl-draw-split-polygon-mode.svg)](https://www.npmjs.com/package/mapbox-gl-draw-split-polygon-mode)
![Develop](https://github.com/reyhanemasumi/mapbox-gl-draw-split-polygon-mode/workflows/Develop/badge.svg)
![Release](https://github.com/reyhanemasumi/mapbox-gl-draw-split-polygon-mode/workflows/Release/badge.svg)

# mapbox-gl-draw-split-polygon-mode

A custom mode for [MapboxGL-Draw](https://github.com/mapbox/mapbox-gl-draw) to split polygons.

> Check [mapbox-gl-draw-split-line-mode](https://github.com/ReyhaneMasumi/mapbox-gl-draw-split-line-mode) For splitting lineStrings.

## [DEMO](https://reyhanemasumi.github.io/mapbox-gl-draw-split-polygon-mode/)

![A Gif showing demo usage](demo/public/demo.gif)

## Install

```bash
npm install mapbox-gl-draw-split-polygon-mode mapbox-gl-draw-passing-mode
```

or use CDN:

```html
<script src="https://unpkg.com/mapbox-gl-draw-passing-mode"></script>
<script src="https://unpkg.com/mapbox-gl-draw-split-polygon-mode"></script>
```

## Usage

```js
import mapboxGl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import SplitPolygonMode from 'mapbox-gl-draw-split-polygon-mode';
import mapboxGlDrawPassingMode from 'mapbox-gl-draw-passing-mode';

const map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [-91.874, 42.76], // starting position
  zoom: 12, // starting zoom
});

const draw = new MapboxDraw({
  userProperties: true,
  displayControlsDefault: false,
  modes: Object.assign(MapboxDraw.modes, {
    splitPolygonMode: SplitPolygonMode,
    passing_mode_line_string: mapboxGlDrawPassingMode(
      MapboxDraw.modes.draw_line_string
    ),
  }),
});
map.addControl(draw);

// when mode drawing should be activated
draw.changeMode('splitPolygonMode');
```

## [Example](https://github.com/ReyhaneMasumi/mapbox-gl-draw-split-polygon-mode/blob/main/demo/src/App.js)

## Acknowledgement

The main function responsible for cutting the features is from:
https://gis.stackexchange.com/a/344277/145409

## License

MIT © [ReyhaneMasumi](LICENSE)
