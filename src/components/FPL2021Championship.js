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
import {
  convertGoing,
  convertOrdinal,
  formatWikipediaImage,
} from '../Utils.js';

const FPL2021Championship = ({teamStatsData, saveTeamStats, retrieveURL}) => {

  const aColumns = [
    { "key": "name", "header": "Name", "type": "TEXT"},
    { "key": "total_matches", "header": "#Matches", "type": "INT"},
    { "key": "total_points", "header": "#Pts", "type": "INT"},
    { "key": "total_xpts", "header": "#xPts", "type": "DECIMAL"},
    { "key": "total_goals", "header": "#F", "type": "INT"},
    { "key": "total_goals_conceded", "header": "#A", "type": "INT"},
    { "key": "total_xg", "header": "#xF", "type": "DECIMAL"},
    { "key": "total_vxg", "header": "#xA", "type": "DECIMAL"},
    { "key": "total_shots", "header": "#Shots", "type": "INT"},
    { "key": "total_target", "header": "#On Target", "type": "INT"},
    { "key": "total_deep", "header": "#Deep", "type": "INT"},
    { "key": "total_ppda", "header": "#PPDA", "type": "DECIMAL"},
    { "key": "total_vshots", "header": "#Opponent Shots", "type": "INT"},
    { "key": "total_vtarget", "header": "#Opponent On Target", "type": "INT"},
    { "key": "total_vdeep", "header": "#Opponent Deep", "type": "INT"},
    { "key": "total_vppda", "header": "#Opponent PPDA", "type": "DECIMAL"},
    { "key": "total_possession", "header": "Possession", "type": "DECIMAL"},
    { "key": "h_matches", "header": "#Matches", "type": "INT"},
    { "key": "h_points", "header": "#Pts", "type": "INT"},
    { "key": "h_xpts", "header": "#xPts", "type": "DECIMAL"},
    { "key": "h_goals", "header": "#F", "type": "INT"},
    { "key": "h_goals_conceded", "header": "#A", "type": "INT"},
    { "key": "h_xg", "header": "#xF", "type": "DECIMAL"},
    { "key": "h_vxg", "header": "#xA", "type": "DECIMAL"},
    { "key": "h_shots", "header": "#Shots", "type": "INT"},
    { "key": "h_target", "header": "#On Target", "type": "INT"},
    { "key": "h_deep", "header": "#Deep", "type": "INT"},
    { "key": "h_ppda", "header": "#PPDA", "type": "DECIMAL"},
    { "key": "h_vshots", "header": "#Opponent Shots", "type": "INT"},
    { "key": "h_vtarget", "header": "#Opponent On Target", "type": "INT"},
    { "key": "h_vdeep", "header": "#Opponent Deep", "type": "INT"},
    { "key": "h_vppda", "header": "#Opponent PPDA", "type": "DECIMAL"},
    { "key": "h_possession", "header": "Possession", "type": "DECIMAL"},
    { "key": "a_matches", "header": "#Matches", "type": "INT"},
    { "key": "a_points", "header": "#Pts", "type": "INT"},
    { "key": "a_xpts", "header": "#xG Pts", "type": "DECIMAL"},
    { "key": "a_goals", "header": "#F", "type": "INT"},
    { "key": "a_goals_conceded", "header": "#A", "type": "INT"},
    { "key": "a_xg", "header": "#xF", "type": "DECIMAL"},
    { "key": "a_vxg", "header": "#xA", "type": "DECIMAL"},
    { "key": "a_shots", "header": "#Shots", "type": "INT"},
    { "key": "a_target", "header": "#On Target", "type": "INT"},
    { "key": "a_deep", "header": "#Deep", "type": "INT"},
    { "key": "a_ppda", "header": "#PPDA", "type": "DECIMAL"},
    { "key": "a_vshots", "header": "#Opponent Shots", "type": "INT"},
    { "key": "a_vtarget", "header": "#Opponent On Target", "type": "INT"},
    { "key": "a_vdeep", "header": "#Opponent Deep", "type": "INT"},
    { "key": "a_vppda", "header": "#Opponent PPDA", "type": "DECIMAL"},
    { "key": "a_possession", "header": "Possession", "type": "DECIMAL"}
];

const [headers, setHeaders] = useState([]);
const [rows, setRows] = useState([]);
const [numMatches, setNumMatches] = useState("0");
const [matchType, setMatchType] = useState("total");

  useEffect(() => {
    console.log('In initialise');
    console.log(teamStatsData);
    // initialise
    if (teamStatsData === null) {
    	loadTeamStatsData();
    }
	},[]);

  useEffect(() => {
    console.log('In change: ' + numMatches + "-" + matchType);
    if (teamStatsData !== null) {
      setRows(teamStatsData[numMatches])
      setHeaders(filterColumns())
    }
	},[numMatches,matchType]);

  const loadTeamStatsData = () => {
    let retrieveURLs = retrieveURL('team_stats');
  	let aURLs=[]
  	for (var u in retrieveURLs)
  	{
  		aURLs.push(fetch(retrieveURLs[u]).then(response => response.json()));
  	}
    Promise.all(aURLs).then(jsonData => {
    	let teamStatsData = {};
    	let nIndex = 0;
	  	for (var u in retrieveURLs)
	  	{
      	let aTeamStats= jsonData[nIndex++].data;
        // id for dataTable row must be a string
        aTeamStats.forEach(item => {
          item.id = item.id.toString();
        });
        teamStatsData[u] = aTeamStats
    }
      saveTeamStats(teamStatsData);
      setRows(teamStatsData[numMatches])
      setHeaders(filterColumns())
    });
  };
  const filterColumns = () => {
    let aFilterColumns = []
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
              <TableHeader />
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
