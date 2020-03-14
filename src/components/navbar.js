import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Button, Badge, Container } from "react-bootstrap";
import { MapStylePicker } from "./controls";
import { Notification } from "./notification";
import Select from "react-select";
//import Algorithms from "./algorithms";

const algorithms = [
  {
    value: "bfs",
    label: "Bread-First Search",
    description: "UNWEIGHTED and GUARANTEES the shortest path!",
    URL: "https://en.wikipedia.org/wiki/Breadth-first_search"
  },
  {
    value: "dfs",
    label: "Depth-First Search",
    description: "UNWEIGHTED and DOESN'T GUARANTEE the shortest path!",
    URL: "https://en.wikipedia.org/wiki/Depth-first_search"
  },
  {
    value: "dks",
    label: "Dijkstra’s",
    description: "WEIGHTED and GUARANTEES the shortest path!",
    URL: "https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm"
  },
  {
    value: "gbf",
    label: "Greedy Best First Search",
    description:
      "WEIGHTED and DOESN'T GUARANTEE the shortest path. A faster, more heuristic-heavy version of A*",
    URL: "https://en.wikipedia.org/wiki/Best-first_search"
  },
  {
    value: "astar",
    label: "A* Algorithm",
    description:
      "WEIGHTED and GUARANTEES the shortest path. Probably, the best pathfinding algorithm; uses heuristics to guarantee the shortest path much faster than Dijkstra's Algorithm",
    URL: "https://en.wikipedia.org/wiki/A*_search_algorithm"
  }
];

class navbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      algorithm: "Algorithm",
      label: "How does it work?",
      description:
        "Select a STARTING/DESTINATION point by clicking on the nodes ⮕ Select an ALGORITHM ⮕ Click START. Keep me open if you want to learn more about algorithms while using the site"
    };
  }

  handleAlgo(e) {
    this.setState({
      algorithm: e.value,
      label: e.label,
      description: e.description,
      URL: e.URL
    });
  }

  handleStart() {
    switch (this.state.algorithm) {
      case "bfs":
        this.props.bfs();
        break;
      case "dfs":
        this.props.dfs();
        break;
      case "dks":
        this.props.dks();
        break;
      case "gbf":
        this.props.gbf();
        break;
      case "astar":
        this.props.astar();
        break;
      default:
        console.log("No algorithm selected!");
    }
  }

  render() {
    return (
      <Navbar
        className="justify-content-start"
        bg="secondary"
        variant="dark"
        fixed="top"
      >
        {/* <Badge variant="dark">
          <h6>Pathfinding Visualiser</h6>
        </Badge> */}

        <Navbar.Collapse className="justify-content-center">
          <Select
            options={algorithms}
            className="col-2 "
            placeholder={this.props.start}
            size="sm"
          />
          <Select
            options={algorithms}
            className="col-2  "
            placeholder={this.props.end}
          />

          <Select
            options={algorithms}
            className="col-2 "
            onChange={e => this.handleAlgo(e)}
            placeholder={this.state.algorithm}
          />
          <Button
            onClick={() => this.handleStart()} //()=> so that it doesn't get called as soon as mounted
            variant="primary"
            className="mr-sm-1 font-weight-bold"
            size="md"
          >
            START
          </Button>
          <Button
            onClick={() => this.props.setInitialView()}
            variant="danger"
            className="mr-sm-1"
            size="md"
          >
            CLEAR
          </Button>
          <MapStylePicker
            onStyleChange={this.props.onStyleChange}
            currentStyle={this.props.style}
          />
        </Navbar.Collapse>

        <Badge variant="dark">
          <h6>
            Nodes visited:{" "}
            <Badge pill variant="light">
              {this.props.data.length}
            </Badge>
          </h6>
        </Badge>
        <Notification
          algorithm={this.state.algorithm}
          label={this.state.label}
          description={this.state.description}
          URL={this.state.URL}
        />
      </Navbar>
    );
  }
}

export default navbar;
