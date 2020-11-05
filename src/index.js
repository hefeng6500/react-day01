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

// class ClassComponent extends React.Component {
//   render() {
//     return (
//       <div className="title" style={{ color: "red" }}>
//         <span>{this.props.name}</span>
//       </div>
//     );
//   }
// }
// let element = <ClassComponent name="hello"></ClassComponent>;

class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { number: 0 };
  }
  handleClick = () => {
    this.setState({ number: this.state.number + 1 });
    console.log(this.state);
  };
  render() {
    return (
      <div>
        <p>number:{this.state.number}</p>
        <button onClick={this.handleClick}>点击</button>
      </div>
    );
  }
}

ReactDOM.render(<Counter title="计数器" />, document.getElementById("root"));
