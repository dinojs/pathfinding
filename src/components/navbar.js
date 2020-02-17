import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Button, Badge, Form } from "react-bootstrap";
import { MapStylePicker } from "./controls";

class navbar extends Component {
  render() {
    return (
      <Navbar
        className="justify-content-start"
        bg="light"
        variant="light"
        fixed="top"
      >
        <Navbar.Collapse className="justify-content-center">
          Select Algorithm:
          <Form>
            <Form.Control as="select" size="sm">
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
          </Form>
          <Button variant="primary" size="sm">
            START
          </Button>
          <Button variant="danger" size="sm">
            STOP
          </Button>
          <Button variant="secondary" size="sm">
            CLEAR
          </Button>
          <MapStylePicker
            onStyleChange={this.props.onStyleChange}
            currentStyle={this.props.style}
          />
        </Navbar.Collapse>
        <Button variant="dark" size="sm">
          Nodes visited:{" "}
          <Badge pill variant="light">
            {this.props.data.length}
          </Badge>
        </Button>
      </Navbar>
    );
  }
}

export default navbar;
