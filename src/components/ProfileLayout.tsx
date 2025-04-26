import React from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import DesktopProfileCard from './profile/DesktopProfileCard';
import { ProfileActivityPanel } from './profile/ProfileActivityPanel';
import { MobileProfileCard } from './profile/MobileProfileCard';


interface PageProps {
  page: 'my-profile' | 'profile';
};

const ProfileLayout: React.FC<PageProps> = ({ page }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));


  return <>
    <Box
      sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        width: '100%',
        alignItems: 'start'
      }}>
      {
        isMobile ?
          // Profile card - Mobile
          <MobileProfileCard page={page} /> :
          // Profile card - Desktop
          <DesktopProfileCard page={page} />
      }

      {/* Activity panel */}
      <ProfileActivityPanel />
    </Box>
  </>;
};

export default ProfileLayout;
