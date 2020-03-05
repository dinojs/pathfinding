import React, { Component } from "react";
import { StaticMap } from "react-map-gl";
import DeckGL from "deck.gl";
import { renderLayers } from "./components/deckgl-layers";
//import { Algorithms } from "./components/algorithms";
import Navbar from "./components/navbar";
import { LayerControls, SCATTERPLOT_CONTROLS } from "./components/controls";
import { tooltipStyle } from "./components/style";
//import text from ".data/nodes.json"
import FlatQueue from "flatqueue";

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
      graph: null,
      timestampCounter: null,
      trailLength: 200, //Can't be null
      click: { clickedOject: null },
      start: null,
      end: null,
      nodes: [],
      path: new Map(),
      nodesToDisplay: [],
      pathToDisplay: null,
      time: 0,
      cost: 0,
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

  componentWillUnmount() {
    if (this._animationFrame) {
      window.cancelAnimationFrame(this._animationFrame);
    }
  }
  animatePath() {
    const {
      loopLength = this.state.timestampCounter, // unit corresponds to the timestamp in source data
      animationSpeed = loopLength / 2, // unit time per second
      trailLength = loopLength
    } = this.props;
    this.setState({ trailLength });
    const timestamp = Date.now() / 1000;
    const loopTime = loopLength / animationSpeed;

    this.setState({
      time: ((timestamp % loopTime) / loopTime) * loopLength
    });
    this._animationFrame = window.requestAnimationFrame(
      this.animatePath.bind(this)
    );
  }

  processData = () => {
    const data = require("./data/nodes.json");
    const graph = data[0];
    let nodesToDisplay = [];

    //const string = JSON.stringify(data[0]);
    for (let i in graph) {
      nodesToDisplay.push([i, graph[i].lon, graph[i].lat]);
    }

    this.setState({
      graph,
      nodesToDisplay,
      pathToDisplay: new Map()
    });
  };
  //////////////////////////////////
  recustructPath = () => {
    let graph = this.state.graph;
    let path = this.state.path;
    let current = this.state.end;
    let backwards = [];
    let nodes = [];
    let timestamp = [];
    let timestampCounter = 1;

    while (current !== this.state.start) {
      backwards.push(current);
      current = parseInt(path.get(current));
    }
    backwards.push(this.state.start);
    backwards.reverse();
    console.log(`Path length ${backwards.length}`);
    console.log(
      `%cYou should be travelling at an average of ${(
        this.state.cost / backwards.length
      ).toFixed(2)}mph.`,
      "color: #fff; background-color:#ff6600; border-radius: 5px; padding: 2px"
    );
    for (let i of backwards) {
      timestampCounter++;
      nodes.push([graph[i].lon, graph[i].lat, 22]); //x, y, z (path elevation)
      timestamp.push(timestampCounter);
    }
    this.setState({ timestampCounter });
    const pathToDisplay = [
      {
        path: nodes,
        timestamps: timestamp
      }
    ];

    this.setState({
      pathToDisplay
    });
    this.animatePath();
  };

  bfs = () => {
    const graph = this.state.graph;
    const timer = Date.now();
    let currentFrontier = [this.state.start];
    let nextFrontier = [];

    let path = this.state.path;
    //To reconstruct the path
    let current, adjNodes;
    let nodes = [];
    this.setState({ nodesToDisplay: [] });

    while (currentFrontier.length > 0 || nextFrontier.length > 0) {
      if (currentFrontier.length === 0) {
        //Swap
        [currentFrontier, nextFrontier] = [nextFrontier, currentFrontier];
      }

      current = currentFrontier.pop();
      adjNodes = graph[current].adj;

      nodes.push([current, graph[current].lon, graph[current].lat]);

      if (current == this.state.end) {
        this.animateNodes(nodes, path);
        console.log(`${nodes.length} nodes visted in ${Date.now() - timer} ms`);
        break;
      }

      for (let next of adjNodes) {
        if (!path.has(next)) {
          nextFrontier.push(next);
          path.set(next, current);
        }
      }
    }
    if (!currentFrontier.length && !nextFrontier.length) {
      this.animateNodes(nodes);
      console.log(`${nodes.length} nodes visted in ${Date.now() - timer} ms`);
      console.log(
        `Path not found, ${current} possible dead end or all the adjacent nodes have already been visited`
      );
    }
  };

  dfs = () => {
    const graph = this.state.graph;
    const timer = Date.now();
    let stack = [this.state.start];
    let frontier = [];
    let path = this.state.path;
    let current;
    let nodes = [];
    this.setState({ nodesToDisplay: [] });
    while (stack.length) {
      current = stack.pop();
      frontier.push(current);

      //Display node
      nodes.push([current, graph[current].lon, graph[current].lat]);

      if (current == this.state.end) {
        this.animateNodes(nodes, path);
        console.log(`${nodes.length} nodes visted in ${Date.now() - timer} ms`);
        break;
      }

      graph[current].adj
        .filter(next => !frontier.includes(next))
        .forEach(next => {
          stack.push(next);
          path.set(Number(next), Number(current));
        });
    }
    if (!stack.length) {
      this.animateNodes(nodes);
      console.log(`${nodes.length} nodes visted in ${Date.now() - timer} ms`);
      console.log(
        `Path not found, ${current} possible dead end or all the adjacent nodes have already been visited`
      );
    }
  };

  dijkstra = () => {
    const graph = this.state.graph;
    const timer = Date.now();
    const frontier = new FlatQueue();
    frontier.push(this.state.start, 0);
    let path = this.state.path;
    let cost_so_far = new Map();
    cost_so_far.set(this.state.start, 0);

    let current, adjNodes;
    let nodes = [];
    this.setState({ nodesToDisplay: [] }); //Reset view
    let pathCounter = 0;
    while (frontier.length > 0) {
      current = frontier.pop();
      adjNodes = graph[current].adj;

      nodes.push([current, graph[current].lon, graph[current].lat]);

      if (current == this.state.end) {
        let cost = Array.from(cost_so_far)[cost_so_far.size - 1][1];
        this.setState({ cost });
        console.log(
          `%cAnalysed ${pathCounter} different paths, the best one weights ${cost}.`,
          "color: #fff; background-color:#b32400; border-radius: 5px; padding: 2px"
        );
        this.animateNodes(nodes, path);
        console.log(`${nodes.length} nodes visted in ${Date.now() - timer} ms`);
        break;
      }

      let i = 0;
      for (let next of adjNodes) {
        let new_cost = cost_so_far.get(current) + graph[current].w[i];

        if (!cost_so_far.has(next)) {
          cost_so_far.set(next, new_cost);
          // let priority = new_cost;
          frontier.push(next, new_cost);
          path.set(next, current);
        } else if (new_cost < cost_so_far.get(next)) {
          pathCounter++;
          cost_so_far.set(next, new_cost);
          frontier.push(next, new_cost);
          path.set(next, current);
        }
        i++;
      }
    }

    if (!frontier.length) {
      this.animateNodes(nodes);
      console.log(`${nodes.length} nodes visted in ${Date.now() - timer} ms`);
      console.log(
        `Path not found, ${current} possible dead end or all the adjacent nodes have already been visited`
      );
    }
  };

  animateNodes(nodes, path = null, i = 0) {
    this.setState({ nodes });
    //let speed = Math.floor(nodes.length / 10000);
    let interval = setInterval(() => {
      this.setState({
        //nodesToDisplay: [...this.state.nodesToDisplay, nodes[i]]
        nodesToDisplay: this.state.nodesToDisplay.concat([nodes[i]])
      });
      i++;

      if (i === nodes.length) {
        clearInterval(interval);
        if (nodes[nodes.length - 1][0] == this.state.end) {
          //If end node found
          this.setState({ path }); //Set visited nodes sequence
          this.recustructPath();
        }
      }
    }, 0.00001);
  }

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
      ? this.setState({ end: parseInt(object[0]) })
      : this.setState({ start: parseInt(object[0]) });

    //Start and End can't be the same
    if (this.state.start === this.state.end) {
      this.setState({ start: null, end: null });
    }
    //console.log(`Start: ${this.state.start} End: ${this.state.end}`);
  }

  onStyleChange = style => {
    this.setState({ style });
  };

  _updateLayerSettings(settings) {
    this.setState({ settings });
  }
  render() {
    const data = this.state.nodesToDisplay;
    const path = this.state.pathToDisplay;
    if (data.length === 0) {
      return null;
    }
    const { hover, settings } = this.state;

    return (
      <div>
        <Navbar
          ref="child"
          bfs={this.bfs}
          dfs={this.dfs}
          dks={this.dijkstra}
          processData={this.processData}
          data={this.state.nodesToDisplay}
          onStyleChange={this.onStyleChange}
          style={this.state.style}
          start={this.state.start}
          end={this.state.end}
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
            trailLength: this.state.trailLength,
            data: [...data],
            path: [...path],
            time: this.state.time,
            onHover: hover => this._onHover(hover),
            onClick: click => this._onClick(click),
            settings: this.state.settings
          })}
          initialViewState={INITIAL_VIEW_STATE}
          controller //Allows the user to move the map around
        >
          <StaticMap
            mapStyle={this.state.style}
            mapboxApiAccessToken={
              "pk.eyJ1IjoiZGlub2pzIiwiYSI6ImNrMXIybWIzZTAwdXozbnBrZzlnOWNidzkifQ.Zs9R8K81ZSvVVizvzAXmfg"
            }
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
