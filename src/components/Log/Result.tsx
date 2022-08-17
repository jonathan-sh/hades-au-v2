import React, { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { AlertColor } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

import './style.css';
import Toast from '../Toast';
export interface HadesResult {
  [key: string]: string
}

interface ReturnTreatedElement {
  (): any
}

interface SetQuery {
  (value: string): void
}
interface SourceTreatment {
  [key: string]: ReturnTreatedElement
}

interface Search {
  query: string;
  sort: string;
  faces: string;
  attributes: string;
  deepMode: boolean;
  refreshSearch: boolean;
  setQuery: SetQuery;
}
export default function Result({ query, faces, attributes, sort, refreshSearch, setQuery, deepMode }: Search) {
  const initResult: HadesResult[] = [];
  const [results, setResult] = useState(initResult);
  const [inRequestProgress, setInRequestProgress] = useState(false);
  const [toast, setToast] = useState(false);
  const [toastText, setToastText] = useState('');
  const [toastType, setToastType] = useState<AlertColor>('success');
  useEffect(() => {
    if (!query || query === '') {
      setResult([]);
      setInRequestProgress(false);
    }
    if (query && query !== '') {
      setInRequestProgress(true);
      const mileUrl: string = 'https://api-usa.saas-solinftec.com/hades-api/logs';
      const mongoUrl: string = 'https://api-usa.saas-solinftec.com/hades-api/db';

      const config: AxiosRequestConfig = {
        method: 'post',
        url: deepMode ? mongoUrl : mileUrl,
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify({ query, sort })
      };

      axios(config)
        .then((response: AxiosResponse) => {
          setResult(response.data);
          setInRequestProgress(false);
        })
        .catch((e: Error): void => {
          setResult([]);
          setToastType('error');
          setToastText(e.message);
          setToast(true);

          if (e.message.includes('400')) {
            setTimeout(() => {
              setToastType('error');
              setToastText('check the schema');
              setToast(true);
            }, 1000);
          }

          setInRequestProgress(false);
        });
    }
  }, [query, refreshSearch, deepMode, sort])

  return (
    <div className='result-content'>
      <Toast open={toast} text={toastText} type={toastType} onCloseFunc={(): void => { setToast(false) }} />
      <br />
      <Box sx={{ width: '100%' }} className={inRequestProgress ? '' : 'hide'}>
        <LinearProgress />
      </Box>
      <br />
      {
        results.length === 0 ?
          <span className={inRequestProgress ? 'hide' : ''}>zero results</span>
          :
          <TableContainer className={inRequestProgress ? 'hide' : ''} component={Paper}>
            <Table sx={{ minWidth: 650 }} size='small' aria-label='a dense table' style={{ backgroundColor: '#1c2833' }}>
              <TableHead>
                <TableRow>
                  {
                    faces.split(',')
                      .map((it: string, index: number) => (
                        <TableCell
                          key={index}
                          align='left'
                          style={{ fontWeight: 'bold', color: 'rgb(1, 255, 112' }}> {it.toUpperCase()}
                        </TableCell>
                      ))
                  }
                </TableRow>
              </TableHead>
              <TableBody>
                {results
                  .map((result: HadesResult, index: number) => (
                    <TableRow
                      key={index}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      {
                        attributes.split(',')
                          .map((attribute: string, index: number) => {

                            const value = (result[attribute] || '-');

                            const isError = result['log_type'] === 'ERROR' ? { color: '#f03774' } : {};

                            const source: SourceTreatment = {
                              utc_date_time_iso: () => (
                                <TableCell key={index} align='left'
                                  style={{ ...isError, width: '150px' }}>{value.split('.')[0]}</TableCell>
                              ),
                              tracker: () => (
                                <Tooltip key={index} title='find by tracker id'>
                                  <TableCell key={index} onClick={() => {
                                    if (deepMode) {
                                      setQuery(`{"tracker": "${value}"}`);
                                    }
                                    else {
                                      setQuery(`tracker = ${value}`);
                                    }
                                  }} align='left' style={{ ...isError, width: '280px', cursor: 'pointer' }}>{value}</TableCell>
                                </Tooltip>
                              )
                            };

                            const specificTreatment: ReturnTreatedElement = source[attribute];

                            if (specificTreatment) return specificTreatment();

                            return (<TableCell key={index} style={isError} align='left' > {value.toLowerCase()} </TableCell>)
                          })
                      }
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
      }
    </div>
  )
};