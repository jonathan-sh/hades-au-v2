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
import LinearProgress from '@mui/material/LinearProgress';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

import './style.css';
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
  faces: string;
  attributes: string;
  refreshSearch: boolean;
  setQuery: SetQuery;
}
export default function Result({ query, faces, attributes, refreshSearch, setQuery }: Search) {
  const initResult: HadesResult[] = [];
  const [results, setResult] = useState(initResult);
  const [inRequestProgress, setInRequestProgress] = useState(false);
  useEffect(() => {
    if (query === '') {
      setResult([]);
      setInRequestProgress(false);
    }
    if (query && query !== '') {
      setInRequestProgress(true);
      const config: AxiosRequestConfig = {
        method: 'post',
        url: 'https://api-usa.saas-solinftec.com/hades-api/logs',
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify({ query })
      };

      axios(config)
        .then((response: AxiosResponse) => {
          setResult(response.data);
          setInRequestProgress(false);
        })
    }
  }, [query, refreshSearch])

  return (
    <div className='result-content'>
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
                      .map((it: string) => (
                        <TableCell key={it} align='left' style={{ fontWeight: 'bold', color: 'rgb(1, 255, 112' }} > {it.toUpperCase()}</TableCell>
                      ))
                  }
                </TableRow>
              </TableHead>
              <TableBody>
                {results
                  .map((result: HadesResult) => (
                    <TableRow
                      key={result.mid}
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
                                <Tooltip title='find by tracker id'>
                                  <TableCell key={index} onClick={() => {
                                    setQuery(`tracker = ${value}`);
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