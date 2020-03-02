import React, { Component } from "react";
import { StaticMap } from "react-map-gl";
import DeckGL from "deck.gl";
import { renderLayers } from "./components/deckgl-layers";
//import { Algorithms } from "./components/algorithms";
import Navbar from "./components/navbar";
import { LayerControls, SCATTERPLOT_CONTROLS } from "./components/controls";
import { tooltipStyle } from "./components/style";

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
    let nodes = [];

    //const string = JSON.stringify(data[0]);
    for (let i in graph) {
      nodes.push([i, graph[i].lon, graph[i].lat]);
    }

    this.setState({
      nodesToDisplay: nodes,
      pathToDisplay: new Map()
    });
  };
  //////////////////////////////////
  recustructPath = graph => {
    let path = this.state.path;
    let current = this.state.end;
    let backwards = [];
    let nodes = [];
    let timestamp = [];
    let timestampCounter = 1;
    console.log(
      `%c Visited: ${path.size} nodes`,
      "color: #fff; background-color:#6097D0; border-radius: 5px; padding: 2px"
    );

    while (current !== this.state.start) {
      backwards.push(current);
      current = path.get(current);
    }
    backwards.push(this.state.start);
    backwards.reverse();
    console.log(`Path length ${backwards.length}`);

    for (let i of backwards) {
      timestampCounter++;
      nodes.push([graph[i].lon, graph[i].lat, 22]); //x, y, z
      timestamp.push(timestampCounter);
    }
    this.setState({ timestampCounter: timestamp.pop() });
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
    const data = require("./data/nodes.json");
    const graph = data[0];
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

      if (current === this.state.end) {
        this.animateNodes(graph, nodes, path);
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
    if (!currentFrontier.length && !nextFrontier.length) {
      this.animateNodesNoPath(nodes, path);
      console.log(`Run time: ${Date.now() - timer} ms`);
      console.log(
        `Path not found, ${current} possible dead end or all the adjacent nodes have already been visited`
      );
    }
  };

  dfs = () => {
    const data = require("./data/nodes.json");
    const graph = data[0];
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

      if (current === this.state.end) {
        console.log(`Node found`);
        this.animateNodes(graph, nodes, path);
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
    if (!stack.length) {
      this.animateNodesNoPath(nodes, path);
      console.log(`Run time: ${Date.now() - timer} ms`);
      console.log(
        `Path not found, ${current} possible dead end or all the adjacent nodes have already been visited`
      );
    }
  };

  animateNodes(graph, nodes, path, i = 0) {
    this.setState({ nodes });
    this.setState({ path }); //Set visited nodes sequence
    let interval = setInterval(() => {
      let nodesToDisplay = [...this.state.nodesToDisplay, this.state.nodes[i]];
      this.setState({
        nodesToDisplay
      });

      i++; //Update every 5 nodes
      if (i === this.state.nodes.length) {
        clearInterval(interval);
        this.recustructPath(graph, path);
      }
    }, 0.001);
  }

  animateNodesNoPath(nodes, path, i = 0) {
    this.setState({ nodes });
    this.setState({ path }); //Set visited nodes sequence
    let interval = setInterval(() => {
      let nodesToDisplay = [...this.state.nodesToDisplay, this.state.nodes[i]];
      this.setState({
        nodesToDisplay
      });

      i++;

      if (i === this.state.nodes.length) {
        clearInterval(interval);
      }
    }, 0.0001);
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
      ? this.setState({ end: object[0] })
      : this.setState({ start: object[0] });

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
