import { ScatterplotLayer } from "deck.gl";
import { TripsLayer } from "@deck.gl/geo-layers";
import { PolygonLayer, IconLayer, PathLayer } from "@deck.gl/layers";
import { AmbientLight, PointLight, LightingEffect } from "@deck.gl/core";

const URL =
  "https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/trips/buildings.json";

//const trips ="https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/trips/trips-v7.json";

const START_COLOR = [0, 128, 255];
const END_COLOR = [255, 0, 128];

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
const ICON_MAPPING = {
  marker: { x: 0, y: 0, width: 32, height: 32, mask: true }
};

export function renderLayers(props) {
  //Distructuring arguments
  const {
    data,
    visiting,
    startEnd,
    path,
    trip,
    time,
    trailLength,
    onHover,
    onClick,
    settings,
    buildings = URL,
    theme = DEFAULT_THEME
  } = props;

  return [
    settings.showScatterplot &&
      new ScatterplotLayer({
        id: "scatterplot",
        //Format array [x,y,z]
        getPosition: d => [d[1], d[2]],
        getFillColor: [0, 128, 255],
        getRadius: 8.5,
        opacity: 1, //Put 0 for invisable
        pickable: true,
        radiusMinPixels: 0.25,
        radiusMaxPixels: 10,
        data,
        time,
        onHover,
        onClick,
        ...settings
      }),

    new ScatterplotLayer({
      id: "scatterplotVisiting",
      getPosition: d => [d[1], d[2]],
      getFillColor: [253, 128, 93],
      getRadius: 9,
      opacity: 1, //Put 0 for invisable
      radiusMinPixels: 0.25,
      radiusMaxPixels: 10,
      data: visiting,
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
    }),
    new PathLayer({
      id: "path-layer",
      data: path,
      pickable: true,
      widthMinPixels: 1,
      getPath: d => d.path,
      getColor: d => [253, 128, 93],
      getWidth: d => 2
    }),

    new ScatterplotLayer({
      id: "scatterplotStartEnd",
      getPosition: d => [d[1], d[2]],
      getFillColor: [255, 69, 0],
      getRadius: 20,
      opacity: 1, //Put 0 for invisable
      radiusMinPixels: 0.25,
      radiusMaxPixels: 10,
      data: startEnd,
      ...settings
    }),
    new TripsLayer({
      id: "trips",
      data: trip,
      getPath: d => d.trip,
      getTimestamps: d => d.timestamps,
      getColor: [253, 128, 93],
      opacity: 0.8,
      widthMinPixels: 4,
      rounded: true,
      trailLength,
      currentTime: time,

      shadowEnabled: false
    })

    // new IconLayer({
    //   id: "icon-layer",
    //   data: [startXY, endXY],
    //   pickable: true,
    //   // iconAtlas and iconMapping are required
    //   // getIcon: return a string
    //   iconAtlas: "./pin.png",
    //   iconMapping: ICON_MAPPING,
    //   getIcon: d => "marker",

    //   sizeScale: 15,
    //   getPosition: d => [d[1], d[2]],
    //   getSize: d => 24,
    //   getColor: d => [255, 255, 255]
    // })
  ];
}
