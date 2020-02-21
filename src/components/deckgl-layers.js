import { ScatterplotLayer } from "deck.gl";
import { TripsLayer } from "@deck.gl/geo-layers";
import { PolygonLayer } from "@deck.gl/layers";
import { AmbientLight, PointLight, LightingEffect } from "@deck.gl/core";
const URL =
  "https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/trips/buildings.json";

const trips =
  "https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/trips/trips-v7.json";
const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0
});

const pointLight = new PointLight({
  color: [255, 255, 255],
  intensity: 2.0,
  position: [-74.05, 40.7, 8000]
});

const lightingEffect = new LightingEffect({ ambientLight, pointLight });

const material = {
  ambient: 0.1,
  diffuse: 0.6,
  shininess: 32,
  specularColor: [60, 64, 70]
};

const DEFAULT_THEME = {
  buildingColor: [74, 80, 87],
  trailColor0: [253, 128, 93],
  trailColor1: [23, 184, 190],
  material,
  effects: [lightingEffect]
};
const landCover = [
  [
    [-74.0, 40.7],
    [-74.02, 40.7],
    [-74.02, 40.72],
    [-74.0, 40.72]
  ]
];

export function renderLayers(props) {
  //Distructuring arguments
  const {
    data,
    path,
    time,
    onHover,
    onClick,
    settings,
    buildings = URL,
    trailLength = 20,
    theme = DEFAULT_THEME
  } = props;
  return [
    new TripsLayer({
      id: "trips",
      data: path,
      getPath: d => d.path,
      getTimestamps: d => d.timestamps,
      getColor: [253, 128, 93],
      opacity: 0.3,
      widthMinPixels: 2,
      rounded: true,
      trailLength,
      currentTime: time,

      shadowEnabled: false
    }),
    // new TripsLayer({
    //   id: "trips-layer",
    //   data: path,
    //   getTimestamps: d => d.timestamps,
    //   // deduct start timestamp from each data point to avoid overflow
    //   getTimestamps: d => d.waypoints.map(p => p.timestamp - 1554772579000),
    //   getColor: [253, 128, 93],
    //   opacity: 0.8,
    //   widthMinPixels: 5,
    //   rounded: true,
    //   trailLength: 200,
    //   currentTime: time
    // }),

    settings.showScatterplot &&
      new ScatterplotLayer({
        id: "scatterplot",
        //Format array [x,y,z]
        getPosition: d => [d[1], d[2]],
        getFillColor: [0, 128, 255],
        getRadius: d => 12,
        opacity: 1, //Put 0 for invisable
        pickable: true,
        radiusMinPixels: 0.25,
        radiusMaxPixels: 30,
        data,
        time,
        onHover,
        onClick,
        ...settings
      }),

    new PolygonLayer({
      id: "ground",
      data: landCover,
      getPolygon: f => f,
      stroked: false,
      getFillColor: [0, 0, 0, 0]
    }),

    new PolygonLayer({
      id: "buildings",
      data: buildings,
      extruded: true,
      wireframe: false,
      opacity: 0.5,
      getPolygon: f => f.polygon,
      getElevation: f => f.height,
      getFillColor: theme.buildingColor,
      material: theme.material
    })
  ];
}
