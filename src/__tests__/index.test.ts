/**
 * @file 事件通道测试用例
 * @description 测试事件通道的各项功能，包括实例创建、事件监听和触发、特殊事件处理等
 */

import { describe, expect, it, vi } from 'vitest';
import {
  createEventChannel,
  getProtectedEventMeta,
  isProtectedEvent,
  listProtectedEvents,
  registerProtectedEvent,
  unregisterProtectedEvent,
} from '../index';

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
  });
});
