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
            height: 100,
            fontSize: "11px",
            position: "absolute",
            top: "110px",
            right: "5px",
            lineHeight: 0.5
          }}
        >
          <MDBListGroupItem className="d-flex justify-content-between align-items-center">
            Nodes visted in x ms
            <MDBBadge color="primary" pill>
              14
            </MDBBadge>
          </MDBListGroupItem>
          <MDBListGroupItem className="d-flex justify-content-between align-items-center">
            Path length:
            <MDBBadge color="primary" pill>
              2
            </MDBBadge>
          </MDBListGroupItem>
          <MDBListGroupItem className="d-flex justify-content-between align-items-center">
            Distance (Km):
            <MDBBadge color="primary" pill>
              1
            </MDBBadge>
          </MDBListGroupItem>
          <MDBListGroupItem className="d-flex justify-content-between align-items-center">
            Average speed (Km/h):
            <MDBBadge color="primary" pill>
              1
            </MDBBadge>
          </MDBListGroupItem>
        </MDBListGroup>
      </MDBContainer>
    );
  }
}
