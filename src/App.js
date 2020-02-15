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
  constructor(props) {
    super(props);
    this.state = {
      hover: {
        x: 0,
        y: 0,
        hoveredObject: null
      },
      click: { clickedOject: null },
      start: null,
      end: null,
      nodes: [],
      nodesToDisplay: [],
      settings: Object.keys(SCATTERPLOT_CONTROLS).reduce(
        (accu, key) => ({
          ...accu,
          [key]: SCATTERPLOT_CONTROLS[key].value
        }),
        {}
      ),
      style: "mapbox://styles/mapbox/dark-v10"
    };

    this.animateNodes = this.animateNodes.bind(this);
  }

  componentDidMount() {
    this.processData();
  }

  processData = () => {
    const data = require("./data/nodes.json");
    const graph = data[0];

    //const string = JSON.stringify(data[0]);
    // for (let i in graph) {
    //   nodes.push(new Array(i, graph[i].lon, graph[i].lat));
    // }

    // this.setState({
    //   nodes
    // });
    this.dfs(graph);
  };
  //////////////////////////////////
  recustructPath = (graph, start, end, came_from) => {
    let current = end;
    let backwards = [];
    let nodes = [];
    console.log(`Visited: ${came_from.size} nodes`);
    while (current !== start) {
      backwards.push(current);
      current = came_from.get(current);
    }
    backwards.push(start);
    backwards.reverse();
    console.log(`Path length ${backwards.length}`);
    for (let i of backwards) {
      nodes.push(new Array(i, graph[i].lon, graph[i].lat));
    }
    this.setState({
      nodesToDisplay: nodes
    });
  };

  bfs = (graph, start = "1659428496", end = "4985377344") => {
    const timer = Date.now();
    let currentFrontier = [start];
    let nextFrontier = [];
    let came_from = new Map();
    //To reconstruct the path
    let current, adjNodes;
    let nodes = [];

    while (currentFrontier.length > 0 || nextFrontier.length > 0) {
      if (currentFrontier.length === 0) {
        //Swap
        [currentFrontier, nextFrontier] = [nextFrontier, currentFrontier];
      }

      current = currentFrontier.pop();
      adjNodes = graph[current].adj;

      nodes.push(new Array(current, graph[current].lon, graph[current].lat));
      this.setState({ nodes });

      if (current === end) {
        //this.recustructPath(graph, start, end, came_from);
        console.log(
          `%c Run time: ${Date.now() - timer} ms`,
          "color: #fff; background-color:#6097D0; border-radius: 5px; padding: 2px"
        );
        break;
      }

      for (let next of adjNodes) {
        if (!came_from.has(next)) {
          nextFrontier.push(next);
          came_from.set(next, current);
        }
      }
    }

    this.animateNodes();
    this.recustructPath(graph, start, end, came_from);
  };

  animateNodes(i = 0) {
    let interval = setInterval(() => {
      let nodesToDisplay = [...this.state.nodesToDisplay, this.state.nodes[i]];
      this.setState({
        nodesToDisplay
      });

      i++;
      if (i === this.state.nodes.length) clearInterval(interval);
    }, 1);
  }

  dfs = (graph, start = "1659428496", end = "4985377344") => {
    const timer = Date.now();
    let stack = [start];
    let frontier = [];
    let came_from = new Map();
    let current;
    let nodes = [];

    while (stack.length) {
      current = stack.pop();
      frontier.push(current);

      //Display node
      nodes.push(new Array(current, graph[current].lon, graph[current].lat));
      this.setState({ nodes });

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

    this.animateNodes();
  };

  ////////////////////////////////////////
  _onHover({ x, y, object }) {
    const label = `Node ${object}`;

    this.setState({ hover: { x, y, hoveredObject: object, label } });
  }
  _onClick({ object }) {
    if (this.state.start && this.state.end) {
      this.setState({ start: null, end: null });
    }

    this.state.start
      ? this.setState({ end: object[0] })
      : this.setState({ start: object[0] });

    //Start and End can't be the same
    if (this.state.start === this.state.end) {
      this.setState({ start: null, end: null });
    }
    console.log(`Start: ${this.state.start} End: ${this.state.end}`);
  }

  onStyleChange = style => {
    this.setState({ style });
  };

  _updateLayerSettings(settings) {
    this.setState({ settings });
  }

  render() {
    const data = this.state.nodesToDisplay;
    if (data.length === 0) {
      return null;
    }
    const { hover, click, settings } = this.state;
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
        <DeckGL
          layers={renderLayers({
            data: [...data],
            onHover: hover => this._onHover(hover),
            onClick: click => this._onClick(click),
            settings: this.state.settings
          })}
          initialViewState={INITIAL_VIEW_STATE}
          controller //Allows the user to move the map around
        >
          <StaticMap
          // mapStyle={this.state.style}
          // mapboxApiAccessToken={
          //   "pk.eyJ1IjoiZGlub2pzIiwiYSI6ImNrMXIybWIzZTAwdXozbnBrZzlnOWNidzkifQ.Zs9R8K81ZSvVVizvzAXmfg"
          // }
          />
        </DeckGL>

        <LayerControls
          settings={this.state.settings}
          propTypes={SCATTERPLOT_CONTROLS}
          onChange={settings => this._updateLayerSettings(settings)}
        />

        <nav className="navbar navbar-light bg-light py-0">
          <a className="navbar-brand py-0" href="#">
            Path length:{" "}
            <span className="badge badge-pill badge-secondary">
              {data.length}
            </span>
          </a>
          <MapStylePicker
            onStyleChange={this.onStyleChange}
            currentStyle={this.state.style}
          />
        </nav>
      </div>
    );
  }
}
