import React, { Component, useState } from "react";
import { MDBContainer, MDBNotification } from "mdbreact";
import "@fortawesome/fontawesome-free/css/all.min.css";

export class Notification extends Component {
  render() {
    return (
      <MDBNotification
        //autohide={5000}
        show
        fade
        icon="location-arrow"
        iconClassName="text-primary"
        title={this.props.label}
        message={this.props.description}
        text="Click to learn more"
        onClick={() => {
          if (this.props.URL) {
            window.open(this.props.URL, "_blank") ||
              window.location.replace(this.props.URL);
          }
        }}
        style={{
          position: "fixed",
          bottom: "10px",
          right: "10px",
          zIndex: 9999
        }}
      />
    );
  }
}
