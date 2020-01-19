import { ScatterplotLayer } from "deck.gl";
// const DATA_URL =
//   "https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/scatterplot/manhattan.json";

export function renderLayers(props) {
  const { data, onHover, settings } = props;
  return [
    settings.showScatterplot &&
      new ScatterplotLayer({
        id: "scatterplot",
        //Format array [x,y,z]
        getPosition: d => [d[1], d[0]],
        getFillColor: [0, 128, 255],
        getRadius: d => 5,
        opacity: 0.5,
        pickable: true,
        radiusMinPixels: 0.25,
        radiusMaxPixels: 30,
        data,
        onHover,
        ...settings
      })
  ];
}

//function that when called accesses JSON and returns only key value needed into an array
