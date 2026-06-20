import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from '../components/ConfirmDialog';

describe('ConfirmDialog Component', () => {
  it('should not render anything when open is false', () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    render(
      <ConfirmDialog
        open={false}
        title="Test Title"
        message="Test Message"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    const dialogTitle = screen.queryByText('Test Title');
    expect(dialogTitle).toBeNull();
  });

  it('should render title, message, and trigger callbacks on action clicks', () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    render(
      <ConfirmDialog
        open={true}
        title="Test Title"
        message="Test Message"
        confirmText="Yes, Do it"
        cancelText="No, Keep it"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    // Verify content matches props
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Message')).toBeInTheDocument();
    expect(screen.getByText('Yes, Do it')).toBeInTheDocument();
    expect(screen.getByText('No, Keep it')).toBeInTheDocument();

    // Click confirm button
    const confirmBtn = screen.getByText('Yes, Do it');
    fireEvent.click(confirmBtn);
    expect(handleConfirm).toHaveBeenCalledTimes(1);

    // Click cancel button
    const cancelBtn = screen.getByText('No, Keep it');
    fireEvent.click(cancelBtn);
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });
});
