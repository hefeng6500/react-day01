import Component from "./Component.js";

function createElement(type, config, children) {
  let ref;
  if (config) {
    delete config.__source;
    delete config.__self;
    ref = config.ref;
    delete config.ref;
  }

  let props = { ...config };
  if (arguments.length > 3) {
    children = Array.from(arguments).slice(2);
  }

  props.children = children;

  return {
    type,
    props,
    ref,
  };
}

function createRef() {
  return {
    current: null,
  };
}

function createContext() {
  function Provider(props) {
    Provider._value = props.value;
    return props.children;
  }
  function Consumer(props) {
    return props.children(Provider._value);
  }
  return {
    Provider,
    Consumer,
  };
}

function cloneElement(element, props, children) {
  if (arguments.length > 3) {
    children = Array.from(arguments).slice(2);
  }

  return {
    ...element,
    props,
    children,
  };
}

class PureComponent extends Component {
  shouldComponentUpdate(newProps,nextState) {
    return !shallowEqual(this.props, newProps)||!shallowEqual(this.state, nextState);
  }
}
function shallowEqual(obj1, obj2) {
  if (obj1 === obj2) {
    return true;
  }
  if (typeof obj1 != "object" ||obj1 === null ||typeof obj2 != "object" ||obj2 === null) {
    return false;
  }
  let keys1 = Object.keys(obj1);
  let keys2 = Object.keys(obj2);
  if (keys1.length != keys2.length) {
    return false;
  }
  for (let key of keys1) {
    if (!obj2.hasOwnProperty(key) || obj1[key] !== obj2[key]) {
      return false;
    }
  }
  return true;
}

export default {
  createElement,
  Component,
  createRef,
  createContext,
  cloneElement,
  PureComponent
};
