const initialState = {
  hover: {
    x: 0,
    y: 0,
    hoveredObject: null
  },
  click: { clickedOject: null },
  start: 5173488749,
  end: 6330518860,
  nodes: [],
  path: new Map(),
  frontier: [],
  style: "mapbox://styles/mapbox/dark-v10"
};

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_NODES":
      let newNodes = state.node;
      return {
        ...state,
        nodes: newNodes
      };
    case "SET_FRONTIER":
      let newFrontier = state.frontier;
      return {
        ...state,
        nodes: newFrontier
      };
    case "SET_PATH":
      let newPath = state.path;
      return {
        ...state,
        path: newPath
      };
    default:
      return state;
  }
};
export default rootReducer;
