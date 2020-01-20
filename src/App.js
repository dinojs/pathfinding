import React, { Component } from "react";
import { StaticMap } from "react-map-gl";
import {
  LayerControls,
  MapStylePicker,
  SCATTERPLOT_CONTROLS
} from "./components/controls";
import { tooltipStyle } from "./components/style";
import DeckGL from "deck.gl";
import { renderLayers } from "./components/deckgl-layers";

const INITIAL_VIEW_STATE = {
  longitude: -74,
  latitude: 40.711,
  zoom: 13.5,
  minZoom: 4,
  maxZoom: 16,
  pitch: 0,
  bearing: 0
};

export default class App extends Component {
  state = {
    hover: {
      x: 0,
      y: 0,
      hoveredObject: null
    },
    nodes: [],
    settings: Object.keys(SCATTERPLOT_CONTROLS).reduce(
      (accu, key) => ({
        ...accu,
        [key]: SCATTERPLOT_CONTROLS[key].value
      }),
      {}
    ),
    style: "mapbox://styles/mapbox/dark-v10"
  };

  componentDidMount() {
    this._processData();
  }

  _processData = () => {
    //Importing nodes
    const data = require("./data/nodes1.json");
    const nodes = [];
    //const string = JSON.stringify(data[0]);
    for (let i in data[0]) {
      nodes.push(new Array(i, data[0][i].lon, data[0][i].lat));
    }
    console.log(`There are ${nodes.length} nodes`);
    //console.log(data[0][4777888]);

    console.log(nodes);
    this.setState({
      nodes
    });
  };

  _onHover({ x, y, object }) {
    const label = `Node ${object}`;

    this.setState({ hover: { x, y, hoveredObject: object, label } });
  }

  onStyleChange = style => {
    this.setState({ style });
  };

  _updateLayerSettings(settings) {
    this.setState({ settings });
  }

  render() {
    const data = this.state.nodes;
    if (!data.length) {
      return null;
    }
    const { hover, settings } = this.state;
    return (
      <div>
        {hover.hoveredObject && (
          <div
            style={{
              ...tooltipStyle,
              transform: `translate(${hover.x}px, ${hover.y}px)`
            }}
          >
            <div>{hover.label}</div>
          </div>
        )}
        <MapStylePicker
          onStyleChange={this.onStyleChange}
          currentStyle={this.state.style}
        />
        <LayerControls
          settings={this.state.settings}
          propTypes={SCATTERPLOT_CONTROLS}
          onChange={settings => this._updateLayerSettings(settings)}
        />
        <DeckGL
          layers={renderLayers({
            data: this.state.nodes,
            onHover: hover => this._onHover(hover),
            settings: this.state.settings
          })}
          initialViewState={INITIAL_VIEW_STATE}
          controller
        >
          <StaticMap
            mapStyle={this.state.style}
            // //mapboxApiAccessToken={
            //   "pk.eyJ1IjoiZGlub2pzIiwiYSI6ImNrMXIybWIzZTAwdXozbnBrZzlnOWNidzkifQ.Zs9R8K81ZSvVVizvzAXmfg"
            // }
          />
        </DeckGL>
      </div>
    );
  }
}
