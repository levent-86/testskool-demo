import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { AccessTokenProvider } from '../contexts/AccessProvider';
import { ChangePasswordDialog } from '../components/profile/ChangePasswordDialog';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { BaseURLS } from '../constants/base-urls';
import { ENDPOINTS } from '../constants/endpoints';
import { setupServer } from 'msw/node';
import api from '../services/api';

interface ChangePasswordTypes {
  open: boolean;
  handleClose: () => void;
}

const renderChangePassword = ({ open, handleClose }: ChangePasswordTypes) => render(
  <MemoryRouter>
    <AccessTokenProvider>
      <ChangePasswordDialog open={open} handleClose={handleClose} />
    </AccessTokenProvider>
  </MemoryRouter>
);

afterEach(() => vi.restoreAllMocks);

describe('ChangePasswordDialog:', () => {
  it('Should render all elements.', () => {
    const handleClose = vi.fn();
    renderChangePassword({ open: true, handleClose });

    expect(screen.getByRole('heading', { level: 2 }).textContent).to.equal('Change your password');
    expect(screen.getByPlaceholderText('Password you logged in')).toBeTruthy();
    expect(screen.getByLabelText('display the password')).toBeTruthy();
    expect(screen.getByPlaceholderText('Min. 8 characters')).toBeTruthy();
    expect(screen.getByLabelText('display new password')).toBeTruthy();
    expect(screen.getByPlaceholderText('New password confirmation')).toBeTruthy();
    expect(screen.getByLabelText('display confirmation')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Change Password' })).toBeTruthy();
  });

  it('Should updates input value when user types.', async () => {
    const handleClose = vi.fn();
    renderChangePassword({ open: true, handleClose });

    const user = userEvent.setup();

    const password = screen.getByPlaceholderText('Password you logged in') as HTMLInputElement;
    const newPassword = screen.getByPlaceholderText('Min. 8 characters') as HTMLInputElement;
    const confirmNewPassword = screen.getByPlaceholderText('New password confirmation') as HTMLInputElement;

    // all inputs are empty at first
    expect(password.value).to.equal('');
    expect(newPassword.value).to.equal('');
    expect(confirmNewPassword.value).to.equal('');

    // Password value filled
    await user.type(password, 'password');
    expect(password.value).to.equal('password');

    // New password value filled
    await user.type(newPassword, 'new-password');
    expect(newPassword.value).to.equal('new-password');

    // Confirm password value filled
    await user.type(confirmNewPassword, 'confirm-password');
    expect(confirmNewPassword.value).to.equal('confirm-password');
  });

  it('Should toggles password visibility when clicking the show/hide button', async () => {
    const handleClose = vi.fn();
    renderChangePassword({ open: true, handleClose });

    const user = userEvent.setup();

    // Inputs
    const password = screen.getByPlaceholderText('Password you logged in');
    const newPassword = screen.getByPlaceholderText('Min. 8 characters');
    const confirmPassword = screen.getByPlaceholderText('New password confirmation');

    // Toggle buttons
    const displayPassword = screen.getByLabelText('display the password');
    const displayNewPassword = screen.getByLabelText('display new password');
    const displayConfirmPassword = screen.getByLabelText('display confirmation');

    // All input types are password at first
    expect(password).toHaveProperty('type', 'password');
    expect(newPassword).toHaveProperty('type', 'password');
    expect(confirmPassword).toHaveProperty('type', 'password');

    // User clicks diplay buttons
    await user.click(displayPassword);
    await user.click(displayNewPassword);
    await user.click(displayConfirmPassword);

    // Now input types are text
    expect(password).toHaveProperty('type', 'text');
    expect(newPassword).toHaveProperty('type', 'text');
    expect(confirmPassword).toHaveProperty('type', 'text');
  });

  it('Should close dialog when clicking the Cancel button.', async () => {
    const handleClose = vi.fn();
    renderChangePassword({ open: true, handleClose });

    const user = userEvent.setup();
    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });

    await user.click(cancelBtn);
    expect(handleClose).toHaveBeenCalled();
  });

  it('Should NOT send request if any input is empty.', async () => {
    const handleClose = vi.fn();
    renderChangePassword({ open: true, handleClose });

    const user = userEvent.setup();
    const putSpy = vi.spyOn(api, 'put');

    // Inputs
    const password = screen.getByPlaceholderText('Password you logged in');
    const newPassword = screen.getByPlaceholderText('Min. 8 characters');
    const confirmPassword = screen.getByPlaceholderText('New password confirmation');
    const changePasswordBtn = screen.getByRole('button', { name: 'Change Password' });

    // Not sends a request if all inputs are empty
    await user.click(changePasswordBtn);
    expect(putSpy).not.toHaveBeenCalled();

    // Fill one
    await user.type(password, 'password');
    await user.click(changePasswordBtn);
    expect(putSpy).not.toHaveBeenCalled();

    // Fill second
    await user.type(newPassword, 'new-password');
    await user.click(changePasswordBtn);
    expect(putSpy).not.toHaveBeenCalled();

    // Combines with first and third
    await user.clear(newPassword);
    await user.type(confirmPassword, 'confirm-password');
    await user.click(changePasswordBtn);
    expect(putSpy).not.toHaveBeenCalled();

    // Combines with second and third
    await user.clear(password);
    await user.type(newPassword, 'new-password');
    await user.click(changePasswordBtn);
    expect(putSpy).not.toHaveBeenCalled();
  });

  it('Should NOT send request when passwords are less than 8 characters.', async () => {
    const handleClose = vi.fn();
    renderChangePassword({ open: true, handleClose });

    const user = userEvent.setup();
    const putSpy = vi.spyOn(api, 'put');

    // Inputs
    const password = screen.getByPlaceholderText('Password you logged in');
    const newPassword = screen.getByPlaceholderText('Min. 8 characters');
    const confirmPassword = screen.getByPlaceholderText('New password confirmation');
    const changePasswordBtn = screen.getByRole('button', { name: 'Change Password' });

    // Password field less than 8 characters
    await user.type(password, '1234567');
    await user.type(newPassword, '12345678');
    await user.type(confirmPassword, '12345678');
    await user.click(changePasswordBtn);
    expect(putSpy).not.toHaveBeenCalled();

    // New password field less than 8 characters
    await user.clear(password);
    await user.clear(newPassword);
    await user.type(password, '12345678');
    await user.type(newPassword, '1234567');
    await user.type(confirmPassword, '12345678');
    await user.click(changePasswordBtn);
    expect(putSpy).not.toHaveBeenCalled();

    // Confirm password field less than 8 characters
    await user.clear(newPassword);
    await user.clear(confirmPassword);
    await user.type(password, '12345678');
    await user.type(newPassword, '12345678');
    await user.type(confirmPassword, '1234567');
    await user.click(changePasswordBtn);
    expect(putSpy).not.toHaveBeenCalled();
  });

  it('Should send request when all fields are filled correctly.', async () => {
    const handleClose = vi.fn();
    renderChangePassword({ open: true, handleClose });

    const user = userEvent.setup();
    const putSpy = vi.spyOn(api, 'put');

    // Inputs
    const password = screen.getByPlaceholderText('Password you logged in');
    const newPassword = screen.getByPlaceholderText('Min. 8 characters');
    const confirmPassword = screen.getByPlaceholderText('New password confirmation');
    const changePasswordBtn = screen.getByRole('button', { name: 'Change Password' });

    // Password field less than 8 characters
    await user.type(password, '12345678');
    await user.type(newPassword, '12345678');
    await user.type(confirmPassword, '12345678');
    await user.click(changePasswordBtn);

    // PUT request sent
    expect(putSpy).toHaveBeenCalled();
  });

  it('Closes dialog when clicking outside or pressing ESC.', async () => {
    const handleClose = vi.fn();
    renderChangePassword({ open: true, handleClose });

    const user = userEvent.setup();
    await user.keyboard('{Escape}');
    expect(handleClose).toHaveBeenCalled();
  });

  it('Should NOT render dialog when dialog is closed.', () => {
    const handleClose = vi.fn();
    renderChangePassword({ open: false, handleClose });
    expect(screen.queryByRole('button', { name: 'Cancel' })).toBeFalsy();
  });

  describe('Tests with requests:', () => {
    const server = setupServer();

    beforeAll(() => server.listen());
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());

    it('Should reset states when dialog is reopened.', async () => {
      const handleClose = vi.fn();
      const { rerender } = renderChangePassword({ open: true, handleClose });

      const user = userEvent.setup();

      // Inputs
      const password = screen.getByPlaceholderText('Password you logged in') as HTMLInputElement;
      const newPassword = screen.getByPlaceholderText('Min. 8 characters') as HTMLInputElement;
      const confirmPassword = screen.getByPlaceholderText('New password confirmation') as HTMLInputElement;

      // Toggle display buttons
      const displayPassword = screen.getByLabelText('display the password');
      const displayNewPassword = screen.getByLabelText('display new password');
      const displayConfirmPassword = screen.getByLabelText('display confirmation');

      const changePasswordBtn = screen.getByRole('button', { name: 'Change Password' });

      // User fills all inputs correctly
      await user.type(password, 'password');
      await user.type(newPassword, 'password');
      await user.type(confirmPassword, 'password');

      expect(password.value).to.equal('password');
      expect(newPassword.value).to.equal('password');
      expect(confirmPassword.value).to.equal('password');

      // User clicks all display buttons
      await user.click(displayPassword);
      await user.click(displayNewPassword);
      await user.click(displayConfirmPassword);

      expect(password).toHaveProperty('type', 'text');
      expect(newPassword).toHaveProperty('type', 'text');
      expect(confirmPassword).toHaveProperty('type', 'text');

      // Send PUT request to fill helper message inside
      server.use(
        http.put(BaseURLS.API + ENDPOINTS.EDIT_PROFILE, () => {
          return HttpResponse.json(
            { status: 'error', password: 'Invalid password.' },
            { status: 400 },
          );
        })
      );

      await user.click(changePasswordBtn);

      await waitFor(() => {
        expect(screen.getByText('Invalid password.')).toBeTruthy();
      });

      // Close and open the dialog
      rerender(
        <MemoryRouter>
          <AccessTokenProvider>
            <ChangePasswordDialog open={false} handleClose={handleClose} />
          </AccessTokenProvider>
        </MemoryRouter>
      );

      rerender(
        <MemoryRouter>
          <AccessTokenProvider>
            <ChangePasswordDialog open={true} handleClose={handleClose} />
          </AccessTokenProvider>
        </MemoryRouter>
      );

      // Now all states are should be reset
      expect(password.value).to.equal('');
      expect(newPassword.value).to.equal('');
      expect(confirmPassword.value).to.equal('');
      expect(password).toHaveProperty('type', 'password');
      expect(newPassword).toHaveProperty('type', 'password');
      expect(confirmPassword).toHaveProperty('type', 'password');
      expect(screen.queryByText('Invalid password.')).toBeFalsy();
    });

    it('Should close dialog after success request.', async () => {
      const handleClose = vi.fn();
      renderChangePassword({ open: true, handleClose });

      const user = userEvent.setup();

      // Inputs
      const password = screen.getByPlaceholderText('Password you logged in') as HTMLInputElement;
      const newPassword = screen.getByPlaceholderText('Min. 8 characters') as HTMLInputElement;
      const confirmPassword = screen.getByPlaceholderText('New password confirmation') as HTMLInputElement;
      const changePasswordBtn = screen.getByRole('button', { name: 'Change Password' });

      // User fills all inputs correctly
      await user.type(password, 'password');
      await user.type(newPassword, 'password');
      await user.type(confirmPassword, 'password');

      // Send PUT request
      server.use(
        http.put(BaseURLS.API + ENDPOINTS.EDIT_PROFILE, () => {
          return HttpResponse.json(
            { status: 'success', message: 'Password changed successfully.' },
            { status: 200 },
          );
        })
      );

      await user.click(changePasswordBtn);

      // Now dialog should be closed
      await waitFor(() => expect(handleClose).toHaveBeenCalled());
    });

    it('Should show loading spinner when PUT request is in progress and should\'t show after resolve.', async () => {
      const handleClose = vi.fn();
      renderChangePassword({ open: true, handleClose });

      const user = userEvent.setup();

      // Inputs
      const password = screen.getByPlaceholderText('Password you logged in') as HTMLInputElement;
      const newPassword = screen.getByPlaceholderText('Min. 8 characters') as HTMLInputElement;
      const confirmPassword = screen.getByPlaceholderText('New password confirmation') as HTMLInputElement;
      const changePasswordBtn = screen.getByRole('button', { name: 'Change Password' });

      // User fills all inputs correctly
      await user.type(password, 'password');
      await user.type(newPassword, 'password');
      await user.type(confirmPassword, 'password');

      server.use(
        http.put(BaseURLS.API + ENDPOINTS.EDIT_PROFILE, async () => {
          // Add delay to before resolve
          await new Promise((resolve) => setTimeout(resolve, 500));
          return HttpResponse.json(
            { message: 'Password changed successfully.' },
            { status: 200 }
          );
        })
      );

      await user.click(changePasswordBtn);

      // Now spinner should shown
      expect(screen.getByRole('progressbar')).toBeTruthy();
      expect(changePasswordBtn.getAttribute('disabled')).to.equal('');

      // Check if spinner gone after resolve
      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).toBeFalsy();
        expect(changePasswordBtn.getAttribute('disabled')).to.equal(null);
      });
    });

    it('Should show password error message and stops loading on delete failure.', async () => {
      const handleClose = vi.fn();
      renderChangePassword({ open: true, handleClose });

      const user = userEvent.setup();

      // Inputs
      const password = screen.getByPlaceholderText('Password you logged in') as HTMLInputElement;
      const newPassword = screen.getByPlaceholderText('Min. 8 characters') as HTMLInputElement;
      const confirmPassword = screen.getByPlaceholderText('New password confirmation') as HTMLInputElement;
      const changePasswordBtn = screen.getByRole('button', { name: 'Change Password' });

      // User fills all inputs correctly
      await user.type(password, 'password');
      await user.type(newPassword, 'password');
      await user.type(confirmPassword, 'password');

      server.use(
        http.put(BaseURLS.API + ENDPOINTS.EDIT_PROFILE, () => {
          return HttpResponse.json(
            { status: 'error', password: 'Invalid password.' },
            { status: 400 },
          );
        })
      );

      await user.click(changePasswordBtn);
      await waitFor(() => {
        expect(screen.getByText('Invalid password.')).toBeTruthy();
        expect(changePasswordBtn.getAttribute('disabled')).to.equal(null);
      });
    });

    it('Should show new password error message.', async () => {
      const handleClose = vi.fn();
      renderChangePassword({ open: true, handleClose });

      const user = userEvent.setup();

      // Inputs
      const password = screen.getByPlaceholderText('Password you logged in') as HTMLInputElement;
      const newPassword = screen.getByPlaceholderText('Min. 8 characters') as HTMLInputElement;
      const confirmPassword = screen.getByPlaceholderText('New password confirmation') as HTMLInputElement;
      const changePasswordBtn = screen.getByRole('button', { name: 'Change Password' });

      // User fills all inputs correctly
      await user.type(password, 'password');
      await user.type(newPassword, 'password');
      await user.type(confirmPassword, 'password');

      server.use(
        http.put(BaseURLS.API + ENDPOINTS.EDIT_PROFILE, () => {
          return HttpResponse.json(
            { status: 'error', new_password: 'New password can\'t be less than 8 characters.' },
            { status: 400 },
          );
        })
      );

      await user.click(changePasswordBtn);
      await waitFor(() => expect(screen.getByText('New password can\'t be less than 8 characters.')).toBeTruthy());
    });

    it('Should show confirm password error message.', async () => {
      const handleClose = vi.fn();
      renderChangePassword({ open: true, handleClose });

      const user = userEvent.setup();

      // Inputs
      const password = screen.getByPlaceholderText('Password you logged in') as HTMLInputElement;
      const newPassword = screen.getByPlaceholderText('Min. 8 characters') as HTMLInputElement;
      const confirmPassword = screen.getByPlaceholderText('New password confirmation') as HTMLInputElement;
      const changePasswordBtn = screen.getByRole('button', { name: 'Change Password' });

      // User fills all inputs correctly
      await user.type(password, 'password');
      await user.type(newPassword, 'password');
      await user.type(confirmPassword, 'password');

      server.use(
        http.put(BaseURLS.API + ENDPOINTS.EDIT_PROFILE, () => {
          return HttpResponse.json(
            { status: 'error', confirm_password: 'Password confirmation mismatch with new password.' },
            { status: 400 },
          );
        })
      );

      await user.click(changePasswordBtn);
      await waitFor(() => expect(screen.getByText('Password confirmation mismatch with new password.')).toBeTruthy());
    });
  });
});
