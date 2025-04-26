import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { MobileProfileCard } from '../components/profile/MobileProfileCard';
import { UserContext } from '../contexts/UserProvider';
import { AccessTokenProvider } from '../contexts/AccessProvider';

const userData = {
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

const renderMobileProfileCard = (page: 'my-profile' | 'profile') => {
  return render(
    <MemoryRouter>
      <UserContext.Provider value={{ userData: userData, refresh: false }}>
        <AccessTokenProvider>
          <MobileProfileCard page={page} />
        </AccessTokenProvider>
      </UserContext.Provider>
    </MemoryRouter>
  );
};

describe('MobileProfileCard:', () => {
  afterEach(() => vi.clearAllMocks());

  it('Should render Accordion and ProfileContent correctly.', () => {
    renderMobileProfileCard('my-profile');
    expect(screen.getByRole('button', { name: /profile details/i })).toBeTruthy();
    expect(screen.getByText(/john-doe/i)).toBeTruthy();
  });

  it('Should render all dialogs when page is "my-profile".', async () => {
    renderMobileProfileCard('my-profile');

    const user = userEvent.setup();
    const accordion = screen.getByRole('button', { name: /profile details/i });
    await user.click(accordion);

    expect(screen.getByRole('button', { name: /edit profile/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /change password/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /delete my account/i })).toBeTruthy();
  });

  it('Should NOT render dialogs when page is "profile".', async () => {
    renderMobileProfileCard('profile');

    const user = userEvent.setup();
    const accordion = screen.getByRole('button', { name: /profile details/i });
    await user.click(accordion);

    expect(screen.queryByRole('button', { name: /edit profile/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /change password/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /delete my account/i })).toBeNull();
  });

  it('Should open EditDialog when Edit Profile button is clicked.', async () => {
    renderMobileProfileCard('my-profile');

    const user = userEvent.setup();
    const accordionBtn = screen.getByRole('button', { name: /profile details/i });
    await user.click(accordionBtn);

    const editProfileBtn = screen.getByRole('button', { name: /edit profile/i });
    await user.click(editProfileBtn);

    await waitFor(() => expect(screen.getByText(/edit your profile/i)).toBeTruthy());
  });

  it('Should close EditDialog when handleClose is triggered.', async () => {
    renderMobileProfileCard('my-profile');

    const user = userEvent.setup();
    const accordionBtn = screen.getByRole('button', { name: /profile details/i });
    await user.click(accordionBtn);

    const editProfileBtn = screen.getByRole('button', { name: /edit profile/i });
    await user.click(editProfileBtn);

    await waitFor(() => expect(screen.getByText(/edit your profile/i)).toBeTruthy());

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelBtn);

    await waitFor(() => expect(screen.queryByText(/edit your profile/i)).toBeNull());
  });

  it('Should open ChangePasswordDialog when Change Password button is clicked.', async () => {
    renderMobileProfileCard('my-profile');

    const user = userEvent.setup();
    const accordionBtn = screen.getByRole('button', { name: /profile details/i });
    await user.click(accordionBtn);

    const changePasswordBtn = screen.getByRole('button', { name: /change password/i });
    await user.click(changePasswordBtn);

    await waitFor(() => expect(screen.getByText(/change your password/i)).toBeTruthy());
  });

  it('Should close ChangePasswordDialog when handleClose is triggered.', async () => {
    renderMobileProfileCard('my-profile');

    const user = userEvent.setup();
    const accordionBtn = screen.getByRole('button', { name: /profile details/i });
    await user.click(accordionBtn);

    const changePasswordBtn = screen.getByRole('button', { name: /change password/i });
    await user.click(changePasswordBtn);

    await waitFor(() => expect(screen.getByText(/change your password/i)).toBeTruthy());

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelBtn);

    await waitFor(() => expect(screen.queryByText(/change your password/i)).toBeNull());
  });

  it('Should open DeleteDialog when Delete My Account button is clicked.', async () => {
    renderMobileProfileCard('my-profile');

    const user = userEvent.setup();
    const accordionBtn = screen.getByRole('button', { name: /profile details/i });
    await user.click(accordionBtn);

    const deleteAccountBtn = screen.getByRole('button', { name: /delete my account/i });
    await user.click(deleteAccountBtn);

    await waitFor(() => expect(screen.getByRole('heading', { name: /delete your account/i })).toBeTruthy());
  });

  it('Should close DeleteDialog when handleClose is triggered', async () => {
    renderMobileProfileCard('my-profile');

    const user = userEvent.setup();
    const accordionBtn = screen.getByRole('button', { name: /profile details/i });
    await user.click(accordionBtn);

    const deleteAccountBtn = screen.getByRole('button', { name: /delete my account/i });
    await user.click(deleteAccountBtn);

    await waitFor(() => expect(screen.getByRole('heading', { name: /delete your account/i })).toBeTruthy());

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelBtn);

    await waitFor(() => expect(screen.queryByRole('heading', { name: /delete your account/i })).toBeNull());
  });

  it('Should expand Accordion and show ProfileContent when clicked.', async () => {
    renderMobileProfileCard('my-profile');

    const user = userEvent.setup();
    const accordionBtn = screen.getByRole('button', { name: /profile details/i });

    // Accordion should be closed at first
    expect(screen.queryByRole('button', { name: /edit profile/i })).toBeNull();

    // Accordion should be visible after clicked
    await user.click(accordionBtn);
    await waitFor(() => expect(screen.getByRole('button', { name: /edit profile/i })).toBeTruthy());
  });

  it('Should collapse Accordion and hide ProfileContent when clicked again.', async () => {
    renderMobileProfileCard('my-profile');

    const user = userEvent.setup();
    const accordionBtn = screen.getByRole('button', { name: /profile details/i });

    // Open accordion
    await user.click(accordionBtn);
    await waitFor(() => expect(screen.getByRole('button', { name: /edit profile/i })).toBeTruthy());

    // Close accordion
    await user.click(accordionBtn);
    await waitFor(() => expect(screen.queryByRole('button', { name: /edit profile/i })).toBeNull());

  });
});
