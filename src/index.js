// import React from "./lib/react";
// import ReactDOM from "./lib/react-dom";

import React from "react";
import ReactDOM from "react-dom";

const ThemeContext = React.createContext("light");

class Button extends React.Component {
  // static contextType = ThemeContext;
  render() {
    return <button theme={this.context}>{this.context} </button>;
  }
}

Button.contextType = ThemeContext

class ThemedButton extends React.Component {
  render() {
    return <Button />;
  }
}

function Toolbar(props) {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}
class App extends React.Component {
  render() {
    return (
      <ThemeContext.Provider value="dark">
        <Toolbar />
      </ThemeContext.Provider>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
