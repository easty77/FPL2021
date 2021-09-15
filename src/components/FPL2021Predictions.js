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


const FPL2021Predictions = ({predictionsData, savePredictions, oddsData, saveOdds, retrieveURL}) => {

  const aColumns = [
    { "key": "event", "header": "Event"},
    { "key": "fixture_id", "header": "Fixture"},
    { "key": "predictor_id", "header": "Predictor"},
    { "key": "team_h_score", "header": "H"},
    { "key": "team_a_score", "header": "A"},
    { "key": "reason", "header": "Reason"},
    { "key": "correct_score", "header": "Correct"},
    { "key": "bonus_score", "header": "Bonus"},
];
const aOddsColumns = [
    { "key": "fixture_id", "header": "Fixture"},
    { "key": "dsp_home", "header": "Predictor"},
    { "key": "dsp_away", "header": "H"},
    { "key": "dsp_draw", "header": "A"}
];

const [headers, setHeaders] = useState([]);
const [rows, setRows] = useState([]);
const [numMatches, setNumMatches] = useState("0");
const [matchType, setMatchType] = useState("total");

  useEffect(() => {
    console.log('In predictions initialise');
     // initialise
    if (predictionsData === null) {
    	loadPredictionsData();
    }
	},[]);

  const loadPredictionsData = () => {
    let urlRetrievePredictions = retrieveURL('predictions');
    let urlRetrieveOdds = retrieveURL('odds');
    Promise.all([
      fetch(urlRetrievePredictions).then(response => response.json()),
      fetch(urlRetrieveOdds).then(response => response.json())
    ]).then(jsonData => {
      let aPredictions = jsonData[0].rowdata;
      let aOdds =  jsonData[1].rowdata; 
      // unique id attribute (of type string) required for display in DataTable, so add
      aPredictions.forEach((item, i) => {
            item.id = (i + 1).toString();
          });
      aOdds.forEach((item, i) => {
            item.id = (i + 1).toString();
          });
      savePredictions(aPredictions);
      saveOdds(aOdds);
    });
  };

  return (
    <>
    { oddsData !== null && 
    <DataTable rows={oddsData} headers={aOddsColumns} isSortable keyField='fixture_id'>
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
              <TableRow key={row.id.toString()} {...getRowProps({ row })}>
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
export default FPL2021Predictions;
