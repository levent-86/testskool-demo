import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Button, CircularProgress, Dialog,
  DialogActions, DialogContent, DialogTitle,
  FilledInput, FormControl, FormHelperText,
  IconButton, InputAdornment, InputLabel, Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ENDPOINTS } from '../../constants/endpoints';
import api from '../../services/api';
import { AxiosError, AxiosResponse } from 'axios';
import { useAccessToken } from '../../hooks/useAccessToken';


interface DeleteTypes {
  open: boolean;
  handleClose: () => void;
}

interface ApiResponse {
  message: string;
}

interface ErrorResponse {
  password?: string;
}

export const DeleteDialog: React.FC<DeleteTypes> = ({ open, handleClose }) => {
  // Data to be sent
  const [password, setPassword] = useState<string>('');

  const { setAccess } = useAccessToken();

  // States for show message / loading / show - hide password
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  const handlePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value: string = e.target.value;
    setPassword(value);
  };

  // Handlers for input
  const handleShowHidePassword = (): void => setShowPassword((show) => !show);
  const handleMouseDownPassword = (e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault();
  const handleMouseUpPassword = (e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault();

  // Send DELETE request
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsButtonLoading(true);

    try {

      const response: AxiosResponse<ApiResponse> = await api.delete(ENDPOINTS.DELETE_ACCOUNT, {
        data: { password },
      });

      if (response.status < 400) {
        handleClose();
        setPasswordMessage(null);
        setAccess(null);
        setIsButtonLoading(false);
      }


    } catch (error) {
      setIsButtonLoading(false);
      const err = error as AxiosError<ErrorResponse>;

      // Set error message
      if (err.response) {
        const passwordError = err.response.data.password;
        if (passwordError === undefined) {
          setPasswordMessage(null);
        } else {
          setPasswordMessage(passwordError);
        }
      }

      // Show error only on development mode
      if (process.env.NODE_ENV === 'development') {
        console.error('Request failed:', error);
      }
    }
  };

  // Reset input when dialog closed
  useEffect(() => {
    if (!open) {
      setPassword('');
      setPasswordMessage(null);
      setIsButtonLoading(false);
      setShowPassword(false);
    };
  }, [open]);

  return <>
    <Dialog
      open={open}
      onClose={handleClose}
      scroll='body'
      closeAfterTransition={false}
    >
      <DialogTitle>Delete your account</DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Typography variant="body2" color="warning.main">WARNING:</Typography>
          <Typography variant="body2">This can NOT be undone!</Typography>
          <Typography variant="body2">When you delete your account, all your data will be lost.</Typography>

          {/* Password input */}
          <FormControl variant="filled" sx={{ mt: '2rem', width: '100%' }}>
            <InputLabel htmlFor="filled-adornment-password">Password</InputLabel>
            <FilledInput
              required={true}
              value={password}
              onChange={handlePassword}
              type={showPassword ? 'text' : 'password'}
              placeholder="Password you logged in"
              inputProps={{ minLength: 8 }}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label={
                      showPassword ? 'hide the password' : 'display the password'
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
            <FormHelperText error={true}>{passwordMessage}</FormHelperText>
          </FormControl>
        </DialogContent>

        {/* Button */}
        <DialogActions sx={{ mb: '1rem' }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" disabled={isButtonLoading} color='error'>
            {
              isButtonLoading ? <CircularProgress size={25} /> : 'Delete Account'
            }
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  </>;
};
