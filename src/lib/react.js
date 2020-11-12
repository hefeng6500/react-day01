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

export default { createElement, Component, createRef };
