import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Badge } from "react-bootstrap";
import { MapStylePicker } from "./controls";
import { Notification } from "./notification";
import Select from "react-select";
//import Algorithms from "./algorithms";
import {
  MDBNavbar,
  MDBNavbarBrand,
  MDBNavbarNav,
  MDBNavbarToggler,
  MDBCollapse,
  MDBContainer
} from "mdbreact";
import { BrowserRouter as Router } from "react-router-dom";

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
      "Can be WEIGHTED and DOESN'T GUARANTEE the shortest path. A faster, more heuristic-heavy version of A*",
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
        "Select a STARTING/DESTINATION point by clicking on the nodes ⮕ Select an ALGORITHM ⮕ Click START. Keep me open if you want to learn more about algorithms while using the site",
      collapse: false
    };
    this.onClick = this.onClick.bind(this);
  }
  onClick() {
    this.setState({
      collapse: !this.state.collapse
    });
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
      <div>
        <header>
          <Router>
            <MDBNavbar
              color="bg-primary"
              fixed="top"
              dark
              expand="md"
              fixed="top"
              scrolling
              transparent
            >
              <MDBContainer>
                {/* <MDBNavbarBrand href="/">
                  <strong>Pathfinding visualiser</strong>
                </MDBNavbarBrand> */}
                {!this.state.isWideEnough && (
                  <MDBNavbarToggler onClick={this.onClick} />
                )}
                <MDBCollapse isOpen={this.state.collapse} navbar>
                  <MDBNavbarNav centre>
                    <Select
                      options={algorithms}
                      className="col-sm-3 sm"
                      placeholder={this.props.start}
                      size="sm"
                    />

                    <Select
                      options={algorithms}
                      className="col-sm-3 sm"
                      placeholder={this.props.end}
                    />

                    <Select
                      options={algorithms}
                      className="col-sm-3 sm"
                      onChange={e => this.handleAlgo(e)}
                      placeholder={this.state.algorithm}
                    />
                    <Button
                      size="sm"
                      onClick={() => this.handleStart()} //()=> so that it doesn't get called as soon as mounted
                      variant="primary"
                      className="mr-sm-2 font-weight-bold"
                    >
                      START
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => this.props.setInitialView()}
                      variant="danger"
                      className="mr-sm-2"
                    >
                      CLEAR
                    </Button>
                    <MapStylePicker
                      onStyleChange={this.props.onStyleChange}
                      currentStyle={this.props.style}
                    />
                  </MDBNavbarNav>
                </MDBCollapse>
              </MDBContainer>
            </MDBNavbar>
          </Router>
        </header>
        <Notification
          algorithm={this.state.algorithm}
          label={this.state.label}
          description={this.state.description}
          URL={this.state.URL}
        />
      </div>
    );
  }
}

export default navbar;
