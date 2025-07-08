# 事件通道设计文档

## 概述

事件通道（Event Channel）是一个基于 EventEmitter2 的事件系统封装，提供了更强大的事件管理功能。它主要解决以下问题：

1. 保护关键事件监听器不被意外移除
2. 提供简洁的函数式 API

## 核心功能

### 受保护事件

通过 Symbol 实现的受保护事件机制，确保关键事件监听器不会被意外移除。

```typescript
// 注册受保护事件
const myEvent = registerProtectedEvent('MY_EVENT', {
  description: '重要事件'
});

// 添加监听器
eventChannel.on(myEvent, handler);

// 尝试移除监听器 - 无效
eventChannel.off(myEvent, handler); // 不会真正移除

// 取消保护
unregisterProtectedEvent(myEvent);

// 现在可以移除
eventChannel.off(myEvent, handler); // 成功移除
```

## 技术实现

### 函数式API设计

采用函数式API设计，提供一系列独立功能函数，而不是类方法，便于按需引入和使用。

```typescript
import {
  createEventChannel,
  registerProtectedEvent,
} from '@seed-fe/event-channel';
```

### 事件保护机制

使用 Symbol 作为事件键，配合 Map 存储元数据，实现事件保护机制：

```typescript
// 内部实现
const protectedEvents = new Map<symbol, { name: string; meta: ProtectedEventMeta }>();

function registerProtectedEvent(name: string, meta: ProtectedEventMeta = {}): symbol {
  const sym = Symbol(name);
  protectedEvents.set(sym, { name, meta });
  return sym;
}
```

## 使用场景

1. **大型前端应用**: 管理复杂的事件系统，避免事件冲突
2. **关键系统事件**: 保护重要的系统事件监听器不被意外移除
3. **应用核心功能**: 确保核心功能的事件处理逻辑不被干扰

## 性能考虑

1. 使用 Map 存储受保护事件，提供 O(1) 的查找性能
2. 通过 EventEmitter2 的内部优化获得高效的事件分发

## 扩展

1. 可通过 [minimatch](https://www.npmjs.com/package/minimatch)、[micromatch](https://www.npmjs.com/package/micromatch) 等库实现更强大的事件匹配功能
2. 可通过 [broadcast-channel](https://www.npmjs.com/package/broadcast-channel)(tab/proces/iframe/worker)、[web-worker](https://www.npmjs.com/package/web-worker)(web worker)、[comlink](https://www.npmjs.com/package/comlink)、[penpal](https://www.npmjs.com/package/penpal)、[post-robot](https://www.npmjs.com/package/post-robot)、[postmate](https://www.npmjs.com/package/postmate)(iframe) 等库实现跨 iframe/web worker 通信通信
