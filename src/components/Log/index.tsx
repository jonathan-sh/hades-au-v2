import React, { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, TextField, Switch, IconButton } from '@mui/material';
import Share from '@mui/icons-material/FileUploadOutlined';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers';

import './style.css'
import Result from './Result';
import Toast from '../Toast';


interface OwnerInfo { owner: string; }

function App() {

  const [search, setSearch] = useState('');
  const [query] = useDebounce(search, 500);
  const [faces, setFaces] = useState('date time,owner,type,tracker,origin,message');
  const [attributes, setAttributes] = useState('utc_date_time_iso,owner,log_type,tracker,origin,message');
  const [owner, setOwner] = useState('');
  const [ownerList, setOwnerList] = useState<OwnerInfo[]>([]);
  const [aliceMode, setAliceMode] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [toast, setToast] = useState(false);

  useEffect(() => {
    const path = `${window.location.search}`;
    const params = new URLSearchParams(path);
    if (params.get('f')) setFaces(`${params.get('f')}`);
    if (params.get('q')) {
      const q = `${params.get('q')}`;
      setSearch(q.replace(/:-:/g, '='));
    }
    if (params.get('a')) setAttributes(`${params.get('a')}`);

    const getOwners: AxiosRequestConfig = {
      method: 'GET',
      url: 'https://api-usa.saas-solinftec.com/hades-api/owners'
    };

    axios(getOwners)
      .then((it: AxiosResponse): void => {
        setOwnerList(it.data);
        if (params.get('o')) {
          const o: string = `${params.get('o')}`.toLowerCase();
          if (it.data.some((it: OwnerInfo) => it.owner.toLowerCase() === o)) {
            setOwner(o);
          }
        }
      });

  }, []);

  return (
    <div>
      <div className='log-content'>
        <div className='owner'>
          <FormControl fullWidth>
            <InputLabel id='owner-select-label'>owner</InputLabel>
            <Select
              labelId="owner-select-label"
              id='owner-select'
              value={owner}
              label='owner'
              onChange={({ target }: SelectChangeEvent) => {
                const ownerValue = target.value;
                setOwner(target.value);
                if (search.includes('=')) {
                  setSearch(`${search} AND owner = ${ownerValue}`)
                } else if (search.length === 0) {
                  setSearch(`${search}owner = ${ownerValue}`)
                }
              }}
            >
              {
                ownerList.map((it: OwnerInfo) => {
                  return <MenuItem
                    key={it.owner}
                    value={it.owner}>{it.owner}</MenuItem>
                })
              }
              <MenuItem value={1}>1</MenuItem>
            </Select>
          </FormControl>
        </div>
        <div className='search-input'>
          <TextField
            autoFocus={true}
            placeholder='what are you looking for?'
            label='query'
            value={search}
            fullWidth={true}
            onChange={({ target }) => {
              setSearch(target.value);
              if (search.length === 1 && owner) {
                setSearch(`owner = ${owner}`)
              }
            }} />
        </div>

        <div className='share'>
          <IconButton
            color='primary'
            aria-label='share'
            onClick={() => {
              const base = window.location.href.split('?')[0];
              let url = `${base}?q=${search.replace(/=/g, ':-:')}`
              if (owner && owner !== '') {
                url = `${url}&o=${owner}`;
              }
              navigator.clipboard.writeText(url);
              setToast(true);
            }}>
            <Share />
          </IconButton>
        </div>

        <div className='date-time'>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <DatePicker
              label="start"
              value={startDate}
              onChange={(it) => {
                setStartDate(new Date((it as any)['_d']));
                alert('🚧 Not works yet. 🚧\nPlease check the issue number 4');
              }}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
        </div>

        <div className='deep-mode'>
          <Switch
            checked={aliceMode}
            onChange={() => {
              setAliceMode(!aliceMode);
              alert('🚧 Not works yet. 🚧\nPlease check the issue number 5');
            }}
            inputProps={{ 'aria-label': 'controlled' }} />
          <span>deep mode</span>
        </div>
      </div>
      <Toast open={toast} text='link copied!' onCloseFunc={(): void => { setToast(false) }} />
      <Result query={query} faces={faces} attributes={attributes} setQuery={(value: string): void => setSearch(value)} />
    </div>

  );
}

export default App;
