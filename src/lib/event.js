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
  debugger;
  let { target, type } = event;
  let eventType = `on${type}`;
  updateQueue.isBatchingUpdate = true;
  let { store } = target;
  let listener = store && store[eventType];
  let syntheticEvent = createSyntheticEvent(event);
  listener.call(target, syntheticEvent);
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
