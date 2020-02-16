import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Button, DropdownButton, Dropdown } from "react-bootstrap";
import { MapStylePicker } from "./controls";

class navbar extends Component {
  render() {
    return (
      <Navbar
        className="justify-content-center"
        bg="light"
        variant="light"
        fixed="top"
      >
        <DropdownButton
          id="dropdown-basic-button"
          title="Select an algorithm"
          size="sm"
        >
          <Dropdown.Item>BFS</Dropdown.Item>
          <Dropdown.Item href="#/action-2">DFS</Dropdown.Item>
        </DropdownButton>
        <Button variant="success" size="sm">
          START
        </Button>
        <Button variant="danger" size="sm">
          STOP
        </Button>
        <Button variant="warning" size="sm">
          CLEAR
        </Button>
        <MapStylePicker
          onStyleChange={this.props.onStyleChange}
          currentStyle={this.props.style}
        />
        Path length:{" "}
        <span className="badge badge-pill badge-secondary">
          {this.props.data.length}
        </span>
      </Navbar>
    );
  }
}

export default navbar;
