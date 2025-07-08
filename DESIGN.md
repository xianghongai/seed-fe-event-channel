# 事件通道设计文档

## 概述

事件通道（Event Channel）是一个基于 EventEmitter2 的事件系统封装，提供了更强大的事件管理功能。它主要解决以下问题：

1. 保护关键事件监听器不被意外移除
2. 提供事件分组和命名空间支持
3. 支持批量操作和通配符匹配
4. 提供事件分发策略支持

## 核心功能

### 1. 受保护事件

通过 Symbol 实现的受保护事件机制，确保关键事件监听器不会被意外移除。

```typescript
// 注册受保护事件
const myEvent = registerProtectedEvent('MY_EVENT', {
  description: '重要事件',
  group: 'core',
  namespace: 'system'
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

### 2. 事件分组和命名空间

支持通过分组（group）和命名空间（namespace）组织事件，便于批量操作和管理。

```typescript
// 注册带分组和命名空间的事件
const userLoginEvent = registerProtectedEvent('USER_LOGIN', {
  group: 'user',
  namespace: 'auth'
});

const userLogoutEvent = registerProtectedEvent('USER_LOGOUT', {
  group: 'user',
  namespace: 'auth'
});

// 查询特定分组或命名空间的事件
const userEvents = listProtectedEvents({ group: 'user' });
const authEvents = listProtectedEvents({ namespace: 'auth' });
```

### 3. 批量操作和通配符匹配

支持使用通配符进行批量事件监听、触发和移除。

```typescript
// 批量监听某个分组的所有事件
onGroup('user*', (event, ...args) => {
  console.log(`User event triggered: ${event}`, args);
});

// 批量触发某个命名空间的所有事件
emitNamespace('auth', { userId: '123' });

// 批量移除监听器
offGroup('user*');
```

### 4. 事件分发策略

支持多种事件分发策略，满足不同的业务场景需求。

```typescript
// 并行执行所有匹配事件的处理函数
await emitGroupWithStrategy('plugin*', 'parallel', data);

// 瀑布流执行，前一个处理函数的返回值作为下一个的输入
const results = await emitGroupWithStrategy('transform*', 'waterfall', initialData);

// 串行执行，依次执行但不传递结果
await emitGroupWithStrategy('validation*', 'series', formData);
```

### 5. 批量移除一次性监听器

提供了专门的API用于批量移除某个分组或命名空间下的一次性监听器，保留普通监听器。

```typescript
// 注册一次性监听器和普通监听器
emitter.once(eventA, onceHandler);
emitter.on(eventA, regularHandler);

// 移除分组下的所有一次性监听器
offOnceGroup('group1', emitter);

// 此时只有普通监听器会被触发
emitter.emit(eventA, data); // 只有 regularHandler 会执行
```

## 技术实现

### 函数式API设计

采用函数式API设计，提供一系列独立功能函数，而不是类方法，便于按需引入和使用。

```typescript
import {
  createEventChannel,
  registerProtectedEvent,
  onGroup,
  emitNamespace,
  emitGroupWithStrategy
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

### 批量操作实现

使用 minimatch 库实现通配符匹配，支持复杂的模式匹配：

```typescript
function matchPattern(value: string | undefined, pattern: string): boolean {
  if (!value) return false;
  if (pattern === '*') return true;
  return new Minimatch(pattern).match(value);
}
```

### 事件分发策略

实现三种分发策略：

1. **parallel**: 并行执行所有匹配事件的处理函数
2. **waterfall**: 瀑布流执行，前一个处理函数的返回值作为下一个的输入
3. **series**: 串行执行，依次执行但不传递结果

## 使用场景

1. **大型前端应用**: 管理复杂的事件系统，避免事件冲突
2. **插件系统**: 实现可扩展的插件架构
3. **微前端**: 跨应用通信和事件协调
4. **工作流处理**: 使用瀑布流策略实现数据处理管道

## 性能考虑

1. 使用 Map 存储受保护事件，提供 O(1) 的查找性能
2. 批量操作时优先使用过滤而非多次查询
3. 通过 EventEmitter2 的内部优化获得高效的事件分发

## 未来扩展

1. 事件优先级支持
2. 事件历史记录和回放
3. 远程事件支持（跨iframe/worker通信）
