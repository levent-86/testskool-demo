import { renderHook, act } from '@testing-library/react';
import { AccessTokenProvider } from '../contexts/AccessProvider';
import { useAccessToken } from '../hooks/useAccessToken';
import { describe, expect, it } from 'vitest';
import { ReactNode } from 'react';


describe('useAccessToken:', () => {
  it('should return access and setAccess from context.', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AccessTokenProvider>{children}</AccessTokenProvider>
    );
    const { result } = renderHook(() => useAccessToken(), { wrapper });

    // Should be null
    expect(result.current.access).toBe(null);
    expect(typeof result.current.setAccess).toBe('function');

    act(() => {
      result.current.setAccess('test-token');
    });

    // Now should be filled
    expect(result.current.access).toBe('test-token');
  });

  it('should throw error if used outside provider.', () => {
    expect(() => renderHook(() => useAccessToken())).toThrow('useAccessToken must be used within AccessTokenProvider');
  });

  it('should throw error if used outside provider', () => {
    expect(() => renderHook(() => useAccessToken())).toThrow(
      'useAccessToken must be used within AccessTokenProvider'
    );
  });
});
