import React, { Component } from "react";

//class inherithms props by default
function Algorithms(props) {
  const { graph, start, end } = this.props;
  const bfs = (graph, start = "5173488749", end = "6330518860") => {
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

  const dfs = (graph, start = "5173488749", end = "6330518860") => {
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
}
export default Algorithms;
