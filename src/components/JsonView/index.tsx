import React from 'react';
import JsonFormatter from 'react-json-formatter';
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button';

import './style.css';
import Toast from '../Toast/index';

const jsonStyle = {
  propertyStyle: { color: '#01ff70' },
  numberStyle: { color: 'darkorange' },
  arrayStyle: { color: 'darkblue' }
};

const JsonView = (source: any) => {
  const [open, setOpen] = React.useState(false);
  const [toast, tostIt] = React.useState(false);
  const data: string = JSON.stringify({ ...source['source'] });
  return (
    <div className='content'>
      <Button onClick={() => setOpen(true)} variant='outlined' >full-document</Button>

      <Dialog scroll='body' fullWidth={true} maxWidth="lg" onClose={() => setOpen(false)} open={open}>
        <Button 
        fullWidth={true} 
        variant='outlined' 
        onClick={() => {
          navigator.clipboard.writeText(data);
          tostIt(true);
          setOpen(false);
        }}>copy</Button>
        <JsonFormatter json={data} tabWith={1} jsonStyle={jsonStyle} />

      </Dialog>

      <Toast open={toast} text={'full document copied'} onCloseFunc={() => tostIt(false)}  ></Toast>
    </div >
  );
};

export default JsonView;