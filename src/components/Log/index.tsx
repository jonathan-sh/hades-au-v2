import React, { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { TextField, Switch, IconButton, Tooltip, AlertColor, Button } from '@mui/material';
import Share from '@mui/icons-material/FileUploadOutlined';
import Search from '@mui/icons-material/SearchOutlined';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers';

import './style.css'
import Result from './Result';
import Toast from '../Toast';

function App() {

  const [search, setSearch] = useState('');
  const [query] = useDebounce(search, 500);
  const [faces, setFaces] = useState('date time,owner,type,tracker,origin,message');
  const [attributes, setAttributes] = useState('utc_date_time_iso,owner,log_type,tracker,origin,message');
  const [deepMode, setDeepMode] = useState(false);
  const [sort, setSort] = useState('desc');
  const [startDate, setStartDate] = useState(new Date());
  const [toast, setToast] = useState(false);
  const [toastText, setToastText] = useState('');
  const [toastType, setToastType] = useState<AlertColor>('success');
  const [refreshSearch, setRefreshSearch] = useState(false);

  const fillFilters = (filter: string): void => {
    const params = new URLSearchParams(filter);
    if (params.get('f')) setFaces(`${params.get('f')}`);
    if (params.get('q')) {
      const q = `${params.get('q')}`;
      setSearch(q.replace(/:-:/g, ' = '));
    }
    if (params.get('a')) setAttributes(`${params.get('a')}`);
    if (params.get('m')) {
      const isDeepMode = params.get('m')?.toLocaleLowerCase() === 'd';
      setDeepMode(isDeepMode);
    }
  }

  useEffect(() => {
    const searchUrlString = `${window.location.search}`;
    const urlParams = new URLSearchParams(searchUrlString);
    const hashFilter = urlParams.get('hf');

    if (hashFilter) {
      const getFilter: AxiosRequestConfig = {
        method: 'get',
        url: `https://api-usa.saas-solinftec.com/hades-api/filter/${hashFilter}`,
        headers: { 'Content-Type': 'application/json' }
      };
      axios(getFilter)
        .then((it: AxiosResponse): void => {
          fillFilters(it.data);
        })
    }
    else {
      fillFilters(searchUrlString);
    }
  }, []);

  return (
    <div>
      <div className='log-content'>

        <div className='search-input'>
          <TextField
            autoFocus={true}
            placeholder='what are you looking for?'
            label={deepMode ? 'write a json filter' : 'you can use literal string or operators like [ "OR", "AND", "<", ">"]'}
            value={search}
            fullWidth={true}
            multiline={deepMode}
            onChange={({ target }) => {
              setSearch(target.value);
            }} />
        </div>

        <Tooltip title='refresh result'>
          <div className='share'>
            <IconButton
              color='primary'
              aria-label='share'
              onClick={() => {
                if (query !== '') {
                  setRefreshSearch(!refreshSearch);
                }
                else {
                  setToastType('error');
                  setToastText('empty query');
                  setToast(true);
                }
              }}>
              <Search />
            </IconButton>
          </div>
        </Tooltip>

        <Tooltip title='share results'>
          <div className='share'>
            <IconButton
              color='primary'
              aria-label='share'
              onClick={() => {

                if (search.length === 0) {
                  setToastType('error');
                  setToastText('empty query');
                  setToast(true);

                  return;
                }

                let filter = search.replace(/ = /g, ':-:').replace(/ /g, '%20');
                if (deepMode) {
                  filter = `${filter}&m=d`;
                }
                const base = window.location.href.split('?')[0];
                const setFilter: AxiosRequestConfig = {
                  method: 'post',
                  url: 'https://api-usa.saas-solinftec.com/hades-api/filter',
                  headers: { 'Content-Type': 'application/json' },
                  data: JSON.stringify({ filter: `?q=${filter}` })
                };

                axios(setFilter)
                  .then((it: AxiosResponse): void => {
                    const url = `${base}?hf=${it.data}`;
                    navigator.clipboard.writeText(url);
                    setToastType('success');
                    setToastText('link copied!');
                    setToast(true);
                  })
                  .catch((e: any): void => {
                    const url = `${base}?q=${filter}`;
                    navigator.clipboard.writeText(url);
                    console.log(e);
                  });
              }}>
              <Share />
            </IconButton>
          </div>
        </Tooltip>
        <div className='sort'>
          <div className='asc'>
            <Button
              fullWidth={true}
              variant={sort === 'asc' ? 'contained' : 'outlined'}
              onClick={() => { setSort('asc') }}>ASC</Button>
          </div>
          <div className='desc'>
            <Button
              fullWidth={true}
              variant={sort === 'desc' ? 'contained' : 'outlined'}
              onClick={() => { setSort('desc') }}>DESC</Button>
          </div>
        </div>
        <div className='date-time hide'>
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
        <Tooltip title='to search into mongoDB'>
          <div className='deep-mode'>

            <Switch
              checked={deepMode}
              onChange={() => {
                setDeepMode(!deepMode);
              }}
              inputProps={{ 'aria-label': 'controlled' }} />
            <span>deep mode</span>
          </div>
        </Tooltip>
      </div>
      <Toast open={toast} text={toastText} type={toastType} onCloseFunc={(): void => { setToast(false) }} />
      <Result
        query={query}
        sort={sort}
        deepMode={deepMode}
        faces={faces}
        attributes={attributes}
        refreshSearch={refreshSearch}
        setQuery={(value: string): void => setSearch(value)}
      />
    </div>

  );
}

export default App;
