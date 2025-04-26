import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { DeleteDialog } from '../components/profile/DeleteAccountDialog';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AccessTokenProvider } from '../contexts/AccessProvider';
import userEvent from '@testing-library/user-event';
import api from '../services/api';
import { ENDPOINTS } from '../constants/endpoints';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { BaseURLS } from '../constants/base-urls';

interface DeleteTypes {
  open: boolean;
  handleClose: () => void;
}

const renderDelete = ({ open, handleClose }: DeleteTypes) => render(
  <MemoryRouter>
    <AccessTokenProvider>
      <DeleteDialog open={open} handleClose={handleClose} />
    </AccessTokenProvider>
  </MemoryRouter>
);

it('Closes dialog when clicking outside or pressing ESC.', async () => {
  const handleClose = vi.fn();
  renderDelete({ open: true, handleClose });

  const user = userEvent.setup();
  await user.keyboard('{Escape}');

  expect(handleClose).toHaveBeenCalled();
});

it('Should NOT render anything when dialog is closed.', () => {
  const handleClose = vi.fn();
  renderDelete({ open: false, handleClose: handleClose });
  expect(screen.queryByText(/warning:/i)).not.toBeTruthy();
});

describe('DeleteAccountDialog:', () => {
  afterEach(() => vi.restoreAllMocks);

  it('Renders all dialog elements correctly.', () => {
    const handleClose = vi.fn();
    renderDelete({ open: true, handleClose });

    expect(screen.getByRole('heading', { level: 2 }).textContent).to.equal('Delete your account');
    expect(screen.getByText(/warning:/i)).toBeTruthy();
    expect(screen.getByText(/this can not be undone/i)).toBeTruthy();
    expect(screen.getByText(/all your data will be lost/i)).toBeTruthy();
    expect(screen.getByPlaceholderText('Password you logged in')).toBeTruthy();
    expect(screen.getByLabelText('display the password')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Delete Account' })).toBeTruthy();
  });

  it('Updates input value when user types.', async () => {
    const handleClose = vi.fn();
    renderDelete({ open: true, handleClose });

    const user = userEvent.setup();
    const passwordInp = screen.getByPlaceholderText('Password you logged in') as HTMLInputElement;

    expect(passwordInp.value).to.equal('');
    await user.type(passwordInp, 'password');
    expect(passwordInp.value).to.equal('password');
  });

  it('Toggles password visibility when clicking the show/hide button.', async () => {
    const handleClose = vi.fn();
    renderDelete({ open: true, handleClose });

    const user = userEvent.setup();
    const passwordInp = screen.getByPlaceholderText('Password you logged in');
    const displayPassword = screen.getByLabelText('display the password');

    // Input type is password at first
    expect(passwordInp).toHaveProperty('type', 'password');
    await user.click(displayPassword);

    // Now input type should be text
    expect(passwordInp).toHaveProperty('type', 'text');
  });

  it('Closes dialog when clicking the Cancel button.', async () => {
    const handleClose = vi.fn();
    renderDelete({ open: true, handleClose: handleClose });

    const user = userEvent.setup();
    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    const heading = screen.getByRole('heading', { level: 2 }).textContent;

    expect(heading).to.equal('Delete your account');
    await user.click(cancelBtn);
    expect(handleClose).toHaveBeenCalled();
  });

  it('Does NOT send request when Delete button is clicked with empty input.', async () => {
    const handleClose = vi.fn();
    renderDelete({ open: true, handleClose: handleClose });

    const user = userEvent.setup();
    const postSpy = vi.spyOn(api, 'delete');
    const deleteBtn = screen.getByRole('button', { name: 'Delete Account' });

    await user.click(deleteBtn);
    expect(postSpy).not.toHaveBeenCalled();
  });

  it('Does NOT send request when password is less than 8 characters.', async () => {
    const handleClose = vi.fn();
    renderDelete({ open: true, handleClose: handleClose });

    const user = userEvent.setup();
    const postSpy = vi.spyOn(api, 'delete');
    const deleteBtn = screen.getByRole('button', { name: 'Delete Account' });
    const passwordInp = screen.getByPlaceholderText('Password you logged in');

    // 7 characters long
    await user.type(passwordInp, '1234567');

    await user.click(deleteBtn);
    expect(postSpy).not.toHaveBeenCalled();
  });

  it('Sends delete request when password is 8 characters or longer.', async () => {
    const handleClose = vi.fn();
    renderDelete({ open: true, handleClose: handleClose });

    const user = userEvent.setup();
    const deleteSpy = vi.spyOn(api, 'delete');
    const deleteBtn = screen.getByRole('button', { name: 'Delete Account' });
    const passwordInp = screen.getByPlaceholderText('Password you logged in');

    // Enough character long to send
    await user.type(passwordInp, '12345678');

    await user.click(deleteBtn);
    expect(deleteSpy).toHaveBeenCalledWith(ENDPOINTS.DELETE_ACCOUNT, {
      data: { password: '12345678' },
    });
  });

  describe('Tests with requests', () => {
    const server = setupServer();

    beforeAll(() => server.listen());
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());

    it('Should reset states when dialog is closed.', async () => {
      const handleClose = vi.fn();
      const { rerender } = renderDelete({ open: true, handleClose });

      const user = userEvent.setup();
      const passwordInp = screen.getByPlaceholderText('Password you logged in') as HTMLInputElement;
      const displayPassword = screen.getByLabelText('display the password');
      const deleteBtn = screen.getByRole('button', { name: 'Delete Account' });

      // Type a password in the input
      await user.type(passwordInp, 'password');
      expect(passwordInp.value).to.equal('password');

      // toggle visibility
      await user.click(displayPassword);
      expect(passwordInp).toHaveProperty('type', 'text');

      // Send DELETE request to fill helper message inside
      server.use(
        http.delete(BaseURLS.API + ENDPOINTS.DELETE_ACCOUNT, () => {
          return HttpResponse.json(
            { status: 'error', password: 'Invalid password.' },
            { status: 400 },
          );
        })
      );

      await user.click(deleteBtn);

      await waitFor(() => {
        expect(screen.getByText('Invalid password.')).toBeTruthy();
      });

      // Close and open the dialog
      rerender(
        <MemoryRouter>
          <AccessTokenProvider>
            <DeleteDialog open={false} handleClose={handleClose} />
          </AccessTokenProvider>
        </MemoryRouter>
      );

      rerender(
        <MemoryRouter>
          <AccessTokenProvider>
            <DeleteDialog open={true} handleClose={handleClose} />
          </AccessTokenProvider>
        </MemoryRouter>
      );

      // Now all states are should be reset
      expect(passwordInp.value).to.equal('');
      expect(passwordInp).toHaveProperty('type', 'password');
      expect(screen.queryByText('Invalid password.')).toBeFalsy();
    });

    it('Handles successful account deletion and closes dialog.', async () => {
      const handleClose = vi.fn();
      renderDelete({ open: true, handleClose });

      const user = userEvent.setup();
      const passwordInp = screen.getByPlaceholderText('Password you logged in');
      const deleteBtn = screen.getByRole('button', { name: 'Delete Account' });

      await user.type(passwordInp, 'password');

      server.use(
        http.delete(BaseURLS.API + ENDPOINTS.DELETE_ACCOUNT, () => {
          return HttpResponse.json(
            { status: 'success', password: 'Account deleted successfully.' },
            { status: 200 },
          );
        })
      );

      await user.click(deleteBtn);

      await waitFor(() => expect(handleClose).toHaveBeenCalled());
    });

    it('Shows loading spinner when DELETE request is in progress and should\'t show after resolve.', async () => {
      const handleClose = vi.fn();
      renderDelete({ open: true, handleClose });

      const user = userEvent.setup();

      // Inputs
      const passwordInp = screen.getByPlaceholderText('Password you logged in');
      const deleteBtn = screen.getByRole('button', { name: 'Delete Account' });

      // User fills the input correctly
      await user.type(passwordInp, 'password');

      server.use(
        http.delete(BaseURLS.API + ENDPOINTS.DELETE_ACCOUNT, async () => {
          // Add delay to resolve
          await new Promise((resolve) => setTimeout(resolve, 500));

          return HttpResponse.json(
            { message: 'Account deleted successfully.' },
            { status: 200 }
          );
        })
      );

      await user.click(deleteBtn);

      // Now spinner should shown
      expect(screen.getByRole('progressbar')).toBeTruthy();
      expect(deleteBtn.getAttribute('disabled')).to.equal('');

      // Check if spinner gone after resolve
      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).toBeFalsy();
        expect(deleteBtn.getAttribute('disabled')).to.equal(null);
      });
    });

    it('Displays error message and stops loading on delete failure.', async () => {
      const handleClose = vi.fn();
      renderDelete({ open: true, handleClose });

      const user = userEvent.setup();

      // Inputs
      const passwordInp = screen.getByPlaceholderText('Password you logged in');
      const deleteBtn = screen.getByRole('button', { name: 'Delete Account' });

      // User fills input correctly
      await user.type(passwordInp, 'wrong-password');

      server.use(
        http.delete(BaseURLS.API + ENDPOINTS.DELETE_ACCOUNT, () => {
          return HttpResponse.json(
            { status: 'error', password: 'Invalid password.' },
            { status: 400 },
          );
        })
      );

      await user.click(deleteBtn);

      await waitFor(() => {
        expect(screen.getByText('Invalid password.')).toBeTruthy();
        expect(deleteBtn.getAttribute('disabled')).to.equal(null);
      });
    });
  });
});
