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
import Algorithms from "./components/algorithm";

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
    this.processData();
  }

  processData = () => {
    const data = require("./data/nodes.json");
    const graph = data[0];

    const nodes = [];
    //const string = JSON.stringify(data[0]);
    for (let i in graph) {
      nodes.push(new Array(i, graph[i].lon, graph[i].lat));
    }

    console.log(`There are ${nodes.length} nodes`);
    this.setState({
      nodes
    });
    //this.dfs(graph);
  };
  //////////////////////////////////
  recustructPath = (graph, start, end, came_from) => {
    let current = end;
    let backwards = [];
    let path = [];
    console.log(`Visited: ${came_from.size} nodes`);
    while (current !== start) {
      backwards.push(current);
      current = came_from.get(current);
    }
    backwards.push(start);
    backwards.reverse();
    console.log(`Path length ${backwards.length}`);
    for (let i of backwards) {
      path.push(new Array(i, graph[i].lon, graph[i].lat));
    }
    this.setState({
      path
    });
  };

  noPath = () => {
    console.log("Path not found");
  };

  displayNode = (current, came_from, graph) => {
    let path = [];
    setTimeout(() => {
      path.push(new Array(current, graph[current].lon, graph[current].lat));
      this.setState({
        path
      });
    }, 5000);
  };

  bfs = (graph, start = "1659428496", end = "4985377344") => {
    const timer = Date.now();
    let currentFrontier = [start];
    let nextFrontier = [];
    let came_from = new Map();
    //To reconstruct the path
    let current, adjNodes;

    while (currentFrontier.length || nextFrontier.length) {
      if (!currentFrontier.length) {
        //Swap
        [currentFrontier, nextFrontier] = [nextFrontier, currentFrontier];
      }

      current = currentFrontier.pop();
      adjNodes = graph[current].adj;

      this.displayNode(current, came_from, graph);

      if (current === end) {
        this.recustructPath(graph, start, end, came_from);
        console.log(`Run time: ${Date.now() - timer} ms`);
        break;
      }

      for (let next of adjNodes) {
        if (!came_from.has(next)) {
          nextFrontier.push(next);
          came_from.set(next, current);
        }
      }
    }
  };

  dfs = (graph, start = "1659428496", end = "4985377344") => {
    const timer = Date.now();
    let stack = [start];
    let frontier = [];
    let came_from = new Map();
    let current;

    while (stack.length) {
      current = stack.pop();
      frontier.push(current);

      //Display node
      this.displayNode(current, came_from, graph);

      if (current === end) {
        this.recustructPath(graph, start, end, came_from);
        console.log(`Run time: ${Date.now() - timer} ms`);
        break;
      }

      graph[current].adj
        .filter(next => !frontier.includes(next))
        .forEach(next => {
          stack.push(next);
          came_from.set(next, current);
        });
    }
  };

  ////////////////////////////////////////
  _onHover({ x, y, object }) {
    const label = `Node ${object}`;

    this.setState({ hover: { x, y, hoveredObject: object, label } });
  }
  // _onClick({ x, y, object }) {}

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
            // onClick: click => this._onClick(click),
            settings: this.state.settings
          })}
          initialViewState={INITIAL_VIEW_STATE}
          controller
        >
          <StaticMap
            mapStyle={this.state.style}
            // mapboxApiAccessToken={
            //   "pk.eyJ1IjoiZGlub2pzIiwiYSI6ImNrMXIybWIzZTAwdXozbnBrZzlnOWNidzkifQ.Zs9R8K81ZSvVVizvzAXmfg"
            // }
          />
        </DeckGL>
      </div>
    );
  }
}
