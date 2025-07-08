/**
 * @file 工具函数
 * @description 提供事件通道相关的工具函数
 */

import type { EventEmitter2 } from 'eventemitter2';
import { Minimatch } from 'minimatch';

/**
 * 检查对象是否为 EventEmitter2 实例
 * @param obj 要检查的对象
 * @returns 是否为 EventEmitter2 实例
 */
export function isEventEmitter2(obj: unknown): obj is EventEmitter2 {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    obj !== null &&
    'emit' in obj &&
    'on' in obj &&
    'once' in obj &&
    'off' in obj &&
    typeof (obj as Record<string, unknown>).emit === 'function' &&
    typeof (obj as Record<string, unknown>).on === 'function' &&
    typeof (obj as Record<string, unknown>).once === 'function' &&
    typeof (obj as Record<string, unknown>).off === 'function'
  );
}

/**
 * 匹配字符串是否符合指定的 glob 模式
 * @param value 要匹配的字符串
 * @param pattern glob 模式
 * @returns 是否匹配
 */
export function matchPattern(value: string | undefined, pattern: string): boolean {
  if (!value) return false;
  if (pattern === '*') return true;
  return new Minimatch(pattern).match(value);
}

/**
 * 最大监听器数量
 */
export const MAX_LISTENERS = 999;
