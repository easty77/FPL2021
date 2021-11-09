import React, { useState, useEffect } from 'react';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Select,
  SelectItem
} from 'carbon-components-react';
import {getChampionshipColumns} from '../Utils.js';

const FPL2021Championship = ({teamStatsData}) => {


const [rows, setRows] = useState([]);
const [columns, setColumns] = useState([]);
const [numMatches, setNumMatches] = useState("0");
const [matchType, setMatchType] = useState("total");

useEffect(() => {
  console.log('In Championship constructor')
  
  // all columns are in the table but some are just not drawn so are invisible (not sure of overhead compared with removing altogether via headers)
  let aColumns = getChampionshipColumns()
  aColumns.unshift({"key": "position", "header":"#"})

  setColumns(aColumns)

},[]);

useEffect(() => {
    console.log('In useEffect number')
    
    let aFiltered = teamStatsData[numMatches]
    // check for undefined
    aFiltered.forEach(row => {
      for (let att in row) {
         if (row[att] === undefined) {
           console.log("Undefined: " + row.id + "-" + att)
         } 
      }
    })

    setRows(aFiltered)

	},[teamStatsData, numMatches]);

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
      });
  };
  const handleMatchTypeChange = event => {
    setMatchType(event.target.value);
  };
  const handleNumMatchesChange = event => {
    setNumMatches(event.target.value);
  };
  const customSortRow = (cellA, cellB, { sortDirection, sortStates, locale }) => {
    console.log('In customSortRow')
    if (cellA === undefined)
      console.log('Undefined cellA')
    if (sortDirection === sortStates.DESC) {
      return compare(cellB, cellA, locale);
    }
    return compare(cellA, cellB, locale);
  }
  const compare = (a, b, locale) => {
    if (a === undefined) {
      console.log('Undefined a: ' + b)
    }
    if (typeof a === "string") {
      return a.localeCompare(b, locale)
    }
    else {
      return a - b
    }
  }
  const isColumnVisible = (id) => {
    return id === "name" ||  id === "position" ||   (id.indexOf(matchType + "_") === 0)

  }

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
                  <SelectItem value="5" text="Five" />
                </Select>
              </div>
            </div>
          </div>
    { teamStatsData !== null && 
    <DataTable rows={rows} headers={columns} isSortable sortRow={customSortRow}>
      {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => (
        <Table {...getTableProps()} size="compact">
          <TableHead>
            <TableRow>
              {headers.map(header => {
                if (isColumnVisible(header.key)) {
                 return (<TableHeader key={header.key} {...getHeaderProps({ header })}>
                  {header.header}
                </TableHeader>)
                }
              } 
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row,index) => (
              <TableRow key={row.id} {...getRowProps({ row })}>
                {row.cells.map(cell => {
                  if (cell.info.header === 'position') {
                    return <TableCell key={cell.id}>{index+1}</TableCell>;
                  }
                  else if (isColumnVisible(cell.info.header)) {
                    return <TableCell key={cell.id}>{cell.value}</TableCell>;
                  }
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
