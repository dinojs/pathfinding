const data = require("./data/nodes.json");
const graph = data[0];

const nodes = require("./data/connected.json");
let connected = [];

//Copy this in processData in app.js
getConnectedGraph = () => {
  for (let i of nodes) {
    //Array of connected nodes
    if (!connected.includes(i)) {
      connected.push(i, {
        //Find replace ", with ":
        lat: graph[i].lat,
        lon: graph[i].lon,
        adj: graph[i].adj,
        w: graph[i].w
      }); //Add { at the beginning and } at the end
    }
  }
  console.info(connected);
};
