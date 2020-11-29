import React from "./lib/react";
import ReactDOM from "./lib/react-dom";

// import React from "react";
// import ReactDOM from "react-dom";

let element = React.createElement(
  "react.fragement",
  null,
  <h1>Hello World!</h1>
);

ReactDOM.render(element, document.getElementById("root"));
