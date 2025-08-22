'use client';

import { useState } from 'react';
import {
  TextField,
  IconButton,
  InputAdornment,
  Tooltip,
  Fade,
} from '@mui/material';
import { Visibility, VisibilityOff, KeyboardCapslock } from '@mui/icons-material';

type Props = React.ComponentProps<typeof TextField> & {
  onCapsChange?: (caps: boolean) => void;
};

export default function PasswordField({ onCapsChange, slotProps, onKeyUp, ...props }: Props) {
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);

  const handleKeyUp: React.ComponentProps<typeof TextField>['onKeyUp'] = (e) => {
    const isCaps = (e.getModifierState && e.getModifierState('CapsLock')) || false;
    setCaps(isCaps);
    onCapsChange?.(isCaps);
    onKeyUp?.(e);
  };

  const adornment = (
    <InputAdornment position="end" sx={{ gap: 0.5 }}>
      <Tooltip
        title={caps ? 'Bloq Mayús activado' : ''}
        open={caps}
        slots={{ transition: Fade }}
        slotProps={{ transition: { timeout: 200 } }}
      >
        <span>{caps ? <KeyboardCapslock color="warning" fontSize="small" /> : null}</span>
      </Tooltip>
      <IconButton
        aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        onClick={() => setShow((s) => !s)}
        edge="end"
        size="small"
      >
        {show ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </InputAdornment>
  );

  const mergedSlotProps: typeof slotProps = {
    ...(slotProps || {}),
    input: {
      ...(slotProps?.input || {}),
      endAdornment: adornment,
    },
  };

  return (
    <TextField
      {...props}
      type={show ? 'text' : 'password'}
      slotProps={mergedSlotProps}
      onKeyUp={handleKeyUp}
    />
  );
}