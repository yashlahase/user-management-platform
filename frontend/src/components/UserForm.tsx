import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Divider,
} from '@mui/material';
import { userFormSchema, UserFormData } from '../utils/validators';

interface UserFormProps {
  initialData?: Partial<UserFormData>;
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  submitButtonText?: string;
}

export const UserForm: React.FC<UserFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitButtonText = 'Submit',
}) => {
  const [sameAddress, setSameAddress] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: '',
      email: '',
      primaryMobile: '',
      secondaryMobile: '',
      aadhaar: '',
      pan: '',
      dateOfBirth: '',
      placeOfBirth: '',
      currentAddress: '',
      permanentAddress: '',
      status: 'ACTIVE',
      remarks: '',
      ...initialData,
    },
  });

  const currentAddressValue = watch('currentAddress');

  // Sync current address to permanent address if checkbox is checked
  useEffect(() => {
    if (sameAddress && currentAddressValue) {
      setValue('permanentAddress', currentAddressValue, { shouldValidate: true });
    }
  }, [sameAddress, currentAddressValue, setValue]);

  // If initialData is loaded, check if addresses are identical to toggle check
  useEffect(() => {
    if (initialData?.currentAddress && initialData?.permanentAddress) {
      if (initialData.currentAddress === initialData.permanentAddress) {
        setSameAddress(true);
      }
    }
  }, [initialData]);

  const handleSameAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSameAddress(checked);
    if (checked) {
      setValue('permanentAddress', currentAddressValue || '', { shouldValidate: true });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
      <Grid container spacing={3}>
        {/* Section: Personal Info */}
        <Grid item xs={12}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Full Name"
                    {...register('name')}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    placeholder="Enter full name"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Date of Birth"
                    type="date"
                    {...register('dateOfBirth')}
                    error={!!errors.dateOfBirth}
                    helperText={errors.dateOfBirth?.message}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Place of Birth"
                    {...register('placeOfBirth')}
                    error={!!errors.placeOfBirth}
                    helperText={errors.placeOfBirth?.message}
                    placeholder="City, State, Country"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.status}>
                    <InputLabel id="status-label" shrink>Status</InputLabel>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <Select
                          labelId="status-label"
                          label="Status"
                          notched
                          {...field}
                        >
                          <MenuItem value="ACTIVE">Active</MenuItem>
                          <MenuItem value="INACTIVE">Inactive</MenuItem>
                        </Select>
                      )}
                    />
                    <FormHelperText>{errors.status?.message}</FormHelperText>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Section: Contact Details */}
        <Grid item xs={12}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Contact Details
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    required
                    fullWidth
                    label="Email Address"
                    type="email"
                    {...register('email')}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    placeholder="email@example.com"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    required
                    fullWidth
                    label="Primary Mobile"
                    {...register('primaryMobile')}
                    error={!!errors.primaryMobile}
                    helperText={errors.primaryMobile?.message}
                    placeholder="10-digit number"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Secondary Mobile (Optional)"
                    {...register('secondaryMobile')}
                    error={!!errors.secondaryMobile}
                    helperText={errors.secondaryMobile?.message}
                    placeholder="10-digit number"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Section: National IDs */}
        <Grid item xs={12}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Identity Verification (Govt IDs)
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Aadhaar Number (UID)"
                    {...register('aadhaar')}
                    error={!!errors.aadhaar}
                    helperText={errors.aadhaar?.message}
                    placeholder="12 numeric digits"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="PAN Number"
                    {...register('pan')}
                    error={!!errors.pan}
                    helperText={errors.pan?.message}
                    placeholder="ABCDE1234F"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ style: { textTransform: 'uppercase' } }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Section: Address Details */}
        <Grid item xs={12}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Address Documentation
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    multiline
                    rows={3}
                    label="Current Address"
                    {...register('currentAddress')}
                    error={!!errors.currentAddress}
                    helperText={errors.currentAddress?.message}
                    placeholder="Enter full current residential address"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sx={{ py: '0 !important', my: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={sameAddress}
                        onChange={handleSameAddressChange}
                        color="primary"
                      />
                    }
                    label="Permanent Address is same as Current Address"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    multiline
                    rows={3}
                    label="Permanent Address"
                    {...register('permanentAddress')}
                    error={!!errors.permanentAddress}
                    helperText={errors.permanentAddress?.message}
                    placeholder="Enter full permanent address"
                    disabled={sameAddress}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Section: Remarks */}
        <Grid item xs={12}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Remarks & Audit Details
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Remarks"
                    {...register('remarks')}
                    error={!!errors.remarks}
                    helperText={errors.remarks?.message}
                    placeholder="Add operational remarks or notes (Optional)"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Actions */}
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1, mb: 4 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={onCancel}
            disabled={isLoading}
            sx={{ px: 4, py: 1.25, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading}
            sx={{ px: 5, py: 1.25, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            {isLoading ? 'Saving...' : submitButtonText}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};
