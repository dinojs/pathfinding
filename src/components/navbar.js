import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Button, Badge, Form } from "react-bootstrap";
import { MapStylePicker } from "./controls";
import Algorithms from "./algorithms";

class navbar extends Component {
  constructor() {
    super();
    this.onClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    this.props.bfs();
  }

  render() {
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
          <Form inline>
            <Form.Label className="mr-sm-1">Select Algorithm: </Form.Label>
            <Form.Control as="select" className="mr-sm-1" size="sm">
              <optgroup label="Working">
                <option>Bread-First Search</option>
                <option>Dread-First Search</option>
              </optgroup>
              <optgroup label="Work in progress" disabled>
                <option>Work in progress</option>
                <option>Work in progress</option>
                <option>Work in progress</option>
                <option>Work in progress</option>
              </optgroup>
            </Form.Control>
            <Button
              onClick={this.onClick}
              variant="success"
              className="mr-sm-1"
              size="sm"
            >
              START
            </Button>
            <Button variant="danger" className="mr-sm-1" size="sm">
              STOP
            </Button>
            <Button variant="primary" className="mr-sm-1" size="sm">
              CLEAR
            </Button>
            <MapStylePicker
              onStyleChange={this.props.onStyleChange}
              currentStyle={this.props.style}
            />
          </Form>
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
