/**
 * @file 事件分发策略
 * @description 提供不同的事件分发策略实现
 */

import type { EventEmitter2 } from 'eventemitter2';
import { createEventChannel } from './core';
import { listProtectedEvents } from './protected-events';
import type { EventDispatchStrategy } from './type';
import { isEventEmitter2, matchPattern } from './utils';

/**
 * 批量触发所有 group 匹配的受保护事件，支持分发策略
 * @param groupPattern 分组 glob
 * @param strategy 分发策略：parallel(并行)/waterfall(瀑布流)/series(串行)
 * @param args 事件参数
 * @returns Promise<unknown[]> 所有处理器的返回值
 */
export async function emitGroupWithStrategy(
  groupPattern: string,
  strategy: EventDispatchStrategy,
  ...args: unknown[]
): Promise<unknown[]> {
  let eventEmitter: EventEmitter2;
  if (args.length && isEventEmitter2(args[args.length - 1])) {
    eventEmitter = args.pop() as EventEmitter2;
  } else {
    eventEmitter = createEventChannel() as unknown as EventEmitter2;
  }

  // 收集匹配的事件
  const matchedEvents: symbol[] = [];
  listProtectedEvents().forEach(({ symbol, meta }) => {
    if (matchPattern(meta.group, groupPattern)) {
      matchedEvents.push(symbol);
    }
  });

  // 根据策略执行
  if (strategy === 'parallel') {
    // 并行执行所有事件
    const promises = matchedEvents.map((event) => {
      // 使用 emitAsync 来确保返回 Promise
      return eventEmitter.emitAsync(event, ...args);
    });
    return Promise.all(promises);
  } else if (strategy === 'waterfall') {
    // 瀑布流：前一个结果作为下一个输入
    let result = args[0];
    const results: unknown[] = [];
    for (const event of matchedEvents) {
      // 替换第一个参数为上一个结果
      const eventArgs = [...args];
      eventArgs[0] = result;
      // 使用 await 等待每个事件处理完成
      const handlers = eventEmitter.listeners(event);
      if (handlers.length > 0) {
        // 手动调用处理函数获取结果
        result = await handlers[0](...eventArgs);
        results.push(result);
      }
    }
    return results;
  } else if (strategy === 'series') {
    // 串行：依次执行，但不传递结果
    const results: unknown[] = [];
    for (const event of matchedEvents) {
      // 使用 emitAsync 确保返回 Promise
      const result = await eventEmitter.emitAsync(event, ...args);
      results.push(result);
    }
    return results;
  }

  return [];
}
