import React, { useState, useEffect } from 'react';
import {
    DataTable,
    Table,
    TableHead,
    TableRow,
    TableHeader,
    TableBody,
    TableCell,
} from 'carbon-components-react';
import {getChampionshipColumns} from '../Utils.js';  
const FPL2021Compare = ({comparisonData, numMatches, matchType}) => {

    const [rows, setRows] = useState([]);

    useEffect(()=> {
        let aRows=[]
        aRows.push(comparisonData.home[numMatches])
        aRows.push(comparisonData.away[numMatches])
        setRows(aRows)
      },[numMatches]);

      const isColumnVisible = (id) => {
        return (id.indexOf(matchType + "_") === 0 && id.indexOf("_matches") < 0)
    
      }
      return (
        <DataTable rows={rows} headers={getChampionshipColumns()}>
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
            {rows.map(row => (
              <TableRow key={row.id} {...getRowProps({ row })}>
                {row.cells.map(cell => {
                  if (isColumnVisible(cell.info.header)) {
                    return <TableCell key={cell.id}>{cell.value}</TableCell>;
                  }
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </DataTable>
    )
};
export default FPL2021Compare;