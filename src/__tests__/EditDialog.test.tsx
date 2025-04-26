/* Avatar preview test is missing because of HappyDom restrictions. */

import { act, render, RenderResult, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UserContext } from '../contexts/UserProvider';
import { EditDialog } from '../components/profile/EditDialog';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { BaseURLS } from '../constants/base-urls';
import { ENDPOINTS } from '../constants/endpoints';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import api from '../services/api';


interface BaseEditDialogProps {
  handleClose: () => void;
  setRefresh: () => void;
  userData?: {
    id: number;
    username: string;
    is_student: boolean;
    is_teacher: boolean;
    date_joined: string;
  } | null | undefined;
}

interface RenderEditDialogProps extends BaseEditDialogProps {
  open: boolean;
}

interface ReRenderEditDialogProps extends BaseEditDialogProps {
  initialOpen: boolean;
}

const renderEditDialog = ({
  open,
  handleClose,
  setRefresh,
  userData = {
    id: 1,
    username: 'username',
    is_student: false,
    is_teacher: true,
    date_joined: '2025-01-01'
  }
}: RenderEditDialogProps): RenderResult => {
  return render(
    <MemoryRouter>
      <UserContext.Provider value={{ userData, setRefresh, refresh: false }}>
        <EditDialog open={open} handleClose={handleClose} />
      </UserContext.Provider>
    </MemoryRouter>
  );
};

const reRenderEditDialogProps = ({
  initialOpen = true,
  handleClose,
  setRefresh,
  userData = {
    id: 1,
    username: 'username',
    is_student: false,
    is_teacher: true,
    date_joined: '2025-01-01'
  }
}: ReRenderEditDialogProps) => {
  const Wrapper = () => {
    const [open, setOpen] = useState(initialOpen);
    const modifiedHandleClose = () => {
      setOpen(false);
      handleClose();
    };
    return (
      <MemoryRouter>
        <UserContext.Provider value={{ userData, setRefresh, refresh: false }}>
          <EditDialog open={open} handleClose={modifiedHandleClose} />
        </UserContext.Provider>
      </MemoryRouter>
    );
  };
  return render(<Wrapper />);
};

describe('EditDialog component tests:', () => {
  localStorage.setItem('access', 'some-token');

  const server = setupServer();

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => {
    server.close();
    localStorage.clear();
  });

  it('Should render all main elements and handle subjects loading.', async () => {
    const handleClose = vi.fn();
    const setRefresh = vi.fn();
    const userData = {
      id: 1,
      username: 'username',
      is_student: false,
      is_teacher: true,
      date_joined: ''
    };

    server.use(
      http.get(BaseURLS.API + ENDPOINTS.SUBJECT_LIST, () => {
        return HttpResponse.json([
          { id: 1, name: 'Math' },
          { id: 2, name: 'Science' }
        ]);
      })
    );

    renderEditDialog({
      open: true, handleClose, setRefresh, userData: userData
    });

    expect(screen.getByText(/edit your profile/i)).toBeTruthy();
    expect(screen.getByTestId(/avatar-preview/i)).toBeTruthy();
    expect(screen.getByText(/maximum 300 kb/i)).toBeTruthy();
    expect(screen.getByText(/(jpeg, png, gif)/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /select an image/i })).toBeTruthy();
    expect(screen.getByPlaceholderText(/your first name/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/your last name/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/about you/i)).toBeTruthy();
    expect(screen.getByTestId('skeleton')).toBeTruthy();

    // Now skeleton gone and Select input rendered
    await waitFor(() => {
      // 
      expect(screen.getByRole('combobox')).toBeTruthy();
      expect(screen.queryByTestId('skeleton')).toBeFalsy();
    });

    expect(screen.getByRole('button', { name: /cancel/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /save changes/i })).toBeTruthy();
  });

  it('Should NOT render Select input if user is a student.', async () => {
    const handleClose = vi.fn();
    const setRefresh = vi.fn();
    const userData = {
      id: 1,
      username: 'username',
      is_student: true, // user is a student
      is_teacher: false,
      date_joined: ''
    };

    renderEditDialog({
      open: true, handleClose, setRefresh, userData: userData
    });

    await waitFor(() => expect(screen.queryByRole('combobox')).toBeFalsy());
  });

  it('Should show options when clicked to Select input.', async () => {
    const handleClose = vi.fn();
    const setRefresh = vi.fn();
    const userData = {
      id: 1,
      username: 'username',
      is_student: false,
      is_teacher: true,
      date_joined: ''
    };

    server.use(
      http.get(BaseURLS.API + ENDPOINTS.SUBJECT_LIST, () => {
        return HttpResponse.json([
          { id: 1, name: 'Math' },
          { id: 2, name: 'Science' }
        ]);
      })
    );

    renderEditDialog({
      open: true, handleClose, setRefresh, userData: userData
    });

    const user = userEvent.setup();

    const selectInp = await waitFor(() => screen.getByRole('combobox') as HTMLInputElement);

    await user.click(selectInp);
    expect(screen.getByRole('option', { name: /math/i })).toBeTruthy();
    expect(screen.getByRole('option', { name: /science/i })).toBeTruthy();
  });

  it('Should selected options are shown.', async () => {
    const handleClose = vi.fn();
    const setRefresh = vi.fn();
    const userData = {
      id: 1,
      username: 'username',
      is_student: false,
      is_teacher: true,
      date_joined: ''
    };

    server.use(
      http.get(BaseURLS.API + ENDPOINTS.SUBJECT_LIST, () => {
        return HttpResponse.json([
          { id: 1, name: 'Math' },
          { id: 2, name: 'Science' },
          { id: 3, name: 'Art' }
        ]);
      })
    );

    renderEditDialog({
      open: true, handleClose, setRefresh, userData: userData
    });

    const user = userEvent.setup();

    const selectInp = await waitFor(() => screen.getByRole('combobox') as HTMLInputElement);

    await user.click(selectInp);

    const mathOpt = screen.getByRole('option', { name: /math/i });
    const scienceOpt = screen.getByRole('option', { name: /science/i });
    const artOpt = screen.getByRole('option', { name: /art/i });

    await user.click(mathOpt);
    await waitFor(() => expect(screen.getByDisplayValue('Math')).toBeTruthy());

    await user.click(scienceOpt);
    await waitFor(() => expect(screen.getByDisplayValue('Math,Science')).toBeTruthy());

    await user.click(artOpt);
    await waitFor(() => expect(screen.getByDisplayValue('Math,Science,Art')).toBeTruthy());
  });

  it('Should values filled on each input. - Select / Option input excluded.', async () => {
    const handleClose = vi.fn();
    const setRefresh = vi.fn();
    const userData = {
      id: 1,
      username: 'username',
      is_student: true,
      is_teacher: false,
      date_joined: ''
    };

    renderEditDialog({
      open: true, handleClose, setRefresh, userData: userData
    });

    const user = userEvent.setup();

    const fileInputButton = screen.getByRole('button', { name: /select an image/i });
    const fileInput = fileInputButton.querySelector('input[type="file"]') as HTMLInputElement;
    const firstNameInput = screen.getByPlaceholderText(/your first name/i) as HTMLInputElement;
    const lastNameInput = screen.getByPlaceholderText(/your last name/i) as HTMLInputElement;
    const aboutInput = screen.getByPlaceholderText(/about you/i) as HTMLInputElement;

    await user.type(firstNameInput, 'John');
    await user.type(lastNameInput, 'Doe');
    await user.type(aboutInput, 'I am a teacher.');

    const file = new File(['dummy'], 'avatar.jpg', { type: 'image/jpeg' });
    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(firstNameInput.value).toBe('John');
      expect(lastNameInput.value).toBe('Doe');
      expect(aboutInput.value).toBe('I am a teacher.');
      expect(fileInput.files).toHaveLength(1);
      expect(fileInput.files![0].name).toBe('avatar.jpg');
    });
  });

  it('Should show error message under Profile Picture input.', async () => {
    const handleClose = vi.fn();
    const setRefresh = vi.fn();
    const userData = {
      id: 1,
      username: 'username',
      is_student: true,
      is_teacher: false,
      date_joined: ''
    };
    // Profile picture message
    server.use(
      http.put(BaseURLS.API + ENDPOINTS.EDIT_PROFILE, () => {
        return HttpResponse.json(
          { profile_picture: 'Maximum 300 kb.' },
          { status: 400 }
        );
      })
    );

    renderEditDialog({
      open: true, handleClose, setRefresh, userData: userData
    });

    const user = userEvent.setup();

    const fileInputButton = screen.getByRole('button', { name: /select an image/i });
    const fileInput = fileInputButton.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['dummy'], 'avatar.jpg', { type: 'image/jpeg' });
    const saveBtn = screen.getByRole('button', { name: /save changes/i });
    await user.upload(fileInput, file);
    await user.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText(/maximum 300 kb./i)).toBeTruthy();
    });
  });

  it('Should show error message under About input.', async () => {
    const handleClose = vi.fn();
    const setRefresh = vi.fn();
    const userData = {
      id: 1,
      username: 'username',
      is_student: true,
      is_teacher: false,
      date_joined: ''
    };

    renderEditDialog({
      open: true, handleClose, setRefresh, userData: userData
    });

    // About input message
    server.use(
      http.put(BaseURLS.API + ENDPOINTS.EDIT_PROFILE, () => {
        return HttpResponse.json(
          { about: 'Maximum 2048 characters.' },
          { status: 400 }
        );
      })
    );

    const aboutInp = screen.getByPlaceholderText(/about you/i);
    const user = userEvent.setup();
    const saveBtn = screen.getByRole('button', { name: /save changes/i });
    await user.type(aboutInp, 'more than 2048 chars');
    await user.click(saveBtn);

    await waitFor(() => expect(screen.getByText(/maximum 2048 characters/i)).toBeTruthy());
  });

  it('Should show error message under Subject input.', async () => {
    const handleClose = vi.fn();
    const setRefresh = vi.fn();
    const userData = {
      id: 1,
      username: 'username',
      is_student: false,
      is_teacher: true,
      date_joined: ''
    };

    // Get a false option
    server.use(
      http.get(BaseURLS.API + ENDPOINTS.SUBJECT_LIST, () => {
        return HttpResponse.json([
          { id: 1, name: 'Invalid option' }
        ]);
      })
    );

    // Invalid option returns error with message
    server.use(
      http.put(BaseURLS.API + ENDPOINTS.EDIT_PROFILE, () => {
        return HttpResponse.json(
          { subject: 'Invalid subject.' },
          { status: 400 }
        );
      })
    );

    renderEditDialog({
      open: true, handleClose, setRefresh, userData: userData
    });

    const user = userEvent.setup();

    const selectInp = await waitFor(() => screen.getByRole('combobox') as HTMLInputElement);
    const saveBtn = screen.getByRole('button', { name: /save changes/i });
    await user.click(selectInp);

    const falseOpt = screen.getByRole('option', { name: /invalid option/i });

    await user.click(falseOpt);
    await user.click(saveBtn);

    await waitFor(() => expect(screen.getByText(/invalid subject/i)).toBeTruthy());
  });

  it('Should NOT render component if there are no userData.', () => {
    const handleClose = vi.fn();
    const setRefresh = vi.fn();

    renderEditDialog({
      open: true, handleClose, setRefresh, userData: null
    });

    expect(screen.queryByText(/edit your profile/i)).toBeNull();
  });

  it('Should call setRefresh to refresh user data after successfull request and close the dialog.', async () => {
    const handleClose = vi.fn();
    const setRefresh = vi.fn();
    const userData = {
      id: 1,
      username: 'username',
      is_student: true,
      is_teacher: false,
      date_joined: ''
    };

    renderEditDialog({
      open: true, handleClose, setRefresh, userData: userData
    });

    // Success message
    server.use(
      http.put(BaseURLS.API + ENDPOINTS.EDIT_PROFILE, () => {
        return HttpResponse.json(
          { message: 'Success.' },
          { status: 200 }
        );
      })
    );

    const user = userEvent.setup();
    const fnameInp = screen.getByPlaceholderText(/your first name/i);
    const saveBtn = screen.getByRole('button', { name: /save changes/i });

    await user.type(fnameInp, 'new name');
    await user.click(saveBtn);

    expect(setRefresh).toHaveBeenCalled();
    expect(handleClose).toHaveBeenCalled();
  });

  it('Should dialog closed when Close button clicked.', async () => {
    const handleClose = vi.fn();
    const setRefresh = vi.fn();
    const userData = {
      id: 1,
      username: 'username',
      is_student: true,
      is_teacher: false,
      date_joined: ''
    };

    renderEditDialog({
      open: true, handleClose, setRefresh, userData: userData
    });

    const user = userEvent.setup();
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });

    await user.click(cancelBtn);

    expect(handleClose).toHaveBeenCalled();
  });

  it('Should reset states when dialog is closed via Cancel button.', async () => {
    const handleClose = vi.fn();
    const setRefresh = vi.fn();
    const userData = {
      id: 1,
      username: 'username',
      is_student: false,
      is_teacher: true,
      date_joined: ''
    };

    server.use(
      http.get(BaseURLS.API + ENDPOINTS.SUBJECT_LIST, () => {
        return HttpResponse.json([
          { id: 1, name: 'Math' },
          { id: 2, name: 'Art' },
        ]);
      })
    );

    reRenderEditDialogProps({
      initialOpen: true,
      handleClose,
      setRefresh,
      userData,
    });

    const user = userEvent.setup();

    // Inputs
    const fileInputButton = screen.getByRole('button', { name: /select an image/i });
    const fileInput = fileInputButton.querySelector('input[type="file"]') as HTMLInputElement;
    const firstNameInput = screen.getByPlaceholderText(/your first name/i) as HTMLInputElement;
    const lastNameInput = screen.getByPlaceholderText(/your last name/i) as HTMLInputElement;
    const aboutInput = screen.getByPlaceholderText(/about you/i) as HTMLInputElement;

    await user.type(firstNameInput, 'John');
    await user.type(lastNameInput, 'Doe');
    await user.type(aboutInput, 'I am a teacher.');

    const file = new File(['dummy'], 'avatar.jpg', { type: 'image/jpeg' });
    await user.upload(fileInput, file);

    // All inputs are filled
    await waitFor(() => {
      expect(firstNameInput.value).toBe('John');
      expect(lastNameInput.value).toBe('Doe');
      expect(aboutInput.value).toBe('I am a teacher.');
      expect(fileInput.files).toHaveLength(1);
      expect(fileInput.files![0].name).toBe('avatar.jpg');
    });

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });

    await act(async () => {
      await user.click(cancelBtn);
    });

    // Also empty the file
    Object.defineProperty(fileInput, 'files', {
      value: null,
      writable: true
    });

    // Now all inputs are empty
    await waitFor(() => {
      expect(firstNameInput.value).toBe('');
      expect(lastNameInput.value).toBe('');
      expect(aboutInput.value).toBe('');
      expect(fileInput.files).toBeNull();
    });
  });

  it('Save Changes button should close the dialog and should NOT send request to server.', async () => {
    const handleClose = vi.fn();
    const setRefresh = vi.fn();
    const userData = {
      id: 1,
      username: 'username',
      is_student: true,
      is_teacher: false,
      date_joined: ''
    };

    const putSpy = vi.spyOn(api, 'put');

    renderEditDialog({
      open: true, handleClose, setRefresh, userData: userData
    });

    const user = userEvent.setup();
    const saveBtn = screen.getByRole('button', { name: /save changes/i });

    await user.click(saveBtn);

    expect(handleClose).toHaveBeenCalled();
    expect(putSpy).not.toHaveBeenCalled();
  });

  it('Should show loading spinner when PUT request is in progress and should\'t show after resolve.', async () => {
    const handleClose = vi.fn();
    const setRefresh = vi.fn();
    const userData = {
      id: 1,
      username: 'username',
      is_student: true,
      is_teacher: false,
      date_joined: ''
    };

    server.use(
      http.put(BaseURLS.API + ENDPOINTS.EDIT_PROFILE, async () => {
        // Add delay to before resolve
        await new Promise((resolve) => setTimeout(resolve, 500));
        return HttpResponse.json(
          { message: 'Profile edited successfully.' },
          { status: 200 }
        );
      })
    );

    renderEditDialog({
      open: true, handleClose, setRefresh, userData: userData
    });

    // Inputs
    const user = userEvent.setup();
    const fnameInp = screen.getByPlaceholderText(/your first name/i);
    const saveBtn = screen.getByRole('button', { name: /save changes/i });

    await user.type(fnameInp, 'New first name');
    await user.click(saveBtn);

    // Now spinner should shown
    expect(screen.getByRole('progressbar')).toBeTruthy();
    expect(saveBtn.getAttribute('disabled')).to.equal('');

    // Check if spinner gone after resolve
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).toBeFalsy();
      expect(saveBtn.getAttribute('disabled')).to.equal(null);
    });
  });

  it('Should close dialog when clicking outside or pressing ESC.', async () => {
    const handleClose = vi.fn();
    const setRefresh = vi.fn();
    const userData = {
      id: 1,
      username: 'username',
      is_student: true,
      is_teacher: false,
      date_joined: ''
    };

    renderEditDialog({
      open: true, handleClose, setRefresh, userData: userData
    });

    const user = userEvent.setup();
    await user.keyboard('{Escape}');
    expect(handleClose).toHaveBeenCalled();
  });

  it('Should NOT render dialog when dialog is closed.', () => {
    const handleClose = vi.fn();
    const setRefresh = vi.fn();
    const userData = {
      id: 1,
      username: 'username',
      is_student: true,
      is_teacher: false,
      date_joined: ''
    };

    renderEditDialog({
      open: false, handleClose, setRefresh, userData: userData
    });

    expect(screen.queryByText(/edit your profile/i)).toBeNull();
  });
});
