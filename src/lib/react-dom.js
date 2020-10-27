function render(vdom, container) {
  const dom = createDOM(vdom);
  container.appendChild(dom);
}

function createDOM(vdom) {
  // 如果 vdom 是基本类型，说明是文本类型
  if (typeof vdom === "string" || typeof vdom === "number") {
    return document.createTextNode(vdom);
  }

  let { type, props } = vdom;
  let dom;

  if (typeof type === "function") {
    return mountFunctionComponent(vdom);
  } else {
    dom = document.createElement(type);
  }

  updateDOMAttr(dom, props);

  if (
    typeof props.children === "string" ||
    typeof props.children === "number"
  ) {
    dom.textContent = props.children;
  } else if (typeof props.children == "object" && props.children.type) {
    // 如果单元素节点
    // 假如是这样的 children: { type: "div", props: {children: "hello"} }
    render(props.children, dom);
  } else if (Array.isArray(props.children)) {
    //是数组的话
    reconcileChildren(props.children, dom);
  } else {
    dom.textContent = props.children ? props.children.toString() : "";
  }
  vdom.dom = dom;
  return dom;
}

// 用于更新 DOM 节点的属性
function updateDOMAttr(dom, props) {
  for (let key in props) {
    if (key === "children") {
      continue;
    }
    if (key === "style") {
      for (let attr in props[key]) {
        dom.style[attr] = props[key][attr];
      }
    } else {
      dom[key] = props[key];
    }
  }
}

// 渲染 children 有多个元素的节点
function reconcileChildren(childrenVdom, parentDOM) {
  for (let i = 0; i < childrenVdom.length; i++) {
    let childVdom = childrenVdom[i];
    render(childVdom, parentDOM);
  }
}

function mountFunctionComponent(vdom) {
  const { type, props } = vdom;
  const renderVdom = type(props);
  return createDOM(renderVdom);
}

export default {
  render,
};
