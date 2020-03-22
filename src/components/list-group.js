import React, { Component } from "react";
import {
  MDBListGroup,
  MDBListGroupItem,
  MDBContainer,
  MDBBadge
} from "mdbreact";

export class ListGroup extends Component {
  render() {
    return (
      <MDBContainer>
        <MDBListGroup
          style={{
            width: 180,
            fontSize: "12px",
            position: "absolute",
            top: "5px",
            right: "5px",
            lineHeight: 0.5
          }}
        >
          <MDBListGroupItem
            className="d-flex justify-content-between align-items-center p-1"
            color="secondary"
          >
            Live nodes count:
            <span> {this.props.data}</span>
          </MDBListGroupItem>
          <MDBListGroupItem className="d-flex   justify-content-between  align-items-center p-1 ">
            Visited{" "}
            <MDBBadge color="primary" pill>
              {this.props.nodesVisited}
            </MDBBadge>{" "}
            nodes in <MDBBadge color="danger">{this.props.runTime}ms</MDBBadge>
          </MDBListGroupItem>
          <MDBListGroupItem className="d-flex justify-content-between align-items-center p-1">
            Path length:
            <MDBBadge color="primary" pill>
              {this.props.pathLength}
            </MDBBadge>
          </MDBListGroupItem>
          <MDBListGroupItem className="d-flex justify-content-between align-items-center p-1">
            Distance:
            <MDBBadge color="primary" pill>
              {this.props.distance} Km
            </MDBBadge>
          </MDBListGroupItem>
          <MDBListGroupItem className="d-flex justify-content-between align-items-center p-1">
            Average speed:
            <MDBBadge color="primary" pill>
              {this.props.speed} Km/h
            </MDBBadge>
          </MDBListGroupItem>
        </MDBListGroup>
      </MDBContainer>
    );
  }
}
