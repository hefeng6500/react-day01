import React from "./lib/react.js";
import ReactDOM from "./lib/react-dom.js";

// let helloComponent = (
//   <div className="title" style={{ color: "red" }}>
//     <h1>hello</h1>world
//   </div>
// );

let helloComponent = React.createElement(
  "div",
  { className: "title", style: { color: "red" } },
  React.createElement("h1", {}, "hello"),
  "world"
);

console.log(JSON.stringify(helloComponent, null, 2));
ReactDOM.render(helloComponent, document.getElementById("root"));
