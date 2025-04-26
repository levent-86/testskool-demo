import { render, RenderResult, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProfileContent } from '../components/profile/ProfileContent';
import { UserContext } from '../contexts/UserProvider';
import userEvent from '@testing-library/user-event';
import { BaseURLS } from '../constants/base-urls';

interface Subject {
  name: string;
  id: number;
}

interface RenderProfileContentProps {
  page?: 'my-profile' | 'profile';
  handleEditClickOpen: () => void;
  handlePasswordClickOpen: () => void;
  handleDeleteOpen: () => void;
  setRefresh: () => void;
  userData?: {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
    about?: string;
    is_student: boolean;
    is_teacher: boolean;
    subject?: Subject[];
    profile_picture?: string;
    date_joined: string;
  } | null | undefined;
}

const renderProfileContent = ({
  page = 'my-profile',
  handleEditClickOpen,
  handlePasswordClickOpen,
  handleDeleteOpen,
  setRefresh,
  userData = {
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
  }
}: RenderProfileContentProps): RenderResult => {
  return render(
    <MemoryRouter>
      <UserContext.Provider value={{ userData, setRefresh, refresh: false }}>
        <ProfileContent
          page={page}
          handleEditClickOpen={handleEditClickOpen}
          handlePasswordClickOpen={handlePasswordClickOpen}
          handleDeleteOpen={handleDeleteOpen}
        />
      </UserContext.Provider>
    </MemoryRouter>
  );
};

describe('ProfileContent:', () => {
  afterEach(() => vi.clearAllMocks());

  it('Should render all elements.', () => {
    const handleEditClickOpen = vi.fn();
    const handlePasswordClickOpen = vi.fn();
    const handleDeleteOpen = vi.fn();
    const setRefresh = vi.fn();
    renderProfileContent(
      {
        handleEditClickOpen,
        handlePasswordClickOpen,
        handleDeleteOpen,
        setRefresh
      }
    );

    expect(screen.getByRole('img')).toBeTruthy();
    expect(screen.getByRole('img').getAttribute('src')).toBe(BaseURLS.MEDIA + 'test/image.jpg');
    expect(screen.getByText(/john-doe/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /edit profile/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /change password/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /delete my account/i })).toBeTruthy();
    expect(screen.getByText(/first name: john/i)).toBeTruthy();
    expect(screen.getByText(/last name: doe/i)).toBeTruthy();
    expect(screen.getByText(/about:/i)).toBeTruthy();
    expect(screen.getByText(/i'm a teacher/i)).toBeTruthy();
    expect(screen.getByText('Subject(s):')).toBeTruthy();
    expect(screen.getByText(/art/i)).toBeTruthy();
    expect(screen.getByText(/math/i)).toBeTruthy();
    expect(screen.getByText(/joined/i)).toBeTruthy();
    expect(screen.getByText(/january 1, 2025/i)).toBeTruthy();
  });

  it('Should NOT render Subject(s) and its elements if user is not a teacher.', () => {
    const handleEditClickOpen = vi.fn();
    const handlePasswordClickOpen = vi.fn();
    const handleDeleteOpen = vi.fn();
    const setRefresh = vi.fn();
    const userData = {
      id: 1,
      username: 'john-doe',
      first_name: 'john',
      last_name: 'doe',
      about: 'I\'m NOT a teacher.',
      is_student: true,
      is_teacher: false, // user is not a teacher
      subject: [{ id: 1, name: 'art' }, { id: 2, name: 'math' }],
      date_joined: '2025-01-01'
    };
    renderProfileContent(
      {
        userData,
        handleEditClickOpen,
        handlePasswordClickOpen,
        handleDeleteOpen,
        setRefresh
      }
    );

    // Subject and its elements shouldn't rendered
    expect(screen.queryByText('Subject(s):')).toBeNull();
    expect(screen.queryByText(/art/i)).toBeNull();
    expect(screen.queryByText(/math/i)).toBeNull();
  });

  it('Should NOT render buttons if page is not my-profile.', () => {
    const handleEditClickOpen = vi.fn();
    const handlePasswordClickOpen = vi.fn();
    const handleDeleteOpen = vi.fn();
    const setRefresh = vi.fn();
    renderProfileContent(
      {
        page: 'profile', // PAge is not "my-profile"
        handleEditClickOpen,
        handlePasswordClickOpen,
        handleDeleteOpen,
        setRefresh
      }
    );

    // And buttons shouldn't rendeed
    expect(screen.queryByRole('button', { name: /edit profile/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /change password/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /delete my account/i })).toBeNull();
  });

  it('Should all buttons trigger their respective callbacks.', async () => {
    const handleEditClickOpen = vi.fn();
    const handlePasswordClickOpen = vi.fn();
    const handleDeleteOpen = vi.fn();
    const setRefresh = vi.fn();
    renderProfileContent(
      {
        handleEditClickOpen,
        handlePasswordClickOpen,
        handleDeleteOpen,
        setRefresh
      }
    );

    // Inputs
    const user = userEvent.setup();
    const editProfileBtn = screen.getByRole('button', { name: /edit profile/i });
    const changePasswordBtn = screen.getByRole('button', { name: /change password/i });
    const deleteAccountBtn = screen.getByRole('button', { name: /delete my account/i });

    // User activity
    await user.click(editProfileBtn);
    await user.click(changePasswordBtn);
    await user.click(deleteAccountBtn);

    // Now dialogs should be called
    expect(handleEditClickOpen).toHaveBeenCalledTimes(1);
    expect(handlePasswordClickOpen).toHaveBeenCalledTimes(1);
    expect(handleDeleteOpen).toHaveBeenCalledTimes(1);
  });

  it('Should render placeholders if First Name, Last Name, and About data isn’t provided.', () => {
    const handleEditClickOpen = vi.fn();
    const handlePasswordClickOpen = vi.fn();
    const handleDeleteOpen = vi.fn();
    const setRefresh = vi.fn();
    const userData = {
      id: 1,
      username: 'john-doe',
      is_student: true,
      is_teacher: false, // user is not a teacher
      subject: [{ id: 1, name: 'art' }, { id: 2, name: 'math' }],
      date_joined: '2025-01-01'
    };
    renderProfileContent(
      {
        userData,
        handleEditClickOpen,
        handlePasswordClickOpen,
        handleDeleteOpen,
        setRefresh
      }
    );

    // Only place holders are rendered
    expect(screen.getByText(/first name: -/i)).toBeTruthy();
    expect(screen.getByText(/last name: -/i)).toBeTruthy();
    expect(screen.getByText(/about: -/i)).toBeTruthy();
  });

  it('Should render avatar icon if profile picture is not provided.', () => {
    const handleEditClickOpen = vi.fn();
    const handlePasswordClickOpen = vi.fn();
    const handleDeleteOpen = vi.fn();
    const setRefresh = vi.fn();
    const userData = {
      // user has no profile picture
      id: 1,
      username: 'john-doe',
      is_student: true,
      is_teacher: false,
      subject: [{ id: 1, name: 'art' }, { id: 2, name: 'math' }],
      date_joined: '2025-01-01'
    };
    renderProfileContent(
      {
        userData,
        handleEditClickOpen,
        handlePasswordClickOpen,
        handleDeleteOpen,
        setRefresh
      }
    );

    expect(screen.getByTestId(/personicon/i)).toBeTruthy();
    expect(screen.queryByRole('img')).toBeNull();
  });
});
