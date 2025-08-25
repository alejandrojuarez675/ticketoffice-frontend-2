'use client';
import { Button, CircularProgress } from '@mui/material';

export default function SubmitButton({
  loading,
  children,
  ...props
}: { loading?: boolean } & React.ComponentProps<typeof Button>) {
  return (
    <Button {...props} disabled={loading || props.disabled}>
      {loading ? <CircularProgress size={24} color="inherit" /> : children}
    </Button>
  );
}