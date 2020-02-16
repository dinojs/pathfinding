import React, { Component } from "react";
import { connect } from "react-redux"; //Used to get higher orders components

//class inherithms props by default
function Algorithms(props) {
  const bfs = (graph, start = "5173488749", end = "6330518860") => {
    const timer = Date.now();
    let currentFrontier = [start];
    let nextFrontier = [];
    let path = this.props.path;
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
    let path = this.props.path;
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
  const animateNodes = (graph, start, end, nodes, path, i = 0) => {
    this.props.setStateNodes(nodes);
    this.props.setStatePath(path); //Set visited nodes order
    let interval = setInterval(() => {
      let frontier = [...this.props.frontier, this.props.nodes[i]];
      this.props.setStateFrontier(frontier);

      i++;
      if (i === this.props.nodes.length) {
        clearInterval(interval);
        setTimeout(() => {
          this.recustructPath(graph, start, end, path);
        }, 500);
      }
    }, 0.001);
  };

  const recustructPath = (graph, start, end) => {
    let path = this.props.path;
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
    this.props.setStateFrontier(nodes);
  };
}

const mapStateToProps = (state, ownProps) => {
  const start = ownProps.start;
  const end = ownProps.end;
  console.log(state);
  return {
    start: state.start,
    end: state.end,
    nodes: state.nodes,
    path: state.path,
    frontier: state.frontier
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setStateNodes: nodes => {
      dispatch({ type: "SET_NODES", nodes });
    },
    setStateFrontier: frontier => {
      dispatch({ type: "SET_FRONTIER", frontier });
    },
    setStatePath: path => {
      dispatch({ type: "SET_PATH", path });
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Algorithms);
