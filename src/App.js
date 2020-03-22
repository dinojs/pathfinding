import React, { Component } from "react";
import {
  _MapContext as MapContext,
  NavigationControl,
  StaticMap
} from "react-map-gl";
import DeckGL from "deck.gl";
import { renderLayers } from "./components/deckgl-layers";
import Navbar from "./components/navbar";
import { ListGroup } from "./components/list-group";
import { LayerControls, SCATTERPLOT_CONTROLS } from "./components/controls";
import { tooltipStyle } from "./components/style";
import FlatQueue from "flatqueue";
import ReactGA from "react-ga"; //Website traffic info
ReactGA.initialize("UA-160781302-1");
ReactGA.pageview(window.location.pathname + window.location.search);
const MAPBOX_TOKEN = process.env.REACT_APP_MapboxAccessToken; // eslint-disable-line

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        longitude: -74,
        latitude: 40.711,
        zoom: 13.9,
        pitch: 55,
        bearing: 45
      },
      hover: {
        x: 0,
        y: 0,
        hoveredObject: null
      },
      graph: null,
      timestampCounter: null,
      pathLength: 0,
      trailLength: 200, //Can't be null
      click: { clickedOject: null },
      nodesToDisplay: [],
      nodesVisited: 0, //Frontier length
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
    this.setState(
      { graph },
      this.setInitialView //Works as await function
    );
  };

  setInitialView = () => {
    let nodesToDisplay = [];
    const graph = this.state.graph;

    for (let i in graph) {
      nodesToDisplay.push([i, graph[i].lon, graph[i].lat]);
    }
    this.setState({
      nodesToDisplay,
      pathToDisplay: null, //Reset path
      tripToDisplay: null, //Reset trip animation
      visiting: null, //Reset Frontier
      startMarker: [],
      endMarker: [],
      start: "Start", //So that they show as placeholder
      end: "Destination",
      cost: 0,
      speed: 0,
      pathLength: 0,
      runTime: 0
    });
    clearInterval(this.state.interval); //Stop animation
  };

  //////////////////////////////////
  bfs = () => {
    const graph = this.state.graph;
    const timer = Date.now();
    let currentFrontier = [this.state.start];
    let nextFrontier = [];

    let path = new Map();
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

      nodes.push([current, graph[current].lon, graph[current].lat]);

      if (current === this.state.end) {
        let runTime = Date.now() - timer;
        this.setState({ nodesVisited: nodes.length, runTime });
        this.animateNodes(nodes, path);

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
    let path = new Map();
    let current;
    let nodes = [];
    while (stack.length) {
      current = stack.pop();
      frontier.push(current);

      //Display node
      nodes.push([current, graph[current].lon, graph[current].lat]);

      if (current === this.state.end) {
        let runTime = Date.now() - timer;
        this.setState({ nodesVisited: nodes.length, runTime });
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
      let runTime = Date.now() - timer;
      this.setState({ nodesVisted: nodes.length, runTime });
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
    let path = new Map();
    let cost_so_far = new Map();
    cost_so_far.set(this.state.start, 0);

    let current, adjNodes;
    let nodes = [];
    let pathCounter = 0;
    while (frontier.length > 0) {
      current = frontier.pop(); //remove smallest item
      adjNodes = graph[current].adj;

      nodes.push([current, graph[current].lon, graph[current].lat]);

      if (current === this.state.end) {
        let runTime = Date.now() - timer;
        let cost = Array.from(cost_so_far)[cost_so_far.size - 1][1];
        this.setState({ cost, nodesVisited: nodes.length, runTime });

        this.animateNodes(nodes, path);
        console.log(
          `%cAnalysed ${pathCounter} different paths, the best one costs ${cost}.`,
          "color: #fff; background-color:#b32400; border-radius: 5px; padding: 2px"
        );
        break;
      }

      let i = 0;
      for (let next of adjNodes) {
        let new_cost = cost_so_far.get(current) + graph[current].w[i];

        if (!cost_so_far.has(next) || new_cost < cost_so_far.get(next)) {
          if (new_cost < cost_so_far.get(next)) pathCounter++;

          cost_so_far.set(next, new_cost);
          // let priority = new_cost;
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
  heuristic = (a, b) => {
    //Manhattan distance
    const graph = this.state.graph;

    return (
      Math.abs(graph[a].lon - graph[b].lon) +
      Math.abs(graph[a].lat - graph[b].lat)
    );
  };

  gbf = () => {
    //Greedy Best First Search
    const graph = this.state.graph;
    const timer = Date.now();
    const frontier = new FlatQueue();
    frontier.push(this.state.start, 0);
    let path = new Map();

    let current, adjNodes, priority;
    let nodes = [];

    while (frontier.length > 0) {
      current = frontier.pop(); //remove smallest item
      adjNodes = graph[current].adj;

      nodes.push([current, graph[current].lon, graph[current].lat]);

      if (current === this.state.end) {
        let runTime = Date.now() - timer;
        this.setState({ nodesVisited: nodes.length, runTime });
        this.animateNodes(nodes, path);
        break;
      }

      for (let next of adjNodes) {
        if (!path.has(next)) {
          priority = this.heuristic(this.state.end, next); //Destination, currrent node
          frontier.push(next, priority);
          path.set(next, current);
        }
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

  astar = () => {
    const graph = this.state.graph;
    const timer = Date.now();
    const frontier = new FlatQueue();
    frontier.push(this.state.start, 0);
    let path = new Map();
    let cost_so_far = new Map();
    cost_so_far.set(this.state.start, 0);

    let current, adjNodes, priority;
    let nodes = [];
    let pathCounter = 0;
    while (frontier.length > 0) {
      current = frontier.pop(); //remove smallest item
      adjNodes = graph[current].adj;

      nodes.push([current, graph[current].lon, graph[current].lat]);

      if (current === this.state.end) {
        let runTime = Date.now() - timer;

        let cost = Array.from(cost_so_far)[cost_so_far.size - 1][1];
        this.setState({ cost, nodesVisited: nodes.length, runTime });
        console.log(
          `%cAnalysed ${pathCounter} different paths, the best one costs ${cost}.`,
          "color: #fff; background-color:#b32400; border-radius: 5px; padding: 2px"
        );
        this.animateNodes(nodes, path);
        console.log(`${nodes.length} nodes visted in ${Date.now() - timer} ms`);
        break;
      }

      let i = 0;
      for (let next of adjNodes) {
        let new_cost = cost_so_far.get(current) + graph[current].w[i];

        if (!cost_so_far.has(next) || new_cost < cost_so_far.get(next)) {
          if (new_cost < cost_so_far.get(next)) pathCounter++; //How many different paths analysed

          cost_so_far.set(next, new_cost);
          priority = new_cost + this.heuristic(this.state.end, next);
          frontier.push(next, priority);
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
  recustructPath = path => {
    let graph = this.state.graph;
    let current = this.state.end;
    let backwards = [];
    let nodes = [];
    let trip = [];
    let timestamp = [];
    let timestampCounter = 1;
    let distanceNodes = [];

    while (current !== this.state.start) {
      backwards.push(current);
      current = parseInt(path.get(current));
    }
    backwards.push(this.state.start);
    backwards.reverse();

    for (let i of backwards) {
      timestampCounter++;
      nodes.push([graph[i].lon, graph[i].lat]); //PathLayer
      trip.push([graph[i].lon, graph[i].lat, 10]); //x, y, z (path elevation) //TripsLayer
      timestamp.push(timestampCounter);
    }
    this.setState({ timestampCounter });
    const pathToDisplay = [{ path: nodes }];
    const tripToDisplay = [
      {
        trip,
        timestamps: timestamp
      }
    ];
    this.setState({
      pathToDisplay,
      tripToDisplay
    });
    //Calculate total path distance
    for (let i = 0; i < backwards.length - 1; i++) {
      distanceNodes.push(
        Number(this.haversine(backwards[i], backwards[i + 1]))
      );
    }
    let distance = distanceNodes.reduce((a, b) => a + b, 0).toFixed(2);
    let speed = (this.state.cost / backwards.length).toFixed(2);

    this.setState({ distance, pathLength: backwards.length, speed });
    this.animatePath();
  };

  haversine = (a, b) => {
    //https://www.movable-type.co.uk/scripts/latlong.html
    Math.radians = function(degrees) {
      return (degrees * Math.PI) / 180;
    };

    const graph = this.state.graph;
    const R = 6371; // Radius of the earth in km
    const lat1 = Math.radians(graph[a].lat);
    const lat2 = Math.radians(graph[b].lat);
    const Δφ = lat2 - lat1;
    const Δλ = Math.radians(graph[b].lon - graph[a].lon);

    let distance =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    let c = 2 * Math.atan2(Math.sqrt(distance), Math.sqrt(1 - distance));

    return R * c; //Distance in km
  };

  animateNodes(nodes, path = null, i = 1) {
    // let connected = []; //Retrive connected graph
    // nodes.forEach(e => connected.push(String(e[0])));
    // console.log(connected);
    let visiting = [];
    this.setState({
      nodesToDisplay: nodes[0]
    }); //Avoid page refresh

    this.state.interval = setInterval(() => {
      this.setState({
        nodesToDisplay: this.state.nodesToDisplay.concat([nodes[i]]),
        visiting: this.state.nodesToDisplay.slice(-25)
      });

      if ((visiting.length = 25)) {
        visiting.shift();
      }
      i++;
      if (i === nodes.length) {
        clearInterval(this.state.interval);
        this.setState({ visiting: null }); //Reset current visiting animation
        if (nodes[nodes.length - 1][0] === this.state.end) {
          //If end node found

          this.recustructPath(path); //Set visited nodes sequence
        }
      }
    }, 10);
  }

  ////////////////////////////////////////
  _onHover({ x, y, object }) {
    const label = `Node ${object}`;

    this.setState({ hover: { x, y, hoveredObject: object, label } });
  }
  _onClick({ object }) {
    let node = parseInt(object[0]);
    let marker = [];
    if (this.state.start && this.state.end) {
      //If both are alredy selected
      this.setState({
        start: null,
        end: null,
        startMarker: [],
        endMarker: []
      });
    }

    marker.push(this.state.graph[node].lon, this.state.graph[node].lat);

    this.state.start
      ? this.setState({ end: node, endMarker: marker })
      : this.setState({ start: node, startMarker: marker });

    //Start and End can't be the same

    if (this.state.start === this.state.end) {
      this.setState({
        start: null,
        end: null,
        startMarker: [],
        endMarker: []
      });
    }
  }

  handleStart = e => {
    let startMarker = [];
    if (this.state.end !== e) {
      this.setState({ start: e, startMarker: [] });
      startMarker.push(this.state.graph[e].lon, this.state.graph[e].lat);
      this.setState({ startMarker });
    }
  };

  handleEnd = e => {
    let endMarker = [];
    if (this.state.start !== e) {
      this.setState({ end: e, endMarker: [] });
      endMarker.push(this.state.graph[e].lon, this.state.graph[e].lat);
      this.setState({ endMarker });
    }
  };

  onStyleChange = style => {
    this.setState({ style });
  };

  _updateLayerSettings(settings) {
    this.setState({ settings });
  }
  render() {
    const data = this.state.nodesToDisplay;
    const path = this.state.pathToDisplay;
    const { viewport } = this.state;
    if (data.length === 0) {
      return null;
    }
    const { hover, settings } = this.state;

    return (
      <div>
        <LayerControls
          settings={this.state.settings}
          propTypes={SCATTERPLOT_CONTROLS}
          onChange={settings => this._updateLayerSettings(settings)}
        />
        <Navbar
          ref="child"
          bfs={this.bfs}
          dfs={this.dfs}
          dks={this.dijkstra}
          gbf={this.gbf}
          astar={this.astar}
          setInitialView={this.setInitialView}
          onStyleChange={this.onStyleChange}
          style={this.state.style}
          start={this.state.start}
          end={this.state.end}
          handleStart={this.handleStart.bind(this)}
          handleEnd={this.handleEnd.bind(this)}
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
            visiting: this.state.visiting,
            markers: [this.state.startMarker, this.state.endMarker],
            data,
            path,
            trip: this.state.tripToDisplay,
            time: this.state.time,
            onHover: hover => this._onHover(hover),
            onClick: click => this._onClick(click),
            settings: this.state.settings
          })}
          initialViewState={viewport}
          controller //Allows the user to move the map around
          ContextProvider={MapContext.Provider}
        >
          <StaticMap // minimum version of reat-map-g
            reuseMaps
            mapStyle={this.state.style}
            mapboxApiAccessToken={MAPBOX_TOKEN}
          />
          <div className="mapboxgl-ctrl-bottom-left">
            <NavigationControl
              ref={ref => {
                if (ref != null) {
                  ref._uiVersion = 2;
                }
              }} //https://github.com/uber/deck.gl/issues/4383
              // onViewportChange={viewport => this.setState({ viewport })}
            />
          </div>
        </DeckGL>
        <ListGroup
          ref="child"
          data={data.length}
          pathLength={this.state.pathLength}
          distance={this.state.distance}
          cost={this.state.cost}
          speed={this.state.speed}
          nodesVisited={this.state.nodesVisited}
          runTime={this.state.runTime}
        />
      </div>
    );
  }
}
