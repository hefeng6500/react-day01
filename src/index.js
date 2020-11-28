import React from "./lib/react";
import ReactDOM from "./lib/react-dom";

// import React from "react";
// import ReactDOM from "react-dom";

const UserContext = React.createContext({
  user: "hefeng6500",
  avatarSize: "large",
});

function Link(props) {
  return (
    <UserContext.Consumer>
      {({ user }) => {
        return (
          <div>
            {user}
            <div>{props.children}</div>
          </div>
        );
      }}
    </UserContext.Consumer>
  );
}

function Avatar() {
  return (
    <UserContext.Consumer>
      {({ avatarSize }) => {
        return <div>{avatarSize}</div>;
      }}
    </UserContext.Consumer>
  );
}

function NavigationBar(props) {
  return (
    <Link>
      <Avatar />
    </Link>
  );
}

function PageLayout(props) {
  return <NavigationBar />;
}

function Page() {
  return <PageLayout />;
}

class App extends React.Component {
  render() {
    const user = "hefeng6500";
    const avatarSize = "large";
    return (
      <UserContext.Provider value={{ user, avatarSize }}>
        <Page />
      </UserContext.Provider>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
