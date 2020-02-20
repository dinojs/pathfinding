import React, { Component } from "react";

class Algorithms extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nodes: [],
      path: new Map(),
      nodesToDisplay: []
    };
  }

  bfs = (start = "5173488749", end = "6330518860") => {
    const data = require("../data/nodes.json");
    const graph = data[0];
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

  dfs = (start = "5173488749", end = "6330518860") => {
    const data = require("../data/nodes.json");
    const graph = data[0];
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
  ////////////////////////////////////////
  render() {
    const data = this.state.nodesToDisplay;
    if (data.length === 0) {
      return null;
    }
    const { hover, settings } = this.state;

    return null;
  }
}
export default Algorithms;
