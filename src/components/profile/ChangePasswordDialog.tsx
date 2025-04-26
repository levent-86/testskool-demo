import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Button, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle,
  FilledInput, FormControl,
  FormHelperText, IconButton,
  InputAdornment, InputLabel,
  Stack
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { submitProfileUpdate } from '../../services/profileService';
import { AxiosError } from 'axios';

interface ChangePasswordTypes {
  open: boolean;
  handleClose: () => void;
}

interface ErrorResponse {
  password?: string;
  new_password?: string;
  confirm_password?: string;
}

export const ChangePasswordDialog: React.FC<ChangePasswordTypes> = ({ open, handleClose }) => {
  // State variables - Datas to send
  const [oldPassword, setOldPassword] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // State variables - Loadings / Previews / Messages
  const [showOldPassword, setShowOldPassword] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [newPasswordMessage, setNewPasswordMessage] = useState<string | null>(null);
  const [confirmPasswordMessage, setConfirmPasswordMessage] = useState<string | null>(null);
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);

  // Password value handlers
  const handleOldPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value: string = e.target.value;
    setOldPassword(value);
  };

  const handleNewPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value: string = e.target.value;
    setPassword(value);
  };

  const handleConfirmPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value: string = e.target.value;
    setConfirmPassword(value);
  };

  // Password show/hide handlers
  const handleShowHideOldPassword = (): void => setShowOldPassword((show) => !show);
  const handleShowHidePassword = (): void => setShowPassword((show) => !show);
  const handleShowHideConfirmPassword = (): void => setShowConfirmPassword((show) => !show);

  // Mouse down / mouse up handlers
  const handleMouseDownPassword = (e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault();
  const handleMouseUpPassword = (e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault();

  // Clean input data and reset when dialog closed
  useEffect(() => {
    if (!open) {
      setOldPassword('');
      setPassword('');
      setConfirmPassword('');
      setPasswordMessage(null);
      setNewPasswordMessage(null);
      setConfirmPasswordMessage(null);
      setShowOldPassword(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
      setIsButtonLoading(false);
    }
  }, [open]);

  // Send passwords
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsButtonLoading(true);

    // Prepare the data
    const formData = new FormData();
    if (oldPassword) formData.append('old_password', oldPassword);
    if (password) formData.append('password', password);
    if (confirmPassword) formData.append('confirm_password', confirmPassword);

    try {
      const response = await submitProfileUpdate(formData);

      if (response.status < 400) {
        handleClose();
      }

      setIsButtonLoading(false);

    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      // Show error only on development mode
      if (process.env.NODE_ENV === 'development') {
        console.error('Request failed:', error);
      }

      // Show error messages on inputs
      if (err.response) {
        const passwordError = err.response.data.password;
        const newPasswordError = err.response.data.new_password;
        const confirmPasswordError = err.response.data.confirm_password;

        if (passwordError === undefined) {
          setPasswordMessage(null);
        } else {
          setPasswordMessage(passwordError);
        }

        if (newPasswordError === undefined) {
          setNewPasswordMessage(null);
        } else {
          setNewPasswordMessage(newPasswordError);
        }

        if (confirmPasswordError === undefined) {
          setConfirmPasswordMessage(null);
        } else {
          setConfirmPasswordMessage(confirmPasswordError);
        }
      }

      setIsButtonLoading(false);

    }
  };

  return <>
    <Dialog
      open={open}
      onClose={handleClose}
      scroll='body'
      closeAfterTransition={false}
    >

      <DialogTitle>Change your password</DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2}>

            {/* Old password */}
            <FormControl variant="filled">
              <InputLabel htmlFor="filled-adornment-password">Password</InputLabel>
              <FilledInput
                required={true}
                value={oldPassword}
                onChange={handleOldPassword}
                type={showOldPassword ? 'text' : 'password'}
                placeholder="Password you logged in"
                inputProps={{ minLength: 8 }}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showOldPassword ? 'hide the password' : 'display the password'
                      }
                      onClick={handleShowHideOldPassword}
                      onMouseDown={handleMouseDownPassword}
                      onMouseUp={handleMouseUpPassword}
                      edge="end"
                    >
                      {showOldPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
              />
              <FormHelperText error={true}>{passwordMessage}</FormHelperText>
            </FormControl>

            {/* New password */}
            <FormControl variant="filled">
              <InputLabel htmlFor="filled-adornment-password">New Password</InputLabel>
              <FilledInput
                required={true}
                value={password}
                onChange={handleNewPassword}
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                inputProps={{ minLength: 8 }}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showPassword ? 'hide the password' : 'display new password'
                      }
                      onClick={handleShowHidePassword}
                      onMouseDown={handleMouseDownPassword}
                      onMouseUp={handleMouseUpPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
              />
              <FormHelperText error={true}>{newPasswordMessage}</FormHelperText>
            </FormControl>

            {/* Confirm password */}
            <FormControl variant="filled">
              <InputLabel htmlFor="filled-adornment-password">Confirn New Password</InputLabel>
              <FilledInput
                required={true}
                value={confirmPassword}
                onChange={handleConfirmPassword}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="New password confirmation"
                inputProps={{ minLength: 8 }}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showConfirmPassword ? 'hide the password' : 'display confirmation'
                      }
                      onClick={handleShowHideConfirmPassword}
                      onMouseDown={handleMouseDownPassword}
                      onMouseUp={handleMouseUpPassword}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
              />
              <FormHelperText error={true}>{confirmPasswordMessage}</FormHelperText>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" disabled={isButtonLoading}>
            {
              isButtonLoading ? <CircularProgress size={25} /> : 'Change Password'
            }
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  </>;
};
