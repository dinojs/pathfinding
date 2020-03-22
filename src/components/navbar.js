import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button } from "react-bootstrap";
import { MapStylePicker } from "./controls";
import { Notification } from "./notification";
import Select from "react-select";
import firebase from "./firebase";
import Counter from "./counter.jsx";
import locations from "../data/locations.json"; //Dropdown data
import algoInfo from "../data/algoInfo.json"; //Algorithms description

import {
  MDBNavbar,
  MDBNavbarNav,
  MDBNavbarToggler,
  MDBCollapse,
  MDBContainer
} from "mdbreact";
import { BrowserRouter as Router } from "react-router-dom";

class navbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      algorithm: "Algorithm",
      label: "How does it work?",
      description:
        "Select a STARTING/DESTINATION point by clicking on the nodes ⮕ Select an ALGORITHM ⮕ Click START. Keep me open if you want to learn more about algorithms while using the site",
      collapse: false,
      nodes: null,
      start: "Start",
      end: "Start"
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

  incrementCounter() {
    //Increment counter
    const db = firebase.firestore();
    const increment = firebase.firestore.FieldValue.increment(1);

    const counterRef = db.collection("counter").doc("paths");
    counterRef.update({ counter: increment });
  }

  readCounter() {
    //Read counter on load time
    const db = firebase.firestore();
    let counter;
    db.collection("counter")
      .get()
      .then(snapshot => {
        snapshot.docs.forEach(doc => {
          counter = doc.data().counter;
        });
        this.setState({ counter });
      });
  }
  componentDidMount() {
    this.readCounter();
  }

  handleStart() {
    switch (this.state.algorithm) {
      case "bfs":
        this.props.bfs();
        this.incrementCounter(); //Total paths found all time
        break;
      case "dfs":
        this.props.dfs();
        this.incrementCounter();
        break;
      case "dks":
        this.props.dks();
        this.incrementCounter();
        break;
      case "gbf":
        this.props.gbf();
        this.incrementCounter();
        break;
      case "astar":
        this.incrementCounter();
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
              transparent
              style={{ marginleft: "200px", marginRight: "200px" }} //Avoid list-group collision
            >
              <MDBContainer>
                {!this.state.isWideEnough && (
                  <MDBNavbarToggler onClick={this.onClick} />
                )}
                <MDBCollapse isOpen={this.state.collapse} navbar>
                  <MDBNavbarNav
                    // style={{ marginleft: "200px", marginRight: "200px" }}
                    cetre
                  >
                    <Select
                      options={locations}
                      value={this.props.start}
                      className="col-sm-3"
                      onChange={e => this.props.handleStart(Number(e.value))}
                      placeholder={this.props.start}
                    />

                    <Select
                      options={locations}
                      value={this.props.end}
                      className="col-sm-3"
                      onChange={e => this.props.handleEnd(Number(e.value))}
                      placeholder={this.props.end}
                    />

                    <Select
                      options={algoInfo}
                      className="col-sm-3"
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
        <Counter counter={this.state.counter} />
      </div>
    );
  }
}

export default navbar;
