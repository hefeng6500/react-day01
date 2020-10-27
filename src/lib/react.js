import Component from './Component.js';

function createElement(type, config, children) {
  if (config) {
    delete config.__source;
    delete config.__self;
  }

  let props = { ...config };
  if (arguments.length > 3) {
    children = Array.from(arguments).slice(2);
  }

  props.children = children;

  return {
    type,
    props,
  };
}

export default { createElement, Component };
