/**
 * @file 基于 group 和 namespace 的事件操作
 * @description 提供基于 group 和 namespace 的事件监听、触发、移除等功能
 */

import type { EventEmitter2, OnOptions } from 'eventemitter2';
import { createEventChannel } from './core';
import { listProtectedEvents } from './protected-events';
import type { EventHandler } from './type';
import { isEventEmitter2, matchPattern } from './utils';

/**
 * 批量 on 监听 group 下所有受保护事件
 * @param groupPattern 分组 glob
 * @param handler 事件处理函数
 * @param eventEmitter EventEmitter2 实例
 * @param priority 优先级（可选）
 */
export function onGroup(
  groupPattern: string,
  handler: EventHandler,
  eventEmitter: EventEmitter2,
  priority?: number
): void {
  listProtectedEvents().forEach(({ symbol, meta }) => {
    if (matchPattern(meta.group, groupPattern)) {
      if (priority !== undefined) {
        eventEmitter.on(symbol, (...args: unknown[]) => handler(symbol, ...args), { priority } as OnOptions);
      } else {
        eventEmitter.on(symbol, (...args: unknown[]) => handler(symbol, ...args));
      }
    }
  });
}

/**
 * 批量 on 监听 namespace 下所有受保护事件
 * @param namespacePattern 命名空间 glob
 * @param handler 事件处理函数
 * @param eventEmitter EventEmitter2 实例
 * @param priority 优先级（可选）
 */
export function onNamespace(
  namespacePattern: string,
  handler: EventHandler,
  eventEmitter: EventEmitter2,
  priority?: number
): void {
  listProtectedEvents().forEach(({ symbol, meta }) => {
    if (matchPattern(meta.namespace, namespacePattern)) {
      if (priority !== undefined) {
        eventEmitter.on(symbol, (...args: unknown[]) => handler(symbol, ...args), { priority } as OnOptions);
      } else {
        eventEmitter.on(symbol, (...args: unknown[]) => handler(symbol, ...args));
      }
    }
  });
}

/**
 * 批量 once 监听 group 下所有受保护事件
 * @param groupPattern 分组 glob
 * @param handler 事件处理函数
 * @param eventEmitter EventEmitter2 实例
 * @param priority 优先级（可选）
 */
export function onceGroup(
  groupPattern: string,
  handler: EventHandler,
  eventEmitter: EventEmitter2,
  priority?: number
): void {
  listProtectedEvents().forEach(({ symbol, meta }) => {
    if (matchPattern(meta.group, groupPattern)) {
      if (priority !== undefined) {
        eventEmitter.once(symbol, (...args: unknown[]) => handler(symbol, ...args), { priority } as OnOptions);
      } else {
        eventEmitter.once(symbol, (...args: unknown[]) => handler(symbol, ...args));
      }
    }
  });
}

/**
 * 批量 once 监听 namespace 下所有受保护事件
 * @param namespacePattern 命名空间 glob
 * @param handler 事件处理函数
 * @param eventEmitter EventEmitter2 实例
 * @param priority 优先级（可选）
 */
export function onceNamespace(
  namespacePattern: string,
  handler: EventHandler,
  eventEmitter: EventEmitter2,
  priority?: number
): void {
  listProtectedEvents().forEach(({ symbol, meta }) => {
    if (matchPattern(meta.namespace, namespacePattern)) {
      if (priority !== undefined) {
        eventEmitter.once(symbol, (...args: unknown[]) => handler(symbol, ...args), { priority } as OnOptions);
      } else {
        eventEmitter.once(symbol, (...args: unknown[]) => handler(symbol, ...args));
      }
    }
  });
}

/**
 * 批量移除某 group 下所有受保护事件的监听器
 * @param groupPattern 分组 glob
 * @param eventEmitter EventEmitter2 实例
 */
export function offGroup(groupPattern: string, eventEmitter: EventEmitter2): void {
  listProtectedEvents().forEach(({ symbol, meta }) => {
    if (matchPattern(meta.group, groupPattern)) {
      eventEmitter.removeAllListeners(symbol);
    }
  });
}

/**
 * 批量移除某 namespace 下所有受保护事件的监听器
 * @param namespacePattern 命名空间 glob
 * @param eventEmitter EventEmitter2 实例
 */
export function offNamespace(namespacePattern: string, eventEmitter: EventEmitter2): void {
  listProtectedEvents().forEach(({ symbol, meta }) => {
    if (matchPattern(meta.namespace, namespacePattern)) {
      eventEmitter.removeAllListeners(symbol);
    }
  });
}

/**
 * 批量触发所有 group 匹配的受保护事件
 * @param groupPattern 分组 glob
 * @param args 事件参数
 */
export function emitGroup(groupPattern: string, ...args: unknown[]): void {
  let eventEmitter: EventEmitter2;
  if (args.length && isEventEmitter2(args[args.length - 1])) {
    eventEmitter = args.pop() as EventEmitter2;
  } else {
    eventEmitter = createEventChannel() as unknown as EventEmitter2;
  }
  listProtectedEvents().forEach(({ symbol, meta }) => {
    if (matchPattern(meta.group, groupPattern)) {
      eventEmitter.emit(symbol, ...args);
    }
  });
}

/**
 * 批量触发所有 namespace 匹配的受保护事件
 * @param namespacePattern 命名空间 glob
 * @param args 事件参数
 */
export function emitNamespace(namespacePattern: string, ...args: unknown[]): void {
  let eventEmitter: EventEmitter2;
  if (args.length && isEventEmitter2(args[args.length - 1])) {
    eventEmitter = args.pop() as EventEmitter2;
  } else {
    eventEmitter = createEventChannel() as unknown as EventEmitter2;
  }
  listProtectedEvents().forEach(({ symbol, meta }) => {
    if (matchPattern(meta.namespace, namespacePattern)) {
      eventEmitter.emit(symbol, ...args);
    }
  });
}

/**
 * 检查对象是否为 Promise
 * @param obj 要检查的对象
 * @returns 是否为 Promise
 */
function isPromise(obj: unknown): obj is Promise<unknown> {
  return (
    obj !== null && typeof obj === 'object' && 'then' in obj && typeof (obj as { then: unknown }).then === 'function'
  );
}

/**
 * 批量异步触发所有 group 匹配的受保护事件
 * @param groupPattern 分组 glob
 * @param args 事件参数
 * @returns Promise<void>
 */
export async function emitGroupAsync(groupPattern: string, ...args: unknown[]): Promise<void> {
  let eventEmitter: EventEmitter2;
  if (args.length && isEventEmitter2(args[args.length - 1])) {
    eventEmitter = args.pop() as EventEmitter2;
  } else {
    eventEmitter = createEventChannel() as unknown as EventEmitter2;
  }
  const promises: Promise<unknown>[] = [];
  listProtectedEvents().forEach(({ symbol, meta }) => {
    if (matchPattern(meta.group, groupPattern)) {
      const result = eventEmitter.emit(symbol, ...args);
      if (isPromise(result)) {
        promises.push(result);
      }
    }
  });
  if (promises.length) await Promise.all(promises);
}

/**
 * 批量异步触发所有 namespace 匹配的受保护事件
 * @param namespacePattern 命名空间 glob
 * @param args 事件参数
 * @returns Promise<void>
 */
export async function emitNamespaceAsync(namespacePattern: string, ...args: unknown[]): Promise<void> {
  let eventEmitter: EventEmitter2;
  if (args.length && isEventEmitter2(args[args.length - 1])) {
    eventEmitter = args.pop() as EventEmitter2;
  } else {
    eventEmitter = createEventChannel() as unknown as EventEmitter2;
  }
  const promises: Promise<unknown>[] = [];
  listProtectedEvents().forEach(({ symbol, meta }) => {
    if (matchPattern(meta.namespace, namespacePattern)) {
      const result = eventEmitter.emit(symbol, ...args);
      if (isPromise(result)) {
        promises.push(result);
      }
    }
  });
  if (promises.length) await Promise.all(promises);
}

/**
 * 批量移除某 group 下所有受保护事件的一次性监听器
 * @param groupPattern 分组 glob
 * @param eventEmitter EventEmitter2 实例
 */
export function offOnceGroup(groupPattern: string, eventEmitter: EventEmitter2): void {
  listProtectedEvents().forEach(({ symbol, meta }) => {
    if (matchPattern(meta.group, groupPattern)) {
      // 获取所有监听器
      const listeners = eventEmitter.listeners(symbol);

      // 找出非一次性监听器
      const regularListeners = listeners.filter((listener) => {
        // 检查是否为一次性监听器 (EventEmitter2 内部实现)
        return !(listener as unknown as { _once?: boolean })._once;
      });

      // 移除所有监听器
      eventEmitter.removeAllListeners(symbol);

      // 重新注册非一次性监听器
      regularListeners.forEach((listener) => {
        eventEmitter.on(symbol, listener);
      });
    }
  });
}

/**
 * 批量移除某 namespace 下所有受保护事件的一次性监听器
 * @param namespacePattern 命名空间 glob
 * @param eventEmitter EventEmitter2 实例
 */
export function offOnceNamespace(namespacePattern: string, eventEmitter: EventEmitter2): void {
  listProtectedEvents().forEach(({ symbol, meta }) => {
    if (matchPattern(meta.namespace, namespacePattern)) {
      // 获取所有监听器
      const listeners = eventEmitter.listeners(symbol);

      // 找出非一次性监听器
      const regularListeners = listeners.filter((listener) => {
        // 检查是否为一次性监听器 (EventEmitter2 内部实现)
        return !(listener as unknown as { _once?: boolean })._once;
      });

      // 移除所有监听器
      eventEmitter.removeAllListeners(symbol);

      // 重新注册非一次性监听器
      regularListeners.forEach((listener) => {
        eventEmitter.on(symbol, listener);
      });
    }
  });
}
