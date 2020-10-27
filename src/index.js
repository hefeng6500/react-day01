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

class ClassComponent extends React.Component {
  render() {
    return (
      <div className="title" style={{ color: "red" }}>
        <span>{this.props.name}</span>
      </div>
    );
  }
}
let element = <ClassComponent name="hello"></ClassComponent>;

ReactDOM.render(element, document.getElementById("root"));
