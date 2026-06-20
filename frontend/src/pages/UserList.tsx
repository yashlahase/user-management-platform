import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import InfoIcon from '@mui/icons-material/Info';

import { useUsers, useDeleteUser, useRestoreUser } from '../hooks/useUsers';
import { ListUsersParams } from '../services/userService';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { User } from '../types/user';

const colors = [
  '#4f46e5', // Indigo
  '#0891b2', // Cyan
  '#0d9488', // Teal
  '#2563eb', // Blue
  '#7c3aed', // Purple
  '#db2777', // Pink
  '#e11d48', // Rose
  '#ca8a04', // Yellow/Gold
  '#16a34a', // Green
  '#ea580c', // Orange
];

const stringToColor = (string: string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const getInitials = (name: string) => {
  if (!name) return 'U';
  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const formatAadhaar = (val: string) => {
  if (!val) return '';
  return val.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
};

export const UserList: React.FC = () => {
  const navigate = useNavigate();

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState<string>('ALL');
  const [showDeleted, setShowDeleted] = useState(false);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Confirmation States
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState<'delete' | 'restore'>('delete');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0); // Reset page on new search
    }, 400);

    return () => clearTimeout(handler);
  }, [search]);

  // Build params
  const params: ListUsersParams = {
    page: page + 1,
    limit,
    search: debouncedSearch || undefined,
    sortBy,
    sortOrder,
    status: status !== 'ALL' ? status : undefined,
    isDeleted: showDeleted || undefined,
  };

  const { data, isLoading, error } = useUsers(params);
  const deleteMutation = useDeleteUser();
  const restoreMutation = useRestoreUser();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleStatusChange = (event: any) => {
    setStatus(event.target.value);
    setPage(0);
  };

  const handleDeletedToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowDeleted(event.target.checked);
    setPage(0);
  };

  const handleRequestSort = (property: string) => {
    const isAsc = sortBy === property && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortBy(property);
  };

  const handleChangePage = (_: any, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(0);
  };

  const openConfirmDialog = (user: User, type: 'delete' | 'restore') => {
    setSelectedUser(user);
    setActionType(type);
    setConfirmOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedUser) return;

    if (actionType === 'delete') {
      await deleteMutation.mutateAsync(selectedUser.id);
    } else {
      await restoreMutation.mutateAsync(selectedUser.id);
    }

    setConfirmOpen(false);
    setSelectedUser(null);
  };

  const users = data?.data || [];
  const pagination = data?.pagination;
  const totalItems = pagination?.totalItems || 0;

  return (
    <Box sx={{ py: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
            System Directory
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage, verify, audit, and inspect enterprise user accounts and identity profiles.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/users/create')}
          sx={{ py: 1.25, px: 3, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          Add User Profile
        </Button>
      </Box>

      {/* Filters Card */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5, mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Grid container spacing={2} alignItems="center">
            {/* Search */}
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                size="small"
                label="Search users"
                placeholder="Search by Name, Email, Aadhaar or PAN..."
                value={search}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Status Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <Select
                fullWidth
                size="small"
                value={status}
                onChange={handleStatusChange}
                displayEmpty
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                <MenuItem value="ACTIVE">Active Users</MenuItem>
                <MenuItem value="INACTIVE">Inactive Users</MenuItem>
              </Select>
            </Grid>

            {/* Soft Delete Switch */}
            <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: { md: 'flex-end' } }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showDeleted}
                    onChange={handleDeletedToggle}
                    color="warning"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="body2">Show Archived (Deleted) Users</Typography>
                    <Tooltip title="Soft-deleted user profiles are kept in DB and can be recovered.">
                      <InfoIcon sx={{ fontSize: 16, color: 'text.secondary', cursor: 'pointer' }} />
                    </Tooltip>
                  </Box>
                }
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Main Table */}
      {error ? (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          Failed to fetch directory: {error.message}
        </Alert>
      ) : null}

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5, overflow: 'hidden' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8, flexDirection: 'column', gap: 2 }}>
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary">
              Synchronizing records...
            </Typography>
          </Box>
        ) : (
          <>
            <Table sx={{ minWidth: 650 }} aria-label="user directory table">
              <TableHead sx={{ bgcolor: 'background.neutral' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: '0.5px' }}>
                    <TableSortLabel
                      active={sortBy === 'name'}
                      direction={sortBy === 'name' ? sortOrder : 'asc'}
                      onClick={() => handleRequestSort('name')}
                    >
                      User Profile
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: '0.5px' }}>
                    Contact Details
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: '0.5px' }}>
                    Identity & Credentials
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: '0.5px' }}>
                    <TableSortLabel
                      active={sortBy === 'status'}
                      direction={sortBy === 'status' ? sortOrder : 'asc'}
                      onClick={() => handleRequestSort('status')}
                    >
                      Status
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: '0.5px' }}>
                    <TableSortLabel
                      active={sortBy === 'version'}
                      direction={sortBy === 'version' ? sortOrder : 'asc'}
                      onClick={() => handleRequestSort('version')}
                    >
                      Ver.
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', color: 'text.secondary', letterSpacing: '0.5px', pr: 3 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        No user profiles found.
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Try modifying search keyword or toggle the archived switch.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user: User) => (
                    <TableRow
                      key={user.id}
                      hover
                      sx={{
                        opacity: user.isDeleted ? 0.65 : 1,
                        '&:last-child td, &:last-child th': { border: 0 },
                        transition: 'background-color 0.2s ease',
                      }}
                    >
                      {/* Column 1: User Profile */}
                      <TableCell component="th" scope="row">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: stringToColor(user.name), width: 36, height: 36, fontSize: '0.85rem', fontWeight: 600 }}>
                            {getInitials(user.name)}
                          </Avatar>
                          <Box>
                            <Typography
                              variant="subtitle2"
                              fontWeight={600}
                              color="text.primary"
                              sx={{
                                textDecoration: user.isDeleted ? 'line-through' : 'none',
                                display: 'inline-block',
                              }}
                            >
                              {user.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" display="block" sx={{ fontSize: '0.8rem', mt: 0.25 }}>
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Column 2: Contact Details */}
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={500} color="text.primary">
                            {user.primaryMobile}
                          </Typography>
                          {user.secondaryMobile && (
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
                              Alt: {user.secondaryMobile}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>

                      {/* Column 3: Identity & Credentials */}
                      <TableCell>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" sx={{ px: 0.75, py: 0.25, bgcolor: 'action.hover', borderRadius: 0.5, fontSize: '0.65rem', fontWeight: 700, color: 'text.secondary' }}>
                              PAN
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500, letterSpacing: 0.5, fontSize: '0.85rem' }}>
                              {user.pan}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.75 }}>
                            <Typography variant="caption" sx={{ px: 0.75, py: 0.25, bgcolor: 'action.hover', borderRadius: 0.5, fontSize: '0.65rem', fontWeight: 700, color: 'text.secondary' }}>
                              UID
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500, color: 'text.secondary', fontSize: '0.85rem' }}>
                              {formatAadhaar(user.aadhaar)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Column 4: Status */}
                      <TableCell>
                        {user.isDeleted ? (
                          <Chip
                            icon={<Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'error.main', ml: 1 }} />}
                            label="Archived"
                            color="error"
                            variant="outlined"
                            size="small"
                            sx={{ fontWeight: 600, borderWidth: '1px', borderStyle: 'solid', '& .MuiChip-icon': { ml: '8px' } }}
                          />
                        ) : (
                          <Chip
                            icon={<Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: user.status === 'ACTIVE' ? 'success.main' : 'text.disabled', ml: 1 }} />}
                            label={user.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                            color={user.status === 'ACTIVE' ? 'success' : 'default'}
                            variant="outlined"
                            size="small"
                            sx={{ fontWeight: 600, borderWidth: '1px', borderStyle: 'solid', '& .MuiChip-icon': { ml: '8px' } }}
                          />
                        )}
                      </TableCell>

                      {/* Column 5: Version */}
                      <TableCell>
                        <Chip
                          label={`v${user.version}`}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontWeight: 500,
                            borderColor: 'divider',
                            bgcolor: 'background.paper',
                            color: 'text.secondary',
                          }}
                        />
                      </TableCell>

                      {/* Column 6: Actions */}
                      <TableCell align="right" sx={{ pr: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          <Tooltip title="View full profile">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/users/${user.id}`)}
                              sx={{ color: 'primary.main' }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {!user.isDeleted && (
                            <Tooltip title="Edit settings">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/users/${user.id}/edit`)}
                                sx={{ color: 'text.secondary' }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}

                          {user.isDeleted ? (
                            <Tooltip title="Restore archived profile">
                              <IconButton
                                size="small"
                                onClick={() => openConfirmDialog(user, 'restore')}
                                sx={{ color: 'success.main' }}
                              >
                                <RestoreFromTrashIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Deactivate & soft-delete">
                              <IconButton
                                size="small"
                                onClick={() => openConfirmDialog(user, 'delete')}
                                sx={{ color: 'error.main' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalItems}
              rowsPerPage={limit}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ borderTop: '1px solid', borderColor: 'divider' }}
            />
          </>
        )}
      </TableContainer>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title={actionType === 'delete' ? 'Archive User Account' : 'Restore User Account'}
        message={
          actionType === 'delete'
            ? `Are you sure you want to flag "${selectedUser?.name}" as deleted? This user will be hidden from default directories but can be restored later.`
            : `Do you want to restore "${selectedUser?.name}"? Their status will be restored and their profile will be visible in standard list directories.`
        }
        confirmText={actionType === 'delete' ? 'Archive User' : 'Restore User'}
        cancelText="Keep"
        severity={actionType === 'delete' ? 'error' : 'success'}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmOpen(false)}
      />
    </Box>
  );
};
