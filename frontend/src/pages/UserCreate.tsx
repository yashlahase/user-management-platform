import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { UserForm } from '../components/UserForm';
import { useCreateUser } from '../hooks/useUsers';
import { UserFormData } from '../utils/validators';

export const UserCreate: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateUser();

  const handleFormSubmit = async (data: UserFormData) => {
    try {
      await createMutation.mutateAsync(data);
      navigate('/users');
    } catch (error) {
      // Errors handled by snackbar in hook
    }
  };

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
          Register User Profile
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Fill in the details below to register a new user in the enterprise platform.
        </Typography>
      </Box>

      <UserForm
        onSubmit={handleFormSubmit}
        onCancel={() => navigate('/users')}
        isLoading={createMutation.isPending}
        submitButtonText="Create User"
      />
    </Box>
  );
};
