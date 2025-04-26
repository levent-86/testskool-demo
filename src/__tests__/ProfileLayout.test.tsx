import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import mediaQuery from 'css-mediaquery';
import ProfileLayout from '../components/ProfileLayout';
import { UserContext } from '../contexts/UserProvider';
import { afterEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AccessTokenProvider } from '../contexts/AccessProvider';

// matchMedia polyfill
// https://mui.com/material-ui/react-use-media-query/?srsltid=AfmBOorHUtB2ItuUhCB2NBVkabmnp-ewOU6N6o5KcRTvZ2exHEns1xqO#testing
function createMatchMedia(width: number): (query: string) => MediaQueryList {
  return (query: string): MediaQueryList => ({
    matches: mediaQuery.match(query, { width }),
    media: query,
    onchange: null,
    addEventListener: () => { },
    removeEventListener: () => { },
    // For old browsers
    addListener: () => { },
    removeListener: () => { },
    dispatchEvent: () => true,
  });
}

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

const renderProfileLayout = (page: 'my-profile' | 'profile', width: number) => {
  window.matchMedia = createMatchMedia(width);

  return render(
    <MemoryRouter>
      <UserContext.Provider value={{ userData: defaultUserData, refresh: false }}>
        <AccessTokenProvider>
          <ProfileLayout page={page} />
        </AccessTokenProvider>
      </UserContext.Provider>
    </MemoryRouter>
  );
};

describe('ProfileLayout:', () => {
  afterEach(() => vi.clearAllMocks());

  it('Should render MobileProfileCard and ProfileActivityPanel when screen is mobile', () => {
    renderProfileLayout('my-profile', 800);

    expect(screen.getByRole('button', { name: /profile details/i })).toBeTruthy();
    expect(screen.getByTestId('activity-panel-paper')).toBeTruthy();
    expect(screen.queryByTestId('profile-card-paper')).toBeNull();
  });

  it('Should render DesktopProfileCard and ProfileActivityPanel when screen is desktop', () => {
    renderProfileLayout('my-profile', 1000);

    expect(screen.getByTestId('profile-card-paper')).toBeTruthy();
    expect(screen.getByTestId('activity-panel-paper')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /profile details/i })).toBeNull();
  });

  it('Should pass page="my-profile" to MobileProfileCard correctly', async () => {
    // Mobile
    renderProfileLayout('my-profile', 800);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /profile details/i }));
    expect(screen.getByRole('button', { name: /edit profile/i })).toBeTruthy();
  });

  it('Should pass page="my-profile" to DesktopProfileCard correctly', () => {
    // Desktop
    renderProfileLayout('my-profile', 1000);

    expect(screen.getByRole('button', { name: /edit profile/i })).toBeTruthy();
  });

  it('Should pass page="profile" to child components correctly', async () => {
    // Mobile
    renderProfileLayout('profile', 800);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /profile details/i }));
    expect(screen.queryByRole('button', { name: /edit profile/i })).toBeNull();

    // Desktop
    renderProfileLayout('profile', 1000);
    expect(screen.queryByRole('button', { name: /edit profile/i })).toBeNull();
  });
});
