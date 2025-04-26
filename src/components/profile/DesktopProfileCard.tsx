import React, { useState } from 'react';
import { Paper } from '@mui/material';
import { ChangePasswordDialog } from './ChangePasswordDialog';
import { DeleteDialog } from './DeleteAccountDialog';
import { EditDialog } from './EditDialog';
import { ProfileContent } from './ProfileContent';


interface ProfileCardProps {
  page: 'my-profile' | 'profile';
}

const DesktopProfileCard: React.FC<ProfileCardProps> = ({ page }) => {
  const [openEdit, setOpenEdit] = useState<boolean>(false);
  const [openPassword, setOpenPassword] = useState<boolean>(false);
  const [openDelete, setOpenDelete] = useState<boolean>(false);

  // Edit dialog open/close
  const handleEditClickOpen = () => {
    setOpenEdit(true);
  };

  const handleEditClose = () => {
    setOpenEdit(false);
  };

  // Password dialog open/close
  const handlePasswordClickOpen = () => {
    setOpenPassword(true);
  };

  const handlePasswordClose = () => {
    setOpenPassword(false);
  };

  // Delete account dialog open/close
  const handleDeleteOpen = () => {
    setOpenDelete(true);
  };

  const handleDeleteClose = () => {
    setOpenDelete(false);
  };


  return <>
    {/* Dialogs */}
    {
      page === 'my-profile' &&
      <>
        {/* Edit Dialog */}
        <EditDialog
          handleClose={handleEditClose}
          open={openEdit}
        />

        {/*  Password Dialog  */}
        <ChangePasswordDialog
          handleClose={handlePasswordClose}
          open={openPassword}
        />

        {/* Delete account dialog */}
        <DeleteDialog
          handleClose={handleDeleteClose}
          open={openDelete}
        />
      </>
    }

    <Paper
      data-testid="profile-card-paper"
      elevation={3}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '350px',
        p: '1rem',
        m: '1rem'
      }}>
      <ProfileContent
        page={page}
        handleEditClickOpen={handleEditClickOpen}
        handlePasswordClickOpen={handlePasswordClickOpen}
        handleDeleteOpen={handleDeleteOpen}
      />
    </Paper>
  </>;
};

export default DesktopProfileCard;
