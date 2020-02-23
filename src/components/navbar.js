import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Button, Badge, Container } from "react-bootstrap";
import { MapStylePicker } from "./controls";
import Select from "react-select";
//import Algorithms from "./algorithms";

class navbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      algorithm: null
    };
  }

  handleAlgo(e) {
    this.setState({ algorithm: e.value });
  }

  handleStart() {
    switch (this.state.algorithm) {
      case "bfs":
        this.props.bfs();
        break;
      case "dfs":
        this.props.dfs();
        break;
      default:
        console.log("No algorithm selected!");
    }
  }

  render() {
    const algorithms = [
      { value: "bfs", label: "Bread-First Search" },
      { value: "dfs", label: "Depth-First Search" }
    ];

    return (
      <Navbar
        className="justify-content-start"
        bg="secondary"
        variant="dark"
        fixed="top"
      >
        <Badge variant="dark">
          <h6>Pathfinding Visualiser</h6>
        </Badge>

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
            placeholder="Algorithm"
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
            onClick={() => processData()}
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
      </Navbar>
    );
  }
}

export default navbar;
