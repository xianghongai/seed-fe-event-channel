/**
 * @file 事件通道核心功能
 * @description 提供事件通道的核心功能，如创建事件通道实例
 */

import { EventEmitter2, type event, type ListenerFn } from 'eventemitter2';
import { isProtectedEvent } from './protected-events';
import type { EventChannel } from './type';
import { MAX_LISTENERS } from './utils';

/**
 * 创建一个新的事件通道实例
 * @function createEventChannel
 * @returns {EventChannel} 事件通道实例
 */
export function createEventChannel(): EventChannel {
  // 创建 EventEmitter2 实例
  const eventEmitter = new EventEmitter2();
  // 设置最大监听器数量
  eventEmitter.setMaxListeners(MAX_LISTENERS);

  return {
    // 绑定 emit 方法到 eventEmitter 实例
    emit: eventEmitter.emit.bind(eventEmitter),
    // 绑定 on 方法到 eventEmitter 实例
    on: eventEmitter.on.bind(eventEmitter),
    // 绑定 once 方法到 eventEmitter 实例
    once: eventEmitter.once.bind(eventEmitter),
    /**
     * 移除事件监听器
     * @param {event} eventName - 事件名称
     * @param {ListenerFn} [listener] - 可选的监听器函数
     * @returns {EventEmitter2} EventEmitter2 实例
     */
    off: (eventName: event, listener?: ListenerFn) => {
      // 如果是受保护事件，不执行移除操作
      if (typeof eventName === 'symbol' && isProtectedEvent(eventName)) {
        return eventEmitter;
      }
      // 根据是否提供了具体的监听器函数来决定移除方式
      if (listener !== undefined) {
        return eventEmitter.off(eventName, listener);
      } else {
        return eventEmitter.removeAllListeners(eventName);
      }
    },
  };
}

// 导出默认的事件通道实例
export default createEventChannel();
