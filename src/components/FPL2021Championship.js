import React, { useState, useEffect } from 'react';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableExpandRow,
  TableExpandedRow,
  TableExpandHeader,
  TableHeader,
  TableBody,
  TableCell,
  Select,
  SelectItem
} from 'carbon-components-react';
import {getChampionshipColumns} from '../Utils.js';

const FPL2021Championship = ({teamStatsData}) => {


const [headers, setHeaders] = useState([]);
const [rows, setRows] = useState([]);
const [numMatches, setNumMatches] = useState("0");
const [matchType, setMatchType] = useState("total");

  useEffect(() => {
    setRows(teamStatsData[numMatches])
    setHeaders(filterColumns())
	},[teamStatsData, numMatches,matchType]);

  const loadTeamStatsData = () => {
    let retrieveURLs = retrieveURL('team_stats');
  	let aURLs=[]
  	for (var u in retrieveURLs)
  	{
  		aURLs.push(fetch(retrieveURLs[u]).then(response => response.json()));
  	}
    Promise.all(aURLs).then(jsonData => {
    	let tSD = {};
    	let nIndex = 0;
	  	for (var u in retrieveURLs) {
      	let aTeamStats= jsonData[nIndex++].data;
        // id for dataTable row must be a string
        aTeamStats.forEach(item => {
          item.id = item.id.toString();
        });
        tSD[u] = aTeamStats
      }
      saveTeamStats(tSD);
      setRows(tSD[numMatches])
      setHeaders(filterColumns())
    });
  };
  const filterColumns = () => {
    let aFilterColumns = []
    let aColumns = getChampionshipColumns()
    aColumns.forEach(column => {
      if (column.key === "name" ||  column.key.indexOf(matchType + "_") === 0)
        aFilterColumns.push(column)
    })
    return aFilterColumns
  }
  const handleMatchTypeChange = event => {
    setMatchType(event.target.value);
  };
  const handleNumMatchesChange = event => {
    setNumMatches(event.target.value);
  };

  return (
    <>
        <div className="bx--grid">
            <div className="bx--row">
              <div className="bx--col-lg-6">
                <Select
                  id="match_type"
                  labelText="Type"
                  value={matchType}
                  onChange={handleMatchTypeChange}>
                  <SelectItem value="total" text="All" />
                  <SelectItem value="h" text="Home" />
                  <SelectItem value="a" text="Away" />
                </Select>
              </div>
              <div className="bx--col-lg-6">
                <Select
                  id="num_matches"
                  value={numMatches}
                  labelText="#Matches"
                  onChange={handleNumMatchesChange}>
                  <SelectItem value="0" text="All" />
                  <SelectItem value="3" text="Three" />
                </Select>
              </div>
            </div>
          </div>
    { teamStatsData !== null && 
    <DataTable rows={rows} headers={headers} isSortable>
      {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => (
        <Table {...getTableProps()} size="compact">
          <TableHead>
            <TableRow>
              {headers.map(header => (
                <TableHeader key={header.key} {...getHeaderProps({ header })}>
                  {header.header}
                </TableHeader>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(row => (
              <TableRow key={row.id} {...getRowProps({ row })}>
                {row.cells.map(cell => {
                    return <TableCell key={cell.id}>{cell.value}</TableCell>;
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </DataTable>
}
    </>
  );
};
export default FPL2021Championship;
