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
import {getFixtureColumns} from '../Utils.js';


const FPL2021Home = ({predictionsData, fixtureData, getTeam, getOddsByFixture, currentWeek}) => {

const aWeekColumns = [
  { "key": "id", "header": "Fixture"},
  { "key": "team_h", "header": "H"},
  { "key": "team_a", "header": "A"},
  { "key": "score", "header": "Score"},
  { "key": "odds", "header": "Odds"},
  { "key": "SE", "header": "SE"},
  { "key": "PE", "header": "PE"},
  { "key": "ME", "header": "ME"},
  { "key": "TE", "header": "TE"},
  { "key": "AP", "header": "AP"}
];

const [weekNumber, setWeekNumber] = useState(1);
const [weekData, setWeekData] = useState(null);

useEffect(() => {
  console.log('In Home initialise');
  setWeekNumber(currentWeek)
},[]);

useEffect(() => {
        console.log('Week changed:' + weekNumber);
        if (predictionsData === null)
          return;
        let aFiltered = JSON.parse(JSON.stringify(fixtureData.filter(f => f.event === weekNumber))); // deep copy
        let aWeekPredictions = predictionsData.filter(p => p.event === weekNumber)
        let totalRow = {"id":"Total"}
        aFiltered.forEach(f => {
          let h = getTeam(f.team_h)
          if (h !== undefined) {
            f.team_h = h.name
          }
          else {
            console.log('GetTeam home failed: ' + f.team_h)
          }
          let a = getTeam(f.team_a)
          if (a !== undefined) {
            f.team_a = a.name
          }
          else {
            console.log('GetTeam away failed: ' + f.team_h)
          }
          if (f.team_h_score !== null) {
            let result = (f.team_h_score >= f.team_a_score) ? ((f.team_h_score === f.team_a_score)  ? 'D' : 'H'): 'A'
            f.score = {"h":f.team_h_score, "a":f.team_a_score, "result": result}
            let aPredictions = aWeekPredictions.filter(p => p.fixture_id.toString() === f.id)  
            aPredictions.forEach(p => {
              f[p.predictor_id] = p
              if (totalRow[p.predictor_id] === undefined) {
                totalRow[p.predictor_id] = {"points": getPoints(p), "correct": ((p.correct_score === 1) ? 1 : 0)}
              }
              else {
                totalRow[p.predictor_id].points += getPoints(p)
                totalRow[p.predictor_id].correct += (p.correct_score === 1) ? 1 : 0
              }
            })
            let odds = getOddsByFixture(f.id)
            let odds_att = (f.team_h_score >= f.team_a_score) ? ((f.team_h_score === f.team_a_score)  ? 'dsp_draw' : 'dsp_home'): 'dsp_away'
            f.odds = odds[odds_att]
          }
         })
         aFiltered.push(totalRow)
        setWeekData (aFiltered)
    },[weekNumber, predictionsData]);
    

  const handleWeekNumberChange = event => {
    setWeekNumber(parseInt(event.target.value, 10));
  };
  const getPointsClassName = prediction => {
    return "points_" + ((prediction.correct_score * 3) + prediction.bonus_score);
  };
  const getPoints = prediction => {
    return  (prediction.correct_score * 3) + prediction.bonus_score;
  };

  const loadPredictionsData = () => {
    let urlRetrievePredictions = retrieveURL('predictions');
      fetch(urlRetrievePredictions).then(response => response.json())
    .then(jsonData => {
      let aPredictions = jsonData.rowdata;

      aPredictions.forEach((item, i) => {
        item.id = (i + 1).toString();
      });
    
      savePredictions(aPredictions);
    });
  };

  return (
    <>
        <div className="bx--grid">
            <div className="bx--row">
              <div className="bx--col-lg-12">
                <Select
                  id="week_number"
                  labelText="Week"
                  value={weekNumber}
                  onChange={handleWeekNumberChange}>
                  <SelectItem value="1" text="1" />
                  <SelectItem value="2" text="2" />
                  <SelectItem value="3" text="3" />
                  <SelectItem value="4" text="4" />
                  <SelectItem value="5" text="5" />
                  <SelectItem value="6" text="6" />
                  <SelectItem value="7" text="7" />
                  <SelectItem value="8" text="8" />
                  <SelectItem value="9" text="9" />
                  <SelectItem value="10" text="10" />
                </Select>
              </div>
             </div>
          </div>
    { weekData !== null && 
    <DataTable rows={weekData} headers={aWeekColumns}>
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
              <TableRow key={row.id.toString()} {...getRowProps({ row })}>
                {row.cells.map(cell => {
                  if (cell.info.header === 'score') {
                    if (cell.value === undefined) {
                      return (<TableCell key={cell.id}></TableCell>);
                    }
                    else  {
                  return (
                      <TableCell key={cell.id} className={`result_${cell.value.result}`}>
                        {cell.value.h + "-" + cell.value.a}
                      </TableCell>
                    );
                  }
                  }
                  else if (cell.info.header !== 'id' && cell.info.header !== 'team_h' && cell.info.header !== 'team_a' && cell.info.header !== 'odds') {
                    if (cell.value === undefined) {
                      return (<TableCell key={cell.id}></TableCell>);
                    }
                    else if (row.id === 'Total') {
                      // total row
                      return (<TableCell key={cell.id}><span>{cell.value.points}</span>(<span>{cell.value.correct}</span>)</TableCell>);
                    }
                    else if (cell.value.team_h_score !== undefined) {
                    return (
                        <TableCell key={cell.id} className={getPointsClassName(cell.value)}>
                        {cell.value.team_h_score + "-" + cell.value.team_a_score}
                      </TableCell>
                      )
                    }
                  }
                  else
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
export default FPL2021Home;
