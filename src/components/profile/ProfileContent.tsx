// ProfileContent.tsx
import { Avatar, Button, Stack, Typography } from '@mui/material';
import { useUserData } from '../../hooks/useUserData';
import { formatDate } from '../../utils/formatDate';
import { title } from '../../utils/title';
import { BaseURLS } from '../../constants/base-urls';

interface ProfileContentProps {
  page: 'my-profile' | 'profile';
  handleEditClickOpen: () => void;
  handlePasswordClickOpen: () => void;
  handleDeleteOpen: () => void;
}

export const ProfileContent: React.FC<ProfileContentProps> = ({
  page,
  handleEditClickOpen,
  handlePasswordClickOpen,
  handleDeleteOpen,
}) => {
  const { userData } = useUserData();
  return (
    <Stack direction="column" display="flex" alignItems="center">
      <Avatar
        src={userData?.profile_picture ? BaseURLS.MEDIA + userData.profile_picture : ''}
        sx={{ width: '80px', height: '80px' }}
      />
      <Typography mt={2}>{userData?.username}</Typography>

      {page === 'my-profile' && (
        <>
          <Button
            variant="outlined"
            sx={{ width: '16em', mt: '1rem' }}
            onClick={handleEditClickOpen}
          >
            Edit Profile
          </Button>
          <Button variant="outlined" sx={{ width: '16em', mb: '1rem', mt: '1rem' }} onClick={handlePasswordClickOpen}>
            Change Password
          </Button>
          <Button variant='outlined' sx={{ width: '16em' }} onClick={handleDeleteOpen} color='error'>
            Delete My Account
          </Button>
        </>
      )}

      <Stack width="100%" mt={2} spacing={2}>
        <Typography>First Name: {title(userData?.first_name || '-')}</Typography>
        <Typography>Last Name: {title(userData?.last_name || '-')}</Typography>
        <Typography sx={{ whiteSpace: 'pre-wrap' }}>About: {userData?.about ? '\n' + userData?.about : '-'}</Typography>
        {userData?.is_teacher && (
          <Stack>
            <Typography>Subject(s):</Typography>
            {userData.subject?.map((s, i) => (
              <Typography key={i}>- {title(s.name)}</Typography>
            ))}
          </Stack>
        )}
        <Stack direction="row">
          <Typography variant="body2" color="text.disabled" mr={0.3}>
            Joined:
          </Typography>
          <Typography variant="body2" color="text.disabled">
            {formatDate(userData?.date_joined)}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};
