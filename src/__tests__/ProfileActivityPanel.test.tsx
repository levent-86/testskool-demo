import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { UserContext } from '../contexts/UserProvider';
import { ProfileActivityPanel } from '../components/profile/ProfileActivityPanel';
import userEvent from '@testing-library/user-event';


interface Subject {
  name: string;
  id: number;
}

interface renderProfileActivityPanelProps {
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

const renderProfileActivityPanel = ({
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
}: renderProfileActivityPanelProps) => {
  return render(
    <MemoryRouter>
      <UserContext.Provider value={{ userData: userData, refresh: false }}>
        <ProfileActivityPanel />
      </UserContext.Provider>
    </MemoryRouter>
  );
};

describe('ProfileActivityPanel:', () => {
  it('Should render Paper correctly', () => {
    renderProfileActivityPanel({});
    expect(screen.getByTestId('activity-panel-paper')).toBeTruthy();
  });

  it('Shoul render View Stats button if user is a student.', () => {
    const userData = {
      id: 1,
      username: 'john-doe',
      is_student: true, // user is a student
      is_teacher: false,
      date_joined: '2025-01-01'
    };
    renderProfileActivityPanel({ userData });

    expect(screen.getByRole('button', { name: /view stats/i })).toBeTruthy();
  });

  it('Should NOT render View Stats button if user is a teacher.', () => {
    renderProfileActivityPanel({});

    expect(screen.queryByRole('button', { name: /view stats/i })).toBeNull();
  });

  it('Button should switch between View Stats and View Quizzes when user clicked.', async () => {
    const studentData = {
      id: 1,
      username: 'john-doe',
      is_student: true, // user is a student
      is_teacher: false,
      date_joined: '2025-01-01'
    };
    renderProfileActivityPanel({ userData: { ...studentData } });

    const user = userEvent.setup();
    const viewStatsBtn = screen.getByRole('button', { name: /view stats/i });

    // Switched to View Quiz
    await user.click(viewStatsBtn);
    expect(screen.getByRole('button', { name: /view quiz/i })).toBeTruthy();

    // Now switched to View Stats
    const viewQuizBtn = screen.getByRole('button', { name: /view quiz/i });
    await user.click(viewQuizBtn);
    expect(screen.getByRole('button', { name: /view stats/i })).toBeTruthy();
  });
});
