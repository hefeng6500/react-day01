// import React from "./lib/react";
// import ReactDOM from "./lib/react-dom";

import React from "react";
import ReactDOM from "react-dom";

function Link(props) {
  return (
    <div>
      <a>a标签</a>
      <p>{props.children}</p>
    </div>
  );
}

function Avatar(props) {
  return <p>Avatar: {props.avatarSize}</p>;
}

function NavigationBar(props) {
  return (
    <div>
      {props.topBar}
      {props.children}
    </div>
  );
}

function PageLayout(props) {
  return <NavigationBar topBar={props.topBar} />;
}

function Page(props) {
  const { user, avatarSize } = props;
  const topBar = (
    <NavigationBar>
      <Link user={user}>
        <Avatar avatarSize={avatarSize} />
      </Link>
    </NavigationBar>
  );
  return <PageLayout topBar={topBar} />;
}

class App extends React.Component {
  render() {
    const user = "hefeng6500";
    const avatarSize = "large";
    return <Page user={user} avatarSize={avatarSize} />;
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
