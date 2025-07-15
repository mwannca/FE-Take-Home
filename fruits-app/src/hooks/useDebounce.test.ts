import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    // Change the value
    rerender({ value: 'changed' });
    expect(result.current).toBe('initial'); // Should still be initial

    // Fast forward time
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe('changed'); // Should now be changed
  });

  it('should cancel previous timeout when value changes quickly', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    // Change value multiple times quickly
    rerender({ value: 'first' });
    rerender({ value: 'second' });
    rerender({ value: 'third' });

    expect(result.current).toBe('initial'); // Should still be initial

    // Fast forward time
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe('third'); // Should be the last value
  });

  it('should use default delay of 300ms', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'changed' });
    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe('changed');
  });

  it('should work with different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'changed' });
    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe('initial'); // Should still be initial

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current).toBe('changed'); // Should now be changed
  });
}); 