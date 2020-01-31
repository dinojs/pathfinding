import { ScatterplotLayer } from "deck.gl";
import { PolygonLayer } from "@deck.gl/layers";
import { AmbientLight, PointLight, LightingEffect } from "@deck.gl/core";
const URL =
  "https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/trips/buildings.json";
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
    onHover,
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
        getRadius: d => 5,
        opacity: 0.5,
        pickable: true,
        radiusMinPixels: 0.25,
        radiusMaxPixels: 30,
        data,
        onHover,
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
