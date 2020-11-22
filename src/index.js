import React from "./lib/react";
import ReactDOM from "./lib/react-dom";

// import React from "react";
// import ReactDOM from "react-dom";

class ScrollList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
    };
    this.wrapper = React.createRef();
  }

  addMessage() {
    this.setState({
      messages: [`${this.state.messages.length}`, ...this.state.messages],
    });
  }

  render() {
    const style = {
      height: "100px",
      width: "220px",
      border: "1px solid #ddd",
      overflow: "auto",
    };
    return (
      <div style={style} ref={this.wrapper}>
        {this.state.messages.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </div>
    );
  }

  getSnapshotBeforeUpdate() {
    return {
      prevScrollTop: this.wrapper.current.scrollTop,
      prevScrollHeight: this.wrapper.current.scrollHeight,
    };
  }

  componentDidMount() {
    this.timer = setInterval(() => {
      this.addMessage();
    }, 1000);
  }

  componentDidUpdate(
    prevProps,
    prevState,
    { prevScrollTop, prevScrollHeight }
  ) {
    this.wrapper.current.scrollTop =
      prevScrollTop + (this.wrapper.current.scrollHeight - prevScrollHeight);
  }
}

ReactDOM.render(<ScrollList />, document.getElementById("root"));
