import { ThemeOptions } from '@mui/material/styles';


// https://www.realtimecolors.com/?colors=0c1822-edf2f8-244660-9a90d5-b2244c&fonts=Inter-Inter
export const darkMode: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#9fc1db',
      contrastText: '#070c12',
    },
    secondary: {
      main: '#342a6f',
      contrastText: '#dde9f3',
    },
    text: {
      primary: 'rgb(221, 233, 243)',
      secondary: 'rgba(221, 233, 243, 0.6)',
      disabled: 'rgba(221, 233, 243, 0.38)',
    },
    background: {
      default: '#070c12',
    },
  },
};

export const lightMode: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#244660',
      contrastText: '#edf2f8',
    },
    secondary: {
      main: '#9a90d5',
      contrastText: '#0c1822',
    },
    text: {
      primary: 'rgb(12, 24, 34)',
      secondary: 'rgba(12, 24, 34, 0.6)',
      disabled: 'rgba(12, 24, 34, 0.38)',
    },
    background: {
      default: '#edf2f8',
    },
  },
};
