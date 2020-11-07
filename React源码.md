# React 源码



## Day01

首先实现一个简单的 React 程序，打印一些元素

~~~jsx
import React from "react";
import ReactDOM from "react-dom";

// let helloComponent = (
//   <div className="title" style={{ color: "red" }}>
//     <h1>hello</h1>world
//   </div>
// );

let helloComponent = React.createElement(
  "div",
  { className: "title", style: { color: "red" } },
  React.createElement("h1", {}, "hello"),
  "world"
);

console.log(JSON.stringify(helloComponent, null, 2));
ReactDOM.render(helloComponent, document.getElementById("root"));

~~~



~~~json
{
  "type": "div",
  "key": null,
  "ref": null,
  "props": {
    "className": "title",
    "style": {
      "color": "red"
    },
    "children": [
      {
        "type": "h1",
        "key": null,
        "ref": null,
        "props": {
          "children": "hello"
        },
        "_owner": null,
        "_store": {}
      },
      "world"
    ]
  },
  "_owner": null,
  "_store": {}
}
~~~

### 实现 createElement()

- 返回 virtualDOM 描述真实 DOM

~~~js
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

export default { createElement };

~~~

### 实现 createDOM()、render()

#### 前置知识

**类组件**

- 首字母要大写。小写的是原生组件，首字母大写的为自定义组件
- 返回只有一个根元素的组件
- 先定义，再使用

**类组件如何渲染？**

~~~jsx
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { number: 0 };
  }
  handleClick = () => {
    this.setState({ number: this.state.number + 1 });
    console.log(this.state);
  };
  render() {
    return (
      <div>
        <p>number:{this.state.number}</p>
        <button onClick={this.handleClick}>点击</button>
      </div>
    );
  }
}

const counter = <Counter title="计数器" />

ReactDOM.render(counter, document.getElementById("root"));
~~~



1、`const counter` 定义类组件的元素

2、`render()` 创建类组件的实例， `new Counter(props)` 

3、调用 `render()` ，得到一个 react 元素

4、转化成真实 DOM，插入到页面中

------

#### createDOM()、render() 源码实现

- 考虑 virtualDOM 类型、`string`、`number`、`object`、`array`
- virtualDOM 节点上的属性、样式挂载到真实 DOM

~~~js
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

  // 类组件 Count解析的 type 为函数
  if (typeof type === "function") {
    if (type.isReactComponent) {
      // 区分该组件是 类组件
      return mountClassComponent(vdom);
    } else {
      // 函数式组件
      return mountFunctionComponent(vdom);
    }
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

function mountClassComponent(vdom) {
  const { type, props } = vdom;
  const classInstance = new type(props);
  const renderVdom = classInstance.render(); // 虚拟 dom
  const dom = createDOM(renderVdom);
  classInstance.dom = dom;
  return dom;
}

export default {
  render,
};

~~~



- 类组件在经过 `babel`转译之后，会将类转化成函数
- 类组件会在 create-react-app 中将真实 DOM 解析为 vdom 结构
- 在定义类组件时，会把 JSX 所有的属性封装成一个 props 对象传递给组件
- 不管是类组件还是函数式组件 `typeof type` 都是一个 `"function"`。函数式组件不用说，类组件 `class`声明的类就是一个 `function`；
- jsx ？ 是一种语法，打包的时候会进行编译，编译成 `React.createElement()` 的结果
- React 元素指的就是虚拟 DOM，即普通的 JSX 对象，它描述了真实DOM



## Day02

### 实现事件绑定

```js
// react-dom.js
function updateDOMAttr(dom, props) {
  for (let key in props) {
    if (key === "children") {
      continue;
    }
    if (key === "style") {
      for (let attr in props[key]) {
        dom.style[attr] = props[key][attr];
      }
    } else if (key.startsWith("on")) {
      // onClick => onclick
      dom[key.toLocaleLowerCase()] = newProps[key]
    } else {
      dom[key] = props[key];
    }
  }
}
```



### 实现 setState() 

#### 同步更新

- 当调用 `this.setState()` 时，实际调用 Component  类的 `setState`
- 创建 Updater 类
  - 用于收集状态 `addState()`,`this.pendingStates = []` 
  - 合并状态，`getState()`
  - 触发视图进行强制刷新，`updateComponent()`
- Component  类中 `forceUpdate()` 强制更新视图，将虚拟 dom 转化为真实 dom，挂载到视图

```jsx
// Component.js
class Updater {
  constructor(classInstance) {
    // 类组件实例
    this.classInstance = classInstance;
    // 收集状态
    this.pendingStates = [];
  }

  addState(partialState) {
    this.pendingStates.push(partialState);
    // 如果当前处于批量更新模式
    updateQueen.isBatchingUpdate
      ? updateQueen.add(this)
      : this.updateComponent();
  }

  updateComponent() {
    let { classInstance } = this;
    if (this.pendingStates.length > 0) {
      // 替换 state 为最新的状态
      classInstance.state = this.getState();
      // 强制视图进行更新
      classInstance.forceUpdate();
    }
  }
  // 获取最新的状态
  getState() {
    let { classInstance, pendingStates } = this;
    let { state } = classInstance;
    if (pendingStates.length > 0) {
      pendingStates.forEach((nextState) => {
        if (isFunction(nextState)) {
          nextState = nextState(state);
        } else {
          state = { ...state, ...nextState };
        }
      });
      pendingStates.length = 0;
    }
    return state;
  }
}

```



```jsx
// Component.js
class Component {
  static isReactComponent = true;
  constructor(props) {
    this.props = props;
    this.state = {};

    this.updater = new Updater(this);
  }

  setState(partialState) {
    this.updater.addState(partialState);
  }

  // 更新视图
  forceUpdate() {
    // 此时 renderVdom 已经是更新后的虚拟 DOM（state已经更新）
    let renderVdom = this.render();
    updateClassComponent(this, renderVdom);
  }
}

function updateClassComponent(classInstance, renderVdom) {
  let oldDOM = classInstance.dom;
  let newDOM = createDOM(renderVdom);
  oldDOM.parentNode.replaceChild(newDOM, oldDOM);
  classInstance.dom = newDOM;
}
```



#### 异步更新



