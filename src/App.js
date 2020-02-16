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
import Navbar from "./components/navbar";

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
      start: 5173488749,
      end: 6330518860,
      nodes: [],
      path: new Map(),
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
  recustructPath = (graph, start, end) => {
    let path = this.state.path;
    let current = end;
    let backwards = [];
    let nodes = [];
    console.log(
      `%c Visited: ${path.size} nodes`,
      "color: #fff; background-color:#6097D0; border-radius: 5px; padding: 2px"
    );
    while (current !== start) {
      backwards.push(current);
      current = path.get(current);
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

  bfs = (graph, start = "5173488749", end = "6330518860") => {
    const timer = Date.now();
    let currentFrontier = [start];
    let nextFrontier = [];
    let path = this.state.path;
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

      if (current === end) {
        this.animateNodes(graph, start, end, nodes, path);
        console.log(`Run time: ${Date.now() - timer} ms`);
        break;
      }

      for (let next of adjNodes) {
        if (!path.has(next)) {
          nextFrontier.push(next);
          path.set(next, current);
        }
      }
    }
  };

  animateNodes(graph, start, end, nodes, path, i = 0) {
    this.setState({ nodes });
    this.setState({ path }); //Set visited nodes order
    let interval = setInterval(() => {
      let nodesToDisplay = [...this.state.nodesToDisplay, this.state.nodes[i]];
      this.setState({
        nodesToDisplay
      });

      i++;
      if (i === this.state.nodes.length) {
        clearInterval(interval);
        setTimeout(() => {
          this.recustructPath(graph, start, end, path);
        }, 500);
      }
    }, 0.001);
  }

  dfs = (graph, start = "5173488749", end = "6330518860") => {
    const timer = Date.now();
    let stack = [start];
    let frontier = [];
    let path = this.state.path;
    let current;
    let nodes = [];

    while (stack.length) {
      current = stack.pop();
      frontier.push(current);

      //Display node
      nodes.push(new Array(current, graph[current].lon, graph[current].lat));

      if (current === end) {
        this.animateNodes(graph, start, end, nodes, path);
        console.log(`Run time: ${Date.now() - timer} ms`);
        break;
      }

      graph[current].adj
        .filter(next => !frontier.includes(next))
        .forEach(next => {
          stack.push(next);
          path.set(next, current);
        });
    }
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
    const { hover, settings } = this.state;
    return (
      <div>
        <Navbar
          data={this.state.nodesToDisplay}
          onStyleChange={this.onStyleChange}
          style={this.state.style}
        />
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
      </div>
    );
  }
}
