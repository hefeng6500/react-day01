// import React from "./lib/react";
// import ReactDOM from "./lib/react-dom";

import React from "react";
import ReactDOM from "react-dom";

class MouseTracker extends React.Component {
  constructor() {
    super();
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
      <div onMouseMove={this.mouseMove} style={{border: "1px solid red"}}>
        <h1>移动鼠标</h1>
        <h1>X: {this.state.x}</h1>
        <h1>Y: {this.state.y}</h1>
      </div>
    );
  }
}

ReactDOM.render(<MouseTracker />, document.getElementById("root"));
