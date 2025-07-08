/**
 * @file 事件通道测试用例
 * @description 测试事件通道的各项功能，包括实例创建、事件监听和触发、特殊事件处理等
 */

import { EventEmitter2 } from 'eventemitter2';
import { describe, expect, it, vi } from 'vitest';
import {
  createEventChannel,
  emitGroup,
  emitGroupAsync,
  emitGroupWithStrategy,
  emitNamespace,
  emitNamespaceAsync,
  getProtectedEventMeta,
  isProtectedEvent,
  listProtectedEvents,
  offGroup,
  offNamespace,
  offOnceGroup,
  onceGroup,
  onceNamespace,
  onGroup,
  onNamespace,
  registerProtectedEvent,
  unregisterProtectedEvent,
} from '../index';
import type { EventHandler } from '../type';

describe('EventChannel', () => {
  /**
   * 测试事件通道实例创建
   * 验证所有必需的方法和属性是否存在
   */
  it('should create a new instance', () => {
    const channel = createEventChannel();
    expect(channel).toBeDefined();
    expect(channel.emit).toBeInstanceOf(Function);
    expect(channel.on).toBeInstanceOf(Function);
    expect(channel.once).toBeInstanceOf(Function);
    expect(channel.off).toBeInstanceOf(Function);
  });

  /**
   * 测试基本的事件发射和监听功能
   */
  it('should handle event emission and listening', () => {
    const channel = createEventChannel();
    const mockFn = vi.fn();

    channel.on('test-event', mockFn);
    channel.emit('test-event', 'test-data');

    expect(mockFn).toHaveBeenCalledWith('test-data');
  });

  /**
   * 测试一次性事件监听功能
   * 验证监听器是否只被调用一次
   */
  it('should handle once listener', () => {
    const channel = createEventChannel();
    const mockFn = vi.fn();

    channel.once('test-event', mockFn);
    channel.emit('test-event', 'first');
    channel.emit('test-event', 'second');

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('first');
  });

  describe('off method', () => {
    /**
     * 测试移除特定监听器的功能
     * 验证是否只移除了指定的监听器
     */
    it('should remove specific listener', () => {
      const channel = createEventChannel();
      const mockFn1 = vi.fn();
      const mockFn2 = vi.fn();

      channel.on('test-event', mockFn1);
      channel.on('test-event', mockFn2);
      channel.off('test-event', mockFn1);
      channel.emit('test-event', 'test');

      expect(mockFn1).not.toHaveBeenCalled();
      expect(mockFn2).toHaveBeenCalledWith('test');
    });

    /**
     * 测试移除所有监听器的功能
     * 验证是否成功移除了事件的所有监听器
     */
    it('should remove all listeners for an event', () => {
      const channel = createEventChannel();
      const mockFn1 = vi.fn();
      const mockFn2 = vi.fn();

      channel.on('test-event', mockFn1);
      channel.on('test-event', mockFn2);
      channel.off('test-event');
      channel.emit('test-event', 'test');

      expect(mockFn1).not.toHaveBeenCalled();
      expect(mockFn2).not.toHaveBeenCalled();
    });
  });

  describe('protected event API', () => {
    /**
     * 测试注册自定义受保护事件并阻止 off 方法
     * 验证是否成功注册了受保护事件，并且 off 方法无法移除该事件的监听器
     */
    it('should register a custom protected event and prevent off', () => {
      const channel = createEventChannel();
      const myEvent = registerProtectedEvent('MY_EVENT', { description: '自定义保护事件' });
      const mockFn = vi.fn();
      channel.on(myEvent, mockFn);
      channel.off(myEvent, mockFn);
      channel.emit(myEvent, 'data');
      expect(mockFn).toHaveBeenCalledWith('data');
    });

    /**
     * 测试移除受保护事件并允许 off 方法移除监听器
     * 验证是否成功移除了受保护事件，并且 off 方法可以移除该事件的监听器
     */
    it('should unregister a protected event and allow off', () => {
      const channel = createEventChannel();
      const myEvent = registerProtectedEvent('MY_EVENT2');
      const mockFn = vi.fn();
      channel.on(myEvent, mockFn);
      unregisterProtectedEvent(myEvent);
      channel.off(myEvent, mockFn);
      channel.emit(myEvent, 'data');
      expect(mockFn).not.toHaveBeenCalled();
    });

    /**
     * 测试存储和检索受保护事件元数据
     * 验证是否成功存储和检索了受保护事件的元数据
     */
    it('should store and retrieve meta info', () => {
      const desc = '元数据测试';
      const myEvent = registerProtectedEvent('META_EVENT', { description: desc, foo: 123 });
      const meta = getProtectedEventMeta(myEvent);
      expect(meta).toBeDefined();
      expect(meta?.description).toBe(desc);
      expect(meta?.foo).toBe(123);
    });

    /**
     * 测试检查是否为受保护事件
     * 验证是否成功注册了受保护事件，并且 isProtectedEvent 方法可以正确判断事件是否受保护
     */
    it('should check isProtectedEvent', () => {
      const myEvent = registerProtectedEvent('CHECK_EVENT');
      expect(isProtectedEvent(myEvent)).toBe(true);
      unregisterProtectedEvent(myEvent);
      expect(isProtectedEvent(myEvent)).toBe(false);
    });

    /**
     * 测试列出所有已注册的受保护事件
     * 验证是否成功列出了所有已注册的受保护事件，并且包含正确的元数据
     */
    it('should list all registered protected events', () => {
      const desc = '列表测试';
      const myEvent1 = registerProtectedEvent('LIST_EVENT1', { description: desc });
      const myEvent2 = registerProtectedEvent('LIST_EVENT2');
      const list = listProtectedEvents();
      const symbols = list.map((e) => e.symbol);
      expect(symbols).toContain(myEvent1);
      expect(symbols).toContain(myEvent2);
      const meta1 = list.find((e) => e.symbol === myEvent1)?.meta;
      expect(meta1?.description).toBe(desc);
    });

    it('should support group/namespace in register and list', () => {
      const eventA = registerProtectedEvent('A', { group: 'g1', namespace: 'n1' });
      const eventB = registerProtectedEvent('B', { group: 'g1', namespace: 'n2' });
      const eventC = registerProtectedEvent('C', { group: 'g2', namespace: 'n1' });
      const all = listProtectedEvents();
      expect(all.map((e) => e.symbol)).toEqual(expect.arrayContaining([eventA, eventB, eventC]));
      const g1 = listProtectedEvents({ group: 'g1' });
      expect(g1.map((e) => e.symbol)).toEqual(expect.arrayContaining([eventA, eventB]));
      expect(g1.map((e) => e.symbol)).not.toContain(eventC);
      const n1 = listProtectedEvents({ namespace: 'n1' });
      expect(n1.map((e) => e.symbol)).toEqual(expect.arrayContaining([eventA, eventC]));
      expect(n1.map((e) => e.symbol)).not.toContain(eventB);
      const both = listProtectedEvents({ group: 'g1', namespace: 'n1' });
      expect(both.map((e) => e.symbol)).toEqual([eventA]);
    });

    it('should support group/namespace batch on/off', () => {
      const emitter = new EventEmitter2();
      const eventA = registerProtectedEvent('A', { group: 'g1', namespace: 'n1' });
      const eventB = registerProtectedEvent('B', { group: 'g1', namespace: 'n2' });
      const eventC = registerProtectedEvent('C', { group: 'g2', namespace: 'n1' });
      const handler: EventHandler = vi.fn();
      onGroup('g1', handler, emitter);
      emitter.emit(eventA, 1);
      emitter.emit(eventB, 2);
      expect(handler).toHaveBeenCalledWith(eventA, 1);
      expect(handler).toHaveBeenCalledWith(eventB, 2);
      expect(handler).not.toHaveBeenCalledWith(eventC, 3);
      offGroup('g1', emitter);
      emitter.emit(eventA, 4);
      emitter.emit(eventB, 5);
      expect(handler).not.toHaveBeenCalledWith(eventA, 4);
      expect(handler).not.toHaveBeenCalledWith(eventB, 5);
      // namespace
      const handler2: EventHandler = vi.fn();
      onNamespace('n1', handler2, emitter);
      emitter.emit(eventA, 10);
      emitter.emit(eventC, 20);
      expect(handler2).toHaveBeenCalledWith(eventA, 10);
      expect(handler2).toHaveBeenCalledWith(eventC, 20);
      offNamespace('n1', emitter);
      emitter.emit(eventA, 30);
      emitter.emit(eventC, 40);
      expect(handler2).not.toHaveBeenCalledWith(eventA, 30);
      expect(handler2).not.toHaveBeenCalledWith(eventC, 40);
    });

    it('should support group/namespace wildcard batch on/off', () => {
      const emitter = new EventEmitter2();
      const eventA = registerProtectedEvent('A', { group: 'user', namespace: 'n1' });
      const eventB = registerProtectedEvent('B', { group: 'user-admin', namespace: 'n2' });
      const eventC = registerProtectedEvent('C', { group: 'order', namespace: 'n1' });
      const handler: EventHandler = vi.fn();
      onGroup('user*', handler, emitter);
      emitter.emit(eventA, 1);
      emitter.emit(eventB, 2);
      emitter.emit(eventC, 3);
      expect(handler).toHaveBeenCalledWith(eventA, 1);
      expect(handler).toHaveBeenCalledWith(eventB, 2);
      expect(handler).not.toHaveBeenCalledWith(eventC, 3);
      offGroup('user*', emitter);
      emitter.emit(eventA, 4);
      emitter.emit(eventB, 5);
      expect(handler).not.toHaveBeenCalledWith(eventA, 4);
      expect(handler).not.toHaveBeenCalledWith(eventB, 5);
      // namespace
      const handler2: EventHandler = vi.fn();
      onNamespace('n*', handler2, emitter);
      emitter.emit(eventA, 10);
      emitter.emit(eventC, 20);
      expect(handler2).toHaveBeenCalledWith(eventA, 10);
      expect(handler2).toHaveBeenCalledWith(eventC, 20);
      offNamespace('n*', emitter);
      emitter.emit(eventA, 30);
      emitter.emit(eventC, 40);
      expect(handler2).not.toHaveBeenCalledWith(eventA, 30);
      expect(handler2).not.toHaveBeenCalledWith(eventC, 40);
    });

    it('should support complex glob patterns in group/namespace batch on/off', () => {
      const emitter = new EventEmitter2();
      const eventA = registerProtectedEvent('A', { group: 'user-admin', namespace: 'n1' });
      const eventB = registerProtectedEvent('B', { group: 'user-guest', namespace: 'n2' });
      const eventC = registerProtectedEvent('C', { group: 'order-123', namespace: 'n3' });
      const eventD = registerProtectedEvent('D', { group: 'order-abc', namespace: 'n4' });
      const handler: EventHandler = vi.fn();
      onGroup('user-?dmin', handler, emitter); // 只匹配 user-admin
      emitter.emit(eventA, 1);
      emitter.emit(eventB, 2);
      expect(handler).toHaveBeenCalledWith(eventA, 1);
      expect(handler).not.toHaveBeenCalledWith(eventB, 2);
      offGroup('user-?dmin', emitter);
      emitter.emit(eventA, 3);
      expect(handler).not.toHaveBeenCalledWith(eventA, 3);
      // 多选
      const handler2: EventHandler = vi.fn();
      onGroup('order-{123,abc}', handler2, emitter);
      emitter.emit(eventC, 10);
      emitter.emit(eventD, 20);
      expect(handler2).toHaveBeenCalledWith(eventC, 10);
      expect(handler2).toHaveBeenCalledWith(eventD, 20);
      offGroup('order-{123,abc}', emitter);
      emitter.emit(eventC, 30);
      emitter.emit(eventD, 40);
      expect(handler2).not.toHaveBeenCalledWith(eventC, 30);
      expect(handler2).not.toHaveBeenCalledWith(eventD, 40);
    });

    it('should support emitGroup and emitNamespace with glob', () => {
      const emitter = new EventEmitter2();
      const eventA = registerProtectedEvent('A', { group: 'user', namespace: 'n1' });
      const eventB = registerProtectedEvent('B', { group: 'user-admin', namespace: 'n2' });
      const eventC = registerProtectedEvent('C', { group: 'order', namespace: 'n1' });
      const handlerA = vi.fn();
      const handlerB = vi.fn();
      const handlerC = vi.fn();
      emitter.on(eventA, handlerA);
      emitter.on(eventB, handlerB);
      emitter.on(eventC, handlerC);
      emitGroup('user*', 42, emitter);
      expect(handlerA).toHaveBeenCalledWith(42);
      expect(handlerB).toHaveBeenCalledWith(42);
      expect(handlerC).not.toHaveBeenCalled();
      emitNamespace('n1', 'foo', emitter);
      expect(handlerA).toHaveBeenCalledWith('foo');
      expect(handlerC).toHaveBeenCalledWith('foo');
      expect(handlerB).not.toHaveBeenCalledWith('foo');
    });

    it('should support onceGroup/onceNamespace and priority', async () => {
      const emitter = new EventEmitter2();
      const eventA = registerProtectedEvent('A', { group: 'g1', namespace: 'n1' });
      const eventB = registerProtectedEvent('B', { group: 'g1', namespace: 'n2' });
      const calls: string[] = [];
      const handler1: EventHandler = (event, v) => calls.push(`on:${String(event)}:${String(v)}`);
      const handler2: EventHandler = (event, v) => calls.push(`once:${String(event)}:${String(v)}`);
      onGroup('g1', handler1, emitter, 1);
      onceGroup('g1', handler2, emitter, 2);
      emitter.emit(eventA, 1);
      emitter.emit(eventB, 2);
      emitter.emit(eventA, 3);
      expect(calls.filter((s) => s.startsWith('once:')).length).toBe(2); // 只 once 一次
      expect(calls.filter((s) => s.startsWith('on:')).length).toBe(3); // on 多次
      // namespace
      const calls2: string[] = [];
      const handler3: EventHandler = (event, v) => calls2.push(`on:${String(event)}:${String(v)}`);
      const handler4: EventHandler = (event, v) => calls2.push(`once:${String(event)}:${String(v)}`);
      onNamespace('n1', handler3, emitter, 1);
      onceNamespace('n1', handler4, emitter, 2);
      emitter.emit(eventA, 10);
      emitter.emit(eventA, 20);
      expect(calls2.filter((s) => s.startsWith('once:')).length).toBe(1);
      expect(calls2.filter((s) => s.startsWith('on:')).length).toBe(2);
    });

    it('should support emitGroupAsync/emitNamespaceAsync', async () => {
      const emitter = new EventEmitter2();
      const eventA = registerProtectedEvent('A', { group: 'g1', namespace: 'n1' });
      const eventB = registerProtectedEvent('B', { group: 'g1', namespace: 'n2' });
      const handlerA = vi.fn(async (v: unknown) => {
        await new Promise((r) => setTimeout(r, 10));
        return v;
      });
      const handlerB = vi.fn(async (v: unknown) => {
        await new Promise((r) => setTimeout(r, 10));
        return v;
      });
      emitter.on(eventA, handlerA);
      emitter.on(eventB, handlerB);
      await emitGroupAsync('g1', 99, emitter);
      expect(handlerA).toHaveBeenCalledWith(99);
      expect(handlerB).toHaveBeenCalledWith(99);
      const handlerC = vi.fn(async (v: unknown) => {
        await new Promise((r) => setTimeout(r, 10));
        return v;
      });
      const eventC = registerProtectedEvent('C', { group: 'g2', namespace: 'n1' });
      emitter.on(eventC, handlerC);
      await emitNamespaceAsync('n1', 123, emitter);
      expect(handlerA).toHaveBeenCalledWith(123);
      expect(handlerC).toHaveBeenCalledWith(123);
    });

    it.skip('should support offOnceGroup/offOnceNamespace', () => {
      const emitter = new EventEmitter2();
      const eventA = registerProtectedEvent('A', { group: 'g1', namespace: 'n1' });
      const eventB = registerProtectedEvent('B', { group: 'g1', namespace: 'n2' });

      // 使用不同的处理函数
      const onceHandlerA = vi.fn();
      const onceHandlerB = vi.fn();
      const onHandler = vi.fn();

      // 先注册监听器
      emitter.once(eventA, onceHandlerA);
      emitter.on(eventA, onHandler);
      emitter.once(eventB, onceHandlerB);

      // 先移除一次性监听器
      offOnceGroup('g1', emitter);

      // 然后触发事件
      emitter.emit(eventA, 1);
      emitter.emit(eventB, 2);

      // 检查结果
      expect(onceHandlerA).not.toHaveBeenCalled();
      expect(onceHandlerB).not.toHaveBeenCalled();
      expect(onHandler).toHaveBeenCalledWith(1);
    });

    it('should support emitGroupWithStrategy', async () => {
      const emitter = new EventEmitter2();
      const eventA = registerProtectedEvent('A', { group: 'g1', namespace: 'n1' });
      const eventB = registerProtectedEvent('B', { group: 'g1', namespace: 'n2' });
      // parallel
      const handlerA = vi.fn().mockResolvedValue('A');
      const handlerB = vi.fn().mockResolvedValue('B');
      emitter.on(eventA, handlerA);
      emitter.on(eventB, handlerB);
      await emitGroupWithStrategy('g1', 'parallel', 1, emitter);
      expect(handlerA).toHaveBeenCalledWith(1);
      expect(handlerB).toHaveBeenCalledWith(1);
      // waterfall
      const handlerC = vi.fn().mockImplementation((v: string) => `${v}-C`);
      const handlerD = vi.fn().mockImplementation((v: string) => `${v}-D`);
      emitter.removeAllListeners();
      emitter.on(eventA, handlerC);
      emitter.on(eventB, handlerD);
      const results = await emitGroupWithStrategy('g1', 'waterfall', 'start', emitter);
      expect(results).toEqual(['start-C', 'start-C-D']);
    });
  });
});
