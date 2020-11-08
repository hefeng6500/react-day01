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
  if (!document[eventType]) {
    document[eventType] = dispatchEvent;
  }
}

function dispatchEvent(event) {
  let { target, type } = event;
  let eventType = `on${type}`;
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
  updateQueue.batchUpdate();
}

function createSyntheticEvent(event) {
  let obj = {};
  for (let key in event) {
    obj[key] = event[key];
  }
  return obj;
}
