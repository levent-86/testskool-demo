import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import mediaQuery from 'css-mediaquery';
import userEvent from '@testing-library/user-event';
import MyProfile from '../pages/MyProfile';
import { UserContext } from '../contexts/UserProvider';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AccessTokenProvider } from '../contexts/AccessProvider';

// matchMedia polyfill
function createMatchMedia(width: number): (query: string) => MediaQueryList {
  return (query: string): MediaQueryList => ({
    matches: mediaQuery.match(query, { width }),
    media: query,
    onchange: null,
    addEventListener: () => { },
    removeEventListener: () => { },
    addListener: () => { },
    removeListener: () => { },
    dispatchEvent: () => true,
  });
}

describe('MyProfile:', () => {
  const defaultUserData = {
    id: 1,
    username: 'john-doe',
    first_name: 'john',
    last_name: 'doe',
    about: 'I\'m a teacher.',
    is_student: false,
    is_teacher: true,
    subject: [{ id: 1, name: 'art' }, { id: 2, name: 'math' }],
    profile_picture: 'test/image.jpg',
    date_joined: '2025-01-01'
  };

  const renderMyProfile = (width: number) => {
    window.matchMedia = createMatchMedia(width);
    return render(
      <MemoryRouter>
        <UserContext.Provider value={{ userData: defaultUserData, refresh: false }}>
          <AccessTokenProvider>
            <MyProfile />
          </AccessTokenProvider>
        </UserContext.Provider>
      </MemoryRouter>
    );
  };

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('Should render ProfileLayout.', () => {
    renderMyProfile(1000);

    // ProfileLayout render edildiğini DesktopProfileCard’dan kontrol
    expect(screen.getByTestId('profile-card-paper')).toBeTruthy();
    // ProfileActivityPanel rendered
    expect(screen.getByTestId('activity-panel-paper')).toBeTruthy();
  });

  it('Should pass page="my-profile" to ProfileLayout on mobile.', async () => {
    // Mobile
    renderMyProfile(800);

    const user = userEvent.setup();

    expect(screen.getByRole('button', { name: /profile details/i })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /profile details/i }));
    expect(screen.getByRole('button', { name: /edit profile/i })).toBeTruthy();
  });

  it('Should pass page="my-profile" to ProfileLayout on desktop', () => {
    // Desktop
    renderMyProfile(1000);

    expect(screen.getByRole('button', { name: /edit profile/i })).toBeTruthy();
  });
});
