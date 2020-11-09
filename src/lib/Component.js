import { createDOM } from "./react-dom";
import { isFunction } from "../utils";

export const updateQueue = {
  updaters: new Set(),
  isBatchingUpdate: false,
  add(updater) {
    this.updaters.add(updater);
  },
  batchUpdate() {
    this.updaters.forEach((updater) => updater.updateComponent());
    this.isBatchingUpdate = false;
    this.updaters.clear();
  },
};

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

export default Component;
