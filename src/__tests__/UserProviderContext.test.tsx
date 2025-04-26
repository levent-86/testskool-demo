import { describe, it, expect, vi, beforeAll, afterEach, afterAll, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { UserDataProvider, UserContext } from '../contexts/UserProvider';
import { useNavigate } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { ENDPOINTS } from '../constants/endpoints';
import { useContext } from 'react';
import { BaseURLS } from '../constants/base-urls';

// MSW server setup
const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock useAccessToken
const mockUseAccessToken = vi.fn();
vi.mock('../hooks/useAccessToken', () => ({
  useAccessToken: () => mockUseAccessToken(),
}));

// Mock useNavigate
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

// Test component to consume context
const TestComponent = () => {
  const { userData, message, refresh } = useContext(UserContext)!;
  return (
    <div>
      <span data-testid="user">{userData?.username || 'null'}</span>
      <span data-testid="message">{message}</span>
      <span data-testid="refresh">{refresh.toString()}</span>
    </div>
  );
};

describe('UserProvider:', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(localStorage, 'removeItem');
    // Default mock implementation
    mockUseAccessToken.mockImplementation(() => ({
      access: 'mock-token',
      setAccess: vi.fn(),
    }));
  });

  it('Fetches user data successfully when access token exists.', async () => {
    // Arrange
    const mockUser = { id: 1, username: 'testuser', date_joined: '2023-01-01' };
    server.use(
      http.get(BaseURLS.API + ENDPOINTS.MY_PROFILE, () => {
        return HttpResponse.json(mockUser);
      })
    );

    // Act
    const { getByTestId } = render(
      <UserDataProvider>
        <TestComponent />
      </UserDataProvider>
    );

    // Assert
    await waitFor(() => {
      expect(getByTestId('user').textContent).toBe('testuser');
      expect(getByTestId('refresh').textContent).toBe('false');
      expect(getByTestId('message').textContent).toBe('');
    });
  });

  it('Logs out when API fetch fails.', async () => {
    // Arrange
    const mockSetAccess = vi.fn();
    mockUseAccessToken.mockImplementation(() => ({
      access: 'mock-token',
      setAccess: mockSetAccess,
    }));
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    server.use(
      http.get(BaseURLS.API + ENDPOINTS.MY_PROFILE, () => {
        return HttpResponse.error();
      })
    );

    // Act
    const { getByTestId } = render(
      <UserDataProvider>
        <TestComponent />
      </UserDataProvider>
    );

    // Assert
    await waitFor(() => {
      expect(mockSetAccess).toHaveBeenCalledWith(null);
      expect(localStorage.removeItem).toHaveBeenCalledWith('access');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refresh');
      expect(mockNavigate).toHaveBeenCalledWith('/');
      expect(getByTestId('message').textContent).toBe('Logged out');
      expect(getByTestId('user').textContent).toBe('null');
    });
  });

  it('Logs out when access token is missing but userData exists.', async () => {
    // Arrange - Fill userData at first
    const mockUser = { id: 1, username: 'testuser', date_joined: '2025-01-01' };
    server.use(
      http.get(BaseURLS.API + ENDPOINTS.MY_PROFILE, () => {
        return HttpResponse.json(mockUser);
      })
    );

    const mockSetAccess = vi.fn();
    // There are access token at first render, useDate will be filled
    mockUseAccessToken.mockImplementation(() => ({
      access: 'mock-token',
      setAccess: mockSetAccess,
    }));

    const { rerender, getByTestId } = render(
      <UserDataProvider>
        <TestComponent />
      </UserDataProvider>
    );

    // wait userData to be filled
    await waitFor(() => {
      expect(getByTestId('user').textContent).toBe('testuser');
    });

    // now access token is null
    mockUseAccessToken.mockImplementation(() => ({
      access: null,
      setAccess: mockSetAccess,
    }));

    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    // render again
    rerender(
      <UserDataProvider>
        <TestComponent />
      </UserDataProvider>
    );

    // Assert
    await waitFor(() => {
      expect(mockSetAccess).toHaveBeenCalledWith(null);
      expect(localStorage.removeItem).toHaveBeenCalledWith('access');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refresh');
      expect(mockNavigate).toHaveBeenCalledWith('/');
      expect(getByTestId('message').textContent).toBe('Logged out');
    });
  });

  it('Refreshes data when refresh is true.', async () => {
    // Arrange
    const mockUser = { id: 1, username: 'testuser', date_joined: '2025-01-01' };
    server.use(
      http.get(BaseURLS.API + ENDPOINTS.MY_PROFILE, () => {
        return HttpResponse.json(mockUser);
      })
    );

    // Act
    const { getByTestId } = render(
      <UserDataProvider>
        <TestComponent />
      </UserDataProvider>
    );

    // Assert
    await waitFor(() => {
      expect(getByTestId('user').textContent).toBe('testuser');
      expect(getByTestId('refresh').textContent).toBe('false');
    });
  });

  it('Clears message when fetching data.', async () => {
    // Arrange
    const mockUser = { id: 1, username: 'testuser', date_joined: '2025-01-01' };
    server.use(
      http.get(BaseURLS.API + ENDPOINTS.MY_PROFILE, () => {
        return HttpResponse.json(mockUser);
      })
    );

    // Act
    const { getByTestId } = render(
      <UserDataProvider>
        <TestComponent />
      </UserDataProvider>
    );

    // Assert
    await waitFor(() => {
      expect(getByTestId('message').textContent).toBe('');
    });
  });
});
