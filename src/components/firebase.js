import firebase from "firebase";
import "firebase/firestore";

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "API",
  authDomain: "pathfinding-1.firebaseapp.com",
  databaseURL: "https://pathfinding-1.firebaseio.com",
  projectId: "pathfinding-1",
  storageBucket: "pathfinding-1.appspot.com",
  messagingSenderId: "134386886799",
  appId: "1:134386886799:web:2be79cafe87129a0b7e8fa",
  measurementId: "G-DYK0K7JL1X",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

export default firebase;
