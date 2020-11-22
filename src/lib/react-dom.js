import { addEvent } from "./event";

function render(vdom, container) {
  const dom = createDOM(vdom);
  container.appendChild(dom);
}

export function createDOM(vdom) {
  // 如果 vdom 是基本类型，说明是文本类型
  if (typeof vdom === "string" || typeof vdom === "number") {
    return document.createTextNode(vdom);
  }

  let { type, props, ref } = vdom;
  let dom;

  if (typeof type === "function") {
    if (type.isReactComponent) {
      //说明这个type是一个类组件的虚拟DOM元素
      return mountClassComponent(vdom);
    } else {
      return mountFunctionComponent(vdom);
    }
  } else {
    dom = document.createElement(type);
  }

  updateDOMAttr(dom, {},props);

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
  if (ref) {
    ref.current = dom;
  }
  return dom;
}

// 用于更新 DOM 节点的属性
function updateDOMAttr(dom, oldProps, newProps) {
  for (let key in newProps) {
    if (key === "children") {
      continue;
    }
    if (key === "style") {
      for (let attr in newProps[key]) {
        dom.style[attr] = newProps[key][attr];
      }
    } else if (key.startsWith("on")) {
      addEvent(dom, key.toLocaleLowerCase(), newProps[key]);
    } else {
      dom[key] = newProps[key];
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

function mountClassComponent(vdom) {
  const { type, props } = vdom;
  const classInstance = new type(props);

  vdom.classInstance = classInstance;
  classInstance.ownVdom = vdom;
  if (classInstance.componentWillMount) {
    classInstance.componentWillMount();
  }
  const renderVdom = classInstance.render();

  const dom = createDOM(renderVdom);
  vdom.dom = renderVdom.dom = dom;
  classInstance.oldVdom = renderVdom;
  classInstance.dom = dom;
  if (classInstance.componentDidMount) {
    classInstance.componentDidMount();
  }
  return dom;
}

/**
 * dom-diff
 * @param {*} parentDOM
 * @param {*} oldVdom
 * @param {*} newVdom
 */
export function compareTwoVdom(parentDOM, oldVdom, newVdom, nextDOM) {
  //如果老的是null新的也是null
  if (!oldVdom && !newVdom) {
    return null;
    //如果老有,新没有,意味着此节点被删除了
  } else if (oldVdom && !newVdom) {
    let currentDOM = oldVdom.dom; //span
    parentDOM.removeChild(currentDOM);
    if (oldVdom.classInstance && oldVdom.classInstance.componentWillUnmount) {
      oldVdom.classInstance.componentWillUnmount();
    }
    return null;
    //如果说老没有,新的有,新建DOM节点
  } else if (!oldVdom && newVdom) {
    let newDOM = createDOM(newVdom); //创建一个新的真实DOM并且挂载到父节点DOM上
    if (nextDOM) {
      //如果有下一个弟弟DOM的话,插到弟弟前面 p child-counter button
      parentDOM.insertBefore(newDOM, nextDOM);
    } else {
      parentDOM.appendChild(newDOM);
    }
    return newVdom;
    //如果类型不同，也不能复用了，也需要把老的替换新的
  } else if (oldVdom && newVdom && oldVdom.type !== newVdom.type) {
    let oldDOM = oldVdom.dom;
    let newDOM = createDOM(newVdom);
    oldDOM.parentNode.replaceChild(newDOM, oldDOM);
    if (oldVdom.classInstance && oldVdom.classInstance.componentWillUnmount) {
      oldVdom.classInstance.componentWillUnmount();
    }
    return newVdom;
  } else {
    //新节点和老节点都有值
    updateElement(oldVdom, newVdom);
    return newVdom;
  }
}

function updateElement(oldVdom, newVdom) {
  //如果走到这个,则意味着我们要复用老的DOM节点了
  let currentDOM = (newVdom.dom = oldVdom.dom); //获取 老的真实DOM
  newVdom.classInstance = oldVdom.classInstance;
  if (typeof oldVdom.type === "string") {
    //原生的DOM类型 div span p
    updateDOMAttr(currentDOM, oldVdom.props, newVdom.props);
    updateChildren(currentDOM, oldVdom.props.children, newVdom.props.children);
  } else if (typeof oldVdom.type === "function") {
    //就是类组件了
    updateClassInstance(oldVdom, newVdom);
  }
}

/**
 *
 * @param {*} parentDOM 父的真实DOM
 * @param {*} oldVChildren  老的虚拟DOM儿子们
 * @param {*} newVChildren  新的虚拟DOM儿子们
 */
function updateChildren(parentDOM, oldVChildren, newVChildren) {
  if (
    (typeof oldVChildren === "string" || typeof oldVChildren === "number") &&
    (typeof newVChildren === "string" || typeof newVChildren === "number")
  ) {
    if (oldVChildren !== newVChildren) {
      parentDOM.innerText = newVChildren;
    }
    return;
  }
  oldVChildren = Array.isArray(oldVChildren) ? oldVChildren : [oldVChildren];
  newVChildren = Array.isArray(newVChildren) ? newVChildren : [newVChildren];
  let maxLength = Math.max(oldVChildren.length, newVChildren.length);
  //其实在DOM是有优化的 关键是某于KEY的优化
  for (let i = 0; i < maxLength; i++) {
    //找此虚拟DOM对应的真实DOM之后的存在的真实DOM
    let nextDOM = oldVChildren.find(
      (item, index) => index > i && item && item.dom
    );
    compareTwoVdom(
      parentDOM,
      oldVChildren[i],
      newVChildren[i],
      nextDOM && nextDOM.dom
    );
  }
}
function updateClassInstance(oldVdom, newVdom) {
  let classInstance = oldVdom.classInstance;
  //当父组件更新的时候,会让子组件更新
  if (classInstance.componentWillReceiveProps) {
    classInstance.componentWillReceiveProps(newVdom.props);
  }
  //把新的属性传递给emitUpdate方法
  classInstance.updater.emitUpdate(newVdom.props);
}

export default {
  render,
};
