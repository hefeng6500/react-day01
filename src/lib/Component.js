import { createDOM, compareTwoVdom } from "./react-dom";
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
}

export default Component;
