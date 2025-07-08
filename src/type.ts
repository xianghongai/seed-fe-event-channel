/**
 * @file 事件通道类型定义
 * @description 定义事件通道的接口和类型
 */

import { type EventEmitter2, type event, type ListenerFn, OnOptions } from 'eventemitter2';

/**
 * 事件通道接口定义
 * @interface EventChannel
 * @extends EventEmitter2
 */
export interface EventChannel {
  /**
   * 触发事件
   * @param {event} eventName - 事件名称
   * @param {unknown[]} args - 事件参数
   * @returns {boolean} 是否有监听器处理了此事件
   */
  emit: (eventName: event, ...args: unknown[]) => boolean;

  /**
   * 添加事件监听器
   * @param {event} eventName - 事件名称
   * @param {ListenerFn} listener - 监听器函数
   * @param {OnOptions} [options] - 可选的监听选项
   * @returns {EventEmitter2} EventEmitter2 实例
   */
  on: EventEmitter2['on'];

  /**
   * 添加一次性事件监听器
   * @param {event} eventName - 事件名称
   * @param {ListenerFn} listener - 监听器函数
   * @param {OnOptions} [options] - 可选的监听选项
   * @returns {EventEmitter2} EventEmitter2 实例
   */
  once: EventEmitter2['once'];

  /**
   * 移除事件监听器
   * @param {event} eventName - 事件名称
   * @param {ListenerFn} [listener] - 可选的监听器函数
   * @returns {EventEmitter2} EventEmitter2 实例
   */
  off: (eventName: event, listener?: ListenerFn) => EventEmitter2;
}

/**
 * 受保护事件元数据
 * @interface ProtectedEventMeta
 */
export interface ProtectedEventMeta {
  /**
   * 事件描述
   */
  description?: string;
  /**
   * 其他自定义元数据
   */
  [key: string]: unknown;
}

/**
 * 受保护事件信息
 */
export type ProtectedEventInfo = {
  symbol: symbol;
  name: string;
  meta: ProtectedEventMeta;
};

/**
 * 事件处理结果
 */
export type EventResult = unknown;
