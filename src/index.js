// import React from "./lib/react";
// import ReactDOM from "./lib/react-dom";

import React from "react";
import ReactDOM from "react-dom";

let Text = function (props) {
  return (
    <>
      <h1>移动鼠标</h1>
      <h1>X: {props.x}</h1>
      <h1>Y: {props.y}</h1>
    </>
  );
};

function WithMouseTracker(OlcComponent) {
  return class MouseTracker extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        x: 0,
        y: 0,
      };
    }

    mouseMove = (event) => {
      this.setState({
        x: event.clientX,
        y: event.clientY,
      });
    };

    render() {
      return (
        <div onMouseMove={this.mouseMove} style={{ border: "1px solid red" }}>
          <OlcComponent {...this.state} />
        </div>
      );
    }
  };
}

const HightOrder = WithMouseTracker(Text);

ReactDOM.render(<HightOrder />, document.getElementById("root"));
