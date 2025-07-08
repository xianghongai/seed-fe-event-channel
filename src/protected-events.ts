/**
 * @file 受保护事件管理
 * @description 提供受保护事件的注册、注销、查询等功能
 */

import type { ProtectedEventInfo, ProtectedEventMeta } from './type';

/**
 * 受保护事件集合，key为symbol，value为元数据及事件名
 */
const protectedEvents = new Map<symbol, { name: string; meta: ProtectedEventMeta }>();

/**
 * 注册受保护事件
 * @param name 事件名
 * @param meta 可选元数据
 * @returns symbol 事件唯一标识
 */
export function registerProtectedEvent(name: string, meta: ProtectedEventMeta = {}): symbol {
  const sym = Symbol(name);
  protectedEvents.set(sym, { name, meta });
  return sym;
}

/**
 * 移除受保护事件
 * @param sym 事件symbol
 * @returns 是否移除成功
 */
export function unregisterProtectedEvent(sym: symbol): boolean {
  return protectedEvents.delete(sym);
}

/**
 * 查询受保护事件元数据
 * @param sym 事件symbol
 * @returns 元数据或undefined
 */
export function getProtectedEventMeta(sym: symbol): ProtectedEventMeta | undefined {
  return protectedEvents.get(sym)?.meta;
}

/**
 * 判断是否为受保护事件
 * @param sym 事件symbol
 * @returns 是否受保护
 */
export function isProtectedEvent(sym: symbol): boolean {
  return protectedEvents.has(sym);
}

/**
 * 获取所有已注册的受保护事件列表
 * @returns 受保护事件信息数组
 */
export function listProtectedEvents(): ProtectedEventInfo[] {
  return Array.from(protectedEvents.entries()).map(([symbol, { name, meta }]) => ({ symbol, name, meta }));
}
