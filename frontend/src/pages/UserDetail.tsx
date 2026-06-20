import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MapIcon from '@mui/icons-material/Map';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import NotesIcon from '@mui/icons-material/Notes';

import { useUser, useDeleteUser, useRestoreUser } from '../hooks/useUsers';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState<'delete' | 'restore'>('delete');

  const { data, isLoading, error } = useUser(id || '');
  const deleteMutation = useDeleteUser();
  const restoreMutation = useRestoreUser();

  const handleAction = async () => {
    if (!id) return;
    if (actionType === 'delete') {
      await deleteMutation.mutateAsync(id);
    } else {
      await restoreMutation.mutateAsync(id);
    }
    setConfirmOpen(false);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: 2 }}>
        <CircularProgress />
        <Typography color="text.secondary">Fetching record details...</Typography>
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
          {error?.message || 'User record not found.'}
        </Alert>
      </Box>
    );
  }

  const user = data.data;

  // Formatting dates
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Mask Aadhaar for privacy but reveal details
  const formatAadhaar = (aadhaar: string) => {
    return `${aadhaar.substring(0, 4)} - ${aadhaar.substring(4, 8)} - ${aadhaar.substring(8, 12)}`;
  };

  return (
    <Box sx={{ py: 2 }}>
      {/* Navigation & Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/users')}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Back to Directory
        </Button>
        
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {!user.isDeleted ? (
            <>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/users/${user.id}/edit`)}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                Edit Profile
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => {
                  setActionType('delete');
                  setConfirmOpen(true);
                }}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                Archive User
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              color="success"
              startIcon={<RestoreFromTrashIcon />}
              onClick={() => {
                setActionType('restore');
                setConfirmOpen(true);
              }}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Restore Profile
            </Button>
          )}
        </Box>
      </Box>

      {/* Main Detail Grid */}
      <Grid container spacing={3.5}>
        {/* Profile Card Header */}
        <Grid item xs={12}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ bgcolor: 'primary.main', height: 75, opacity: 0.85 }} />
            <CardContent sx={{ p: 4, pt: 0, position: 'relative' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2, mt: -4 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: user.isDeleted ? 'error.light' : 'primary.light',
                    border: '4px solid',
                    borderColor: 'background.paper',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: user.isDeleted ? 'error.contrastText' : 'primary.contrastText',
                  }}
                >
                  <Typography variant="h4" fontWeight={700}>
                    {user.name.charAt(0).toUpperCase()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {user.isDeleted ? (
                    <Chip label="ARCHIVED / DELETED" color="error" sx={{ fontWeight: 600 }} />
                  ) : (
                    <Chip
                      label={user.status}
                      color={user.status === 'ACTIVE' ? 'success' : 'default'}
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                  <Chip label={`Version ${user.version}`} variant="outlined" sx={{ fontWeight: 600 }} />
                </Box>
              </Box>

              <Box sx={{ mt: 2.5 }}>
                <Typography variant="h5" fontWeight={700} color="text.primary">
                  {user.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Unique Identification ID: {user.id}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Column 1: Info Cards */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {/* General & Contact details */}
            <Grid item xs={12}>
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5 }}>
                <CardContent sx={{ p: 3.5 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Contact & Identification
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <EmailIcon color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">Email Address</Typography>
                          <Typography variant="body1" fontWeight={500}>{user.email}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <PhoneIcon color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">Primary Contact</Typography>
                          <Typography variant="body1" fontWeight={500}>{user.primaryMobile}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <PhoneIcon color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">Secondary Contact</Typography>
                          <Typography variant="body1" fontWeight={500}>{user.secondaryMobile || 'Not Provided'}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <CalendarMonthIcon color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">Date of Birth</Typography>
                          <Typography variant="body1" fontWeight={500}>{formatDate(user.dateOfBirth)}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <MapIcon color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">Place of Birth</Typography>
                          <Typography variant="body1" fontWeight={500}>{user.placeOfBirth}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <BadgeIcon color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">PAN Card</Typography>
                          <Typography variant="body1" fontWeight={600} sx={{ letterSpacing: 0.5, fontFamily: 'monospace' }}>
                            {user.pan}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <BadgeIcon color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">Aadhaar (UIDAI)</Typography>
                          <Typography variant="body1" fontWeight={600} sx={{ letterSpacing: 0.5, fontFamily: 'monospace' }}>
                            {formatAadhaar(user.aadhaar)}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Address Information */}
            <Grid item xs={12}>
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5 }}>
                <CardContent sx={{ p: 3.5 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Address Documentation
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Current Address
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {user.currentAddress}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Permanent Address
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {user.permanentAddress}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Column 2: Audit Logs & Remarks */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={3}>
            {/* Audit Log Card */}
            <Grid item xs={12}>
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5 }}>
                <CardContent sx={{ p: 3.5 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Account Audit Log
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <List disablePadding>
                    <ListItem sx={{ px: 0, py: 1.5 }}>
                      <ListItemText
                        primary="Created At"
                        secondary={formatDateTime(user.createdAt)}
                        primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body2', color: 'text.primary', fontWeight: 500 }}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem sx={{ px: 0, py: 1.5 }}>
                      <ListItemText
                        primary="Created By"
                        secondary={user.createdBy}
                        primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body2', color: 'text.primary', fontWeight: 500 }}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem sx={{ px: 0, py: 1.5 }}>
                      <ListItemText
                        primary="Last Updated At"
                        secondary={formatDateTime(user.updatedAt)}
                        primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body2', color: 'text.primary', fontWeight: 500 }}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem sx={{ px: 0, py: 1.5 }}>
                      <ListItemText
                        primary="Last Updated By"
                        secondary={user.updatedBy || 'SYSTEM_INIT'}
                        primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body2', color: 'text.primary', fontWeight: 500 }}
                      />
                    </ListItem>
                    {user.isDeleted && (
                      <>
                        <Divider />
                        <ListItem sx={{ px: 0, py: 1.5 }}>
                          <ListItemText
                            primary="Deleted At"
                            secondary={formatDateTime(user.deletedAt || '')}
                            primaryTypographyProps={{ variant: 'subtitle2', color: 'error.main' }}
                            secondaryTypographyProps={{ variant: 'body2', color: 'text.primary', fontWeight: 500 }}
                          />
                        </ListItem>
                      </>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Remarks Card */}
            <Grid item xs={12}>
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5 }}>
                <CardContent sx={{ p: 3.5 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <NotesIcon fontSize="small" /> Remarks
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" color={user.remarks ? 'text.primary' : 'text.secondary'}>
                    {user.remarks || 'No administrator remarks provided.'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Confirmation Modal */}
      <ConfirmDialog
        open={confirmOpen}
        title={actionType === 'delete' ? 'Archive User Account' : 'Restore User Account'}
        message={
          actionType === 'delete'
            ? `Are you sure you want to flag "${user.name}" as deleted? This user will be hidden from default listings.`
            : `Do you want to restore "${user.name}"? Their status will be active and visible in standard lists.`
        }
        confirmText={actionType === 'delete' ? 'Archive User' : 'Restore User'}
        cancelText="Cancel"
        severity={actionType === 'delete' ? 'error' : 'success'}
        onConfirm={handleAction}
        onCancel={() => setConfirmOpen(false)}
      />
    </Box>
  );
};
