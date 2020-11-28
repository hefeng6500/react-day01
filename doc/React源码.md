# React 源码

本笔记仅作为 **源码初探 **之用，张老师的课简化了很多复杂的源码实现。



## Day01

首先实现一个简单的 React 程序，打印一些元素

```jsx | pure
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

```

打印结果：
```json
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
```

### 实现 createElement()

- 返回 virtualDOM 描述真实 DOM

```js
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

```

### 实现 createDOM()、render()

#### 前置知识

**类组件**

- 首字母要大写。小写的是原生组件，首字母大写的为自定义组件
- 返回只有一个根元素的组件
- 先定义，再使用

**类组件如何渲染？**

```jsx | pure
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
```



1、`const counter` 定义类组件的元素

2、`render()` 创建类组件的实例， `new Counter(props)` 

3、调用 `render()` ，得到一个 react 元素

4、转化成真实 DOM，插入到页面中

------

#### createDOM()、render() 源码实现

- 考虑 virtualDOM 类型、`string`、`number`、`object`、`array`
- virtualDOM 节点上的属性、样式挂载到真实 DOM

```js
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

```



- 类组件在经过 `babel`转译之后，会将类转化成函数
- 类组件会在 create-react-app 中将真实 DOM 解析为 vdom 结构
- 在定义类组件时，会把 JSX 所有的属性封装成一个 props 对象传递给组件
- 不管是类组件还是函数式组件 `typeof type` 都是一个 `"function"`。函数式组件不用说，类组件 `class`声明的类就是一个 `function`；
- jsx ？ 是一种语法，打包的时候会进行编译，编译成 `React.createElement()` 的结果
- React 元素指的就是虚拟 DOM，即普通的 JSX 对象，它描述了真实DOM



## Day02

### 实现合成事件

- React V 17.x 以前是将事件委托给 document；

- react 中的 event 是 React 实现的事件，不是原生的 DOM 事件。`let syntheticEvent = createSyntheticEvent(event)`；



​		在 React 合成事件中，元素绑定的事件是委托给 document 对象的。在 document  对象绑定事件监听函数 `dispatchEvent`，当点击元素时，事件会委托至 document，然后 document 监听到点击事件时 触发 `dispatchEvent` ，`dispatchEvent` 会获取当前点击的目标元素 `target.store` 上预先存好的事件函数进行调用。

`document.addEventListener(eventType.slice(2), dispatchEvent);` 这段代码其实绑定一次就够了，因为只是绑定了一个 通用的 `dispatchEvent`，后续调用会根据 target 获取到点击事件，注意这里并不是 target 冒泡导致 document 上的监听事件被执行！



这个合成事件的思路挺奇怪的，为什么要将事件通通交给 document 去代理执行？

- [React源码分析6 — React合成事件系统](https://zhuanlan.zhihu.com/p/25883536)

- [由浅到深的React合成事件](https://juejin.im/post/6844903988794671117)



> 简单的讲挂载的时候，通过listenerBank把事件存起来了，触发的时候document进行dispatchEvent，找到触发事件的最深的一个节点，向上遍历拿到所有的callback放在eventQueue. 根据事件类型构建event对象，遍历执行eventQueue
>
> ​																																																—— @fiveoneLei 腾讯				

​																														

```js
// react-dom.js
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
    } else if (key.startsWith("on")) {
      // dom[key.toLocaleLowerCase()] = props[key];
      addEvent(dom, key.toLocaleLowerCase(), props[key]);
    } else {
      dom[key] = props[key];
    }
  }
}
```

```jsx | pure
// event.js

import { updateQueue } from "./Component";

/**
 *
 * @param {dom} dom
 * @param {eventType} eventType
 * @param {listener} listener
 */
export function addEvent(dom, eventType, listener) {
  let store = dom.store || (dom.store = {});
  store[eventType] = listener;
  // if (!document[eventType]) {
  //   document[eventType] = dispatchEvent;
  // }
  document.addEventListener(eventType.slice(2), dispatchEvent);
}

function dispatchEvent(event) {
  let { target, type } = event;
  let eventType = `on${type}`;
  // isBatchingUpdate 置为 true， 即批量更新
  updateQueue.isBatchingUpdate = true;

  let syntheticEvent = createSyntheticEvent(event);

  // 实现事件冒泡
  while (target) {
    let { store } = target;
    let listener = store && store[eventType];
    listener && listener.call(target, syntheticEvent);
    target = target.parentNode;
  }

  for (let key in syntheticEvent) {
    syntheticEvent[key] = null;
  }

  // 触发批量更新，清空 Set()
  updateQueue.batchUpdate();
}

// 使用原生的 event 成封装 React 自有的 event 对象
function createSyntheticEvent(event) {
  let obj = {};
  for (let key in event) {
    obj[key] = event[key];
  }
  return obj;
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

```jsx | pure
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
    /**
     * 如果是异步更新，当前处于批量更新模式，则 updateQueue.add(this) ，updaters 中存储更新的 Updater 实例
     * 如果是同步更新，则直接调用 updateComponent（）
     */
    updateQueue.isBatchingUpdate
      ? updateQueue.add(this)
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



```jsx | pure
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

- 添加队列函数 `updateQueen` 使用 `add()` 收集 `updaters ` 并使用 `batchUpdate()` 更新(类似发布订阅)

- 修改 index.js 文件内容，手动改变 `isBatchingUpdate` 的值，并手动清空队列更新（这里有点 low ）

```jsx | pure
// index.js
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { number: 0 };
  }
  handleClick = () => {
    updateQueen.isBatchingUpdate = true;
    this.setState({ number: this.state.number + 1 });
    console.log(this.state);

    setTimeout(() => {
      updateQueen.batchUpdate();
    });
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
```

```jsx | pure
export const updateQueen = {
  updaters: new Set(),
  isBatchingUpdate: false,
  add(updater) {
    this.updaters.add(updater);
  },
  batchUpdate() {
    this.updaters.forEach((updater) => updater.updateComponent());
    this.isBatchingUpdate = true;
  },
};
```



### 实现createRef()

```jsx | pure
// react.js

function createRef() {
  return {
    current: null,
  };
}

export default { 
    // ...
    createRef
};
```

```jsx | pure
// react-dom.js

export function createDOM(vdom) {
  // ...
  // ...
  let { type, props, ref } = vdom;
  // ...
  // ...
  // ...

  if (ref) {
    ref.current = dom;
  }
  return dom;
}
```

```jsx | pure
// 实例

class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.firstNumber = React.createRef();
    this.lastNumber = React.createRef();
    this.result = React.createRef();
  }

  add = () => {
    const firstValue = this.firstNumber.current.value;
    const lastValue = this.lastNumber.current.value;
    this.result.current.value = parseInt(firstValue) + parseInt(lastValue);
  };

  render() {
    return (
      <div>
        <input ref={this.firstNumber} /> + <input ref={this.lastNumber} />
        <button onClick={this.add}>=</button>
        <input ref={this.result} />
      </div>
    );
  }
}

const counter = <Counter />;

ReactDOM.render(counter, document.getElementById("root"));
```



### 实现生命周期函数

**旧版本生命周期**

![react-life-cycle.86f3858d](./img/react-life-cycle.86f3858d.jpg)



主要实现的生命周期函数：`constructor`、`componentWillMount`、`componentDidMount`、`componentWillUpdate`、`componentDidUpdate`、`componentWillReceiveProps`



**componentWillMount、componentDidMount**

- `createDOM` 判断类组件时调用 `mountClassComponent`
- ？？？目前老师的写法是写在 `container.appendChild(dom); `之前，我感觉应该写在 `container.appendChild(dom)` 之后

```jsx | pure
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


function mountClassComponent(vdom) {
  const { type, props } = vdom;
  const classInstance = new type(props);

  vdom.classInstance = classInstance;
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
```



**shouldComponentUpdate**

```jsx | pure
class Updater {
  constructor(classInstance) {
    // 类组件实例
    this.classInstance = classInstance;
    // 收集状态
    this.pendingStates = [];
  }

  addState(partialState) {
    this.pendingStates.push(partialState);
    /**
     * 如果是异步更新，当前处于批量更新模式，则 updateQueue.add(this) ，updaters 中存储更新的 Updater 实例
     * 如果是同步更新，则直接调用 updateComponent（）
     */
    this.emitUpdate();
  }

  emitUpdate(nextProps) {
    this.nextProps = nextProps;
    //如果有新的属性拿 到了,或者现在处于非批量模式(异步更新模式),直接更新
    this.nextProps || !updateQueue.isBatchingUpdate
      ? this.updateComponent()
      : updateQueue.add(this);
  }

  updateComponent() {
    let { classInstance, pendingStates, nextProps } = this;
    if (nextProps || pendingStates.length > 0) {
      // 无论是否更新视图， 状态都会被更新
      shouldUpdate(classInstance, nextProps, this.getState());
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

function shouldUpdate(classInstance, nextProps, nextState) {
  if (nextProps) {
    classInstance.props = nextProps;
  }
  classInstance.state = nextState;
  // 如果 shouldComponentUpdate 返回 fale，则不更新页面
  if (
    classInstance.shouldComponentUpdate &&
    !classInstance.shouldComponentUpdate(classInstance.props, nextState)
  ) {
    return;
  }
  classInstance.forceUpdate();
}
```



**componentWillUpdate、componentDidUpdate**

```js
  forceUpdate() {
    if (this.componentWillUpdate) {
      this.componentWillUpdate();
    }

    let newVdom = this.render();
    let currentVdom = compareTwoVdom(
      this.oldVdom.dom.parentNode,
      this.oldVdom,
      newVdom
    );
    this.oldVdom = currentVdom;
    if (this.componentDidUpdate) {
      this.componentDidUpdate();
    }
  }
```



**componentWillReceiveProps**

- 调用栈： compareTwoVdom  -->  updateElement  -->  updateClassInstance -->  componentWillReceiveProps

```js
function compareTwoVdom(parentDOM, oldVdom, newVdom, nextDOM) {
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

function updateClassInstance(oldVdom, newVdom) {
  let classInstance = oldVdom.classInstance;
  //当父组件更新的时候,会让子组件更新
  if (classInstance.componentWillReceiveProps) {
    classInstance.componentWillReceiveProps(newVdom.props);
  }
  //把新的属性传递给emitUpdate方法
  classInstance.updater.emitUpdate(newVdom.props);
}
```





**新版本生命周期**

![react16-life-cycle.7d456cb0.jpg](./img/react16-life-cycle.7d456cb0.jpg)



**getDerivedStateFromProps、getSnapshotBeforeUpdate**

```js
forceUpdate() {
    if (this.componentWillUpdate) {
      this.componentWillUpdate();
    }

    if (this.ownVdom.type.getDerivedStateFromProps) {
      let newState = this.ownVdom.type.getDerivedStateFromProps(
        this.props,
        this.state
      );
      if (newState) {
        this.state = newState;
      }
    }

    let newVdom = this.render();

    let extraArgs =
      this.getSnapshotBeforeUpdate && this.getSnapshotBeforeUpdate();

    let currentVdom = compareTwoVdom(
      this.oldVdom.dom.parentNode,
      this.oldVdom,
      newVdom
    );
    this.oldVdom = currentVdom;
    if (this.componentDidUpdate) {
      this.componentDidUpdate(this.props, this.state, extraArgs);
    }
  }
```

