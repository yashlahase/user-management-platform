import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { UserForm } from '../components/UserForm';
import { useUser, useUpdateUser } from '../hooks/useUsers';
import { UserFormData } from '../utils/validators';

export const UserEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useUser(id || '');
  const updateMutation = useUpdateUser();

  const handleFormSubmit = async (formData: UserFormData) => {
    if (!id || !data?.data) return;
    
    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          ...formData,
          version: data.data.version, // optimistic locking check
        },
      });
      navigate(`/users/${id}`);
    } catch (err) {
      // Errors handled by snackbar in hook
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: 2 }}>
        <CircularProgress />
        <Typography color="text.secondary">Fetching user profile data...</Typography>
      </Box>
    );
  }

  if (error || !data?.data) {
    return (
      <Box sx={{ py: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/users')} sx={{ mb: 3 }}>
          Back to Directory
        </Button>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error?.message || 'Failed to retrieve user profile.'}
        </Alert>
      </Box>
    );
  }

  const user = data.data;

  // Format the date to YYYY-MM-DD format so standard HTML5 date picker displays it correctly
  let formattedDob = '';
  try {
    if (user.dateOfBirth) {
      formattedDob = new Date(user.dateOfBirth).toISOString().split('T')[0];
    }
  } catch (e) {
    console.error('Error formatting date of birth', e);
  }

  const initialFormData: Partial<UserFormData> = {
    name: user.name,
    email: user.email,
    primaryMobile: user.primaryMobile,
    secondaryMobile: user.secondaryMobile || '',
    aadhaar: user.aadhaar,
    pan: user.pan,
    dateOfBirth: formattedDob,
    placeOfBirth: user.placeOfBirth,
    currentAddress: user.currentAddress,
    permanentAddress: user.permanentAddress,
    status: user.status,
    remarks: user.remarks || '',
  };

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
          Edit User Profile
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Update the profile details for {user.name}. Enterprise audit fields will log your changes automatically.
        </Typography>
      </Box>

      {user.isDeleted ? (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          Warning: This user account is currently soft-deleted (archived). Restore the account first to update its contents.
        </Alert>
      ) : (
        <UserForm
          initialData={initialFormData}
          onSubmit={handleFormSubmit}
          onCancel={() => navigate(`/users/${user.id}`)}
          isLoading={updateMutation.isPending}
          submitButtonText="Save Changes"
        />
      )}
    </Box>
  );
};
