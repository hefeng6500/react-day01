import React from "./lib/react";
import ReactDOM from "./lib/react-dom";

// import React from "react";
// import ReactDOM from "react-dom";
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

// class Counter extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = { number: 0 };
//   }
//   handleClick = () => {
//     this.setState({ number: this.state.number + 1 });
//     this.setState({ number: this.state.number + 1 });
//     console.log(this.state);
//   };

//   test() {
//     console.log("test");
//   }
//   render() {
//     return (
//       <div>
//         <p>number:{this.state.number}</p>
//         <button onClick={this.test}>test</button>
//         <button onClick={this.handleClick}>点击</button>
//       </div>
//     );
//   }
// }

// const counter = <Counter title="计数器" />;

// class Counter extends React.Component {
//   constructor(props) {
//     super(props);
//     this.firstNumber = React.createRef();
//     this.lastNumber = React.createRef();
//     this.result = React.createRef();
//   }

//   add = () => {
//     const firstValue = this.firstNumber.current.value;
//     const lastValue = this.lastNumber.current.value;
//     this.result.current.value = parseInt(firstValue) + parseInt(lastValue);
//   };

//   render() {
//     return (
//       <div>
//         <input ref={this.firstNumber} /> + <input ref={this.lastNumber} />
//         <button onClick={this.add}>=</button>
//         <input ref={this.result} />
//       </div>
//     );
//   }
// }

// const counter = <Counter />;

// ReactDOM.render(counter, document.getElementById("root"));

class Child extends React.Component {
  shouldComponentUpdate(nextProps, nextStates) {
    console.log("2. Child shouldComponentUpdate is running");
    return nextStates.number % 2 === 0;
  }

  constructor(props) {
    super(props);
    console.log("1. Child constructor is running");
    this.state = {
      number: 0,
    };
  }

  render() {
    console.log("3. Child render is running");
    return <div>{this.props.count}</div>;
  }

  componentWillMount() {
    console.log("4. Child componentWillMount is running");
  }

  componentDidMount() {
    console.log("5. Child componentDidMount is running");
  }

  componentWillReceiveProps(nextProps, state) {
    console.log("5. Child componentWillReceiveProps is running");
  }

  componentWillUpdate() {
    console.log("6. Child componentWillUpdate is running");
  }

  componentDidUpdate() {
    console.log("7. ChildcomponentDidUpdate is running");
  }

  componentWillUnmount() {
    console.log("8. Child componentWillUnmount is running");
  }
}

class Parent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      number: 0,
    };

    console.log("1. constructor is running");
  }

  add = () => {
    this.setState({
      number: this.state.number + 1,
    });
  };

  // shouldComponentUpdate(nextProps, nextStates) {
  //   console.log("2. shouldComponentUpdate is running");
  //   return nextStates.number % 2 === 0;
  // }

  render() {
    console.log("3. render is running");
    return (
      <div>
        <h1>{this.state.number}</h1>
        {this.state.number === 4 ? null : <Child count={this.state.number} />}
        <button onClick={this.add}>Click</button>
      </div>
    );
  }

  componentWillMount() {
    console.log("4. componentWillMount is running");
  }

  componentDidMount() {
    console.log("5. componentDidMount is running");
  }

  componentWillUpdate() {
    console.log("6. componentWillUpdate is running");
  }

  componentDidUpdate() {
    console.log("7. componentDidUpdate is running");
  }

  componentWillUnmount() {
    console.log("8. componentWillUnmount is running");
  }
}

const parent = <Parent />;

ReactDOM.render(parent, document.getElementById("root"));
