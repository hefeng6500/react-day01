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
