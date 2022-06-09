import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertColor, AlertProps } from '@mui/material/Alert';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref,
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

interface OnClose {
  (): void
}

interface Toast {
  text: string;
  open: boolean;
  onCloseFunc: OnClose;
  time?: number;
  type?: AlertColor;
}

const ToastElement = ({ open, text, onCloseFunc, type = 'success', time = 2 }: Toast): React.ReactElement => {

  return (
    <Snackbar
      open={open}
      autoHideDuration={time * 1000}
      onClose={onCloseFunc}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <Alert onClose={onCloseFunc}
        severity={type}
        sx={{ width: '100%' }}>
        {text}
      </Alert>
    </Snackbar >
  );
}

export default ToastElement;