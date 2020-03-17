import React, { Component } from "react";
import { MDBNotification } from "mdbreact";
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
          fontSize: "12.5px",
          width: "30rem",
          bottom: "10px",
          right: "10px",
          zIndex: 9999
        }}
      />
    );
  }
}
