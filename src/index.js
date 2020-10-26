import React from "./lib/react.js";
import ReactDOM from "./lib/react-dom.js";

// let helloComponent = (
//   <div className="title" style={{ color: "red" }}>
//     <h1>hello</h1>world
//   </div>
// );

// let helloComponent = React.createElement(
//   "div",
//   { className: "title", style: { color: "red" } },
//   React.createElement("h1", {}, "hello"),
//   "world"
// );

function HelloComponent(props) {
  return (
    <div className="title" style={{ color: "red" }}>
      <span>{props.name}</span>
      {props.children}
    </div>
  );
}

let ele = <HelloComponent name="hello"></HelloComponent>;

ReactDOM.render(ele, document.getElementById("root"));
