import React from 'react';
import { TextField, Button } from '@mui/material';
import './style.css';

function App() {
  return (
    <div className='content'>
      <TextField
        fullWidth={true}
        autoFocus={true}
        placeholder='email'
        label='email' />
      <br />
      <TextField
        fullWidth={true}
        placeholder='password'
        label='password'
        type='password' />
      <br />
      <Button fullWidth={true} variant='contained'>login</Button>
    </div>
  );
}

export default App;
