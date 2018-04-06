import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";
import firebase from "firebase";

firebase.initializeApp({
  apiKey: "AIzaSyAWZBrOgJf0jvzG5DaWZvLWrdnrixDGnW8",
  authDomain: "goalsetter-project.firebaseapp.com",
  databaseURL: "https://goalsetter-project.firebaseio.com",
  projectId: "goalsetter-project",
  storageBucket: "goalsetter-project.appspot.com",
  messagingSenderId: "356858607703"
});

ReactDOM.render(
  <App db={firebase.database()} />,
  document.getElementById("root")
);
registerServiceWorker();
