/**
 * @file 事件通道实现
 * @description 提供了一个基于 eventemitter2 的事件通道实现，使用函数式编程方式
 */

// 导出核心功能
export { createEventChannel, default } from './core';
// 导出基于 group 和 namespace 的事件操作功能
export {
  emitGroup,
  emitGroupAsync,
  emitNamespace,
  emitNamespaceAsync,
  offGroup,
  offNamespace,
  offOnceGroup,
  offOnceNamespace,
  onceGroup,
  onceNamespace,
  onGroup,
  onNamespace,
} from './group-namespace';

// 导出受保护事件管理功能
export {
  getProtectedEventMeta,
  isProtectedEvent,
  listProtectedEvents,
  registerProtectedEvent,
  unregisterProtectedEvent,
} from './protected-events';
// 导出事件分发策略功能
export { emitGroupWithStrategy } from './strategies';
// 导出类型定义
export * from './type';
