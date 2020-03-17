import React from "react";
import { countercss, counterText } from "./style.js";
const Counter = props => {
  return (
    <div>
      <div style={countercss}>{props.counter} paths found</div>
      <div style={counterText}>with path-finding.com</div>
    </div>
  );
};

export default Counter;
