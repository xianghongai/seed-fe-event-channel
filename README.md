# @seed-fe/event-channel

一个基于 EventEmitter2 的事件通道实现，提供受保护事件机制，确保关键事件监听器不被意外移除。

## 安装

```bash
# 使用 npm
npm install @seed-fe/event-channel

# 使用 yarn
yarn add @seed-fe/event-channel

# 使用 pnpm (推荐)
pnpm add @seed-fe/event-channel
```

## 基本用法

### 创建事件通道

```typescript
import { createEventChannel } from '@seed-fe/event-channel';

// 创建事件通道实例
const eventChannel = createEventChannel();
```

### 基本的事件监听和触发

```typescript
import eventChannel from '@seed-fe/event-channel';

// 添加事件监听器
eventChannel.on('user-login', (userData) => {
  console.log('用户登录:', userData);
});

// 添加一次性事件监听器
eventChannel.once('app-init', () => {
  console.log('应用初始化完成，此监听器只会触发一次');
});

// 触发事件
eventChannel.emit('user-login', { id: 1, name: 'Alice' });

// 移除事件监听器
const handler = () => console.log('处理事件');
eventChannel.on('some-event', handler);
eventChannel.off('some-event', handler); // 移除特定监听器
eventChannel.off('some-event'); // 移除该事件的所有监听器
```

### 使用受保护事件

受保护事件使用 Symbol 作为键，确保关键事件监听器不会被意外移除。

```typescript
import { registerProtectedEvent, unregisterProtectedEvent } from '@seed-fe/event-channel';

// 注册受保护事件
const myEvent = registerProtectedEvent('MY_EVENT', { // 将使用 Symbol('MY_EVENT') 作为键
  description: '重要系统事件'
});

// 添加监听器
eventChannel.on(myEvent, (data) => {
  console.log('处理受保护事件:', data);
});

// 尝试移除监听器 - 无效操作
eventChannel.off(myEvent); // 不会真正移除监听器

// 触发事件
eventChannel.emit(myEvent, { important: 'data' });

// 取消保护
unregisterProtectedEvent(myEvent);

// 现在可以移除监听器
eventChannel.off(myEvent); // 成功移除
```

## API 参考

### 核心功能

- `createEventChannel()`: 创建一个新的事件通道实例
- `default`: 默认的事件通道实例

### 受保护事件管理

- `registerProtectedEvent(name: string, meta?: ProtectedEventMeta)`: 注册受保护事件
- `unregisterProtectedEvent(sym: symbol)`: 取消事件保护
- `isProtectedEvent(sym: symbol)`: 检查是否为受保护事件
- `getProtectedEventMeta(sym: symbol)`: 获取受保护事件的元数据
- `listProtectedEvents()`: 获取所有受保护事件列表

## 许可证

MIT
