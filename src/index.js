// import React from "./lib/react";
// import ReactDOM from "./lib/react-dom";

import React from "react";
import ReactDOM from "react-dom";

const wrapper = (OldComponent) => {
  return class NewComponent extends OldComponent {
    state = { number: 0 };
    componentDidMount() {
      console.log("WrapperButton componentDidMount");
      super.componentDidMount();
    }
    handleClick = () => {
      this.setState({ number: this.state.number + 1 });
    };
    render() {
      console.log("WrapperButton render");
      let renderElement = super.render();
      let newProps = {
        ...renderElement.props,
        ...this.state,
        onClick: this.handleClick,
      };
      return React.cloneElement(renderElement, newProps, this.state.number);
    }
  };
};

@wrapper
class Button extends React.Component {
  constructor() {
    super();
    this.state = { name: "张三" };
  }
  componentDidMount() {
    console.log("Button componentDidMount");
  }
  render() {
    console.log("Button render");
    return <button name="test" />;
  }
}

// let WrappedButton = wrapper(Button);

ReactDOM.render(<Button />, document.getElementById("root"));
