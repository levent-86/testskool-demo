import { Button, Paper } from '@mui/material';
import React, { useState } from 'react';
import { useUserData } from '../../hooks/useUserData';


export const ProfileActivityPanel: React.FC = () => {
  const [viewMode, setViewMode] = useState('quizzes');
  const { userData } = useUserData();

  return <>
    <Paper
      data-testid="activity-panel-paper"
      elevation={5}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        width: '100%',
        mt: '1rem',
        mr: '1rem',
        mb: '1rem',
        p: '1rem'
      }}
    >

      {userData?.is_student && (
        <Button
          variant="contained"
          onClick={() => setViewMode(viewMode === 'quizzes' ? 'stats' : 'quizzes')}
        >
          {viewMode === 'quizzes' ? 'View Stats' : 'View Quizzes'}
        </Button>
      )}
      {viewMode === 'quizzes' ? (
        <p>TODO: Quizzes</p>
      ) : (
        <p>TODO: Stats</p>
      )}
    </Paper>
  </>;
};
