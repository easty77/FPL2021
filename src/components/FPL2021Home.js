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
  SelectItem,
  Button
} from 'carbon-components-react';
import {getFixtureColumns} from '../Utils.js';


const FPL2021Home = ({predictionsData, fixtureData, getTeam, getOddsByFixture, currentWeek, handleReloadData}) => {

const aWeekColumns = [
  { "key": "id", "header": "ID"},
  { "key": "fixture", "header": "Fixture"},
  { "key": "result", "header": "Result"},
  { "key": "score", "header": "Score"},
  { "key": "odds", "header": "Odds"},
  { "key": "SE", "header": "SE"},
  { "key": "PE", "header": "PE"},
  { "key": "ME", "header": "ME"},
  { "key": "TE", "header": "TE"},
  { "key": "AP", "header": "AP"}
];

const [weekNumber, setWeekNumber] = useState(null);
const [weekData, setWeekData] = useState(null);

useEffect(() => {
  console.log('In Home initialise');
  setWeekNumber(currentWeek)
},[]);

useEffect(() => {
        if (predictionsData === null || weekNumber === null)
          return;
        console.log('Week changed:' + weekNumber);
        let aFiltered = [...fixtureData.filter(f => f.event === weekNumber)]; // shallow copy, is this sufficient?
        let aWeekPredictions = predictionsData.filter(p => p.event === weekNumber)
        let aPredictors = [...new Set(aWeekPredictions.map(item => item.predictor_id))]; 
        let totalRow = {"id":"Total", "result":{"H":0, "D":0, "A":0}, odds:{"F1":0, "F2":0, "F3":0}, "score":0}
        let nFinished = 0
        aFiltered.forEach(f => {
           if (f.team_h_name === undefined) {
            f.team_h_name = getTeam(f.team_h).name
          }
          if (f.team_a_name === undefined) {
            f.team_a_name = getTeam(f.team_a).name
          }
          f.fixture = {"team_h":f.team_h_name, "team_a":f.team_a_name}
          let aPredictions = aWeekPredictions.filter(p => p.fixture_id.toString() === f.id)  
          aPredictions.forEach(p => {
            f[p.predictor_id] = p
            let nIndexPrediction = (p.team_h_score >= p.team_a_score) ? ((p.team_h_score === p.team_a_score)  ? 1 : 0): 2
            if (totalRow[p.predictor_id] === undefined) {
              totalRow[p.predictor_id] = {"points": 0, "correct": 0, "H":0, "D":0, "A":0, "goals":0, "count":0}
            }
            totalRow[p.predictor_id].count += 1
            totalRow[p.predictor_id].goals += (p.team_h_score + p.team_a_score)
            totalRow[p.predictor_id][['H', 'D', 'A'][nIndexPrediction]] += 1
          })
          if (f.finished === true) {
            nFinished++
            let nIndexResult = (f.team_h_score >= f.team_a_score) ? ((f.team_h_score === f.team_a_score)  ? 1 : 0): 2
            f.score = {"h":f.team_h_score, "a":f.team_a_score}
            f.result = ['H', 'D', 'A'][nIndexResult]
            let odds = getOddsByFixture(f.id)
            f.odds = {"value": odds[['dsp_home','dsp_draw', 'dsp_away'][nIndexResult]], "rank": odds.rank[nIndexResult],
                "display": ("H: " + odds.dsp_home + "\nD: " + odds.dsp_draw + "\nA: " + odds.dsp_away)}
            totalRow.score += (f.score.h + f.score.a)
            totalRow.result[f.result] += 1
            totalRow.odds['F' + f.odds.rank] += 1    
            aPredictions.forEach(p => {
              totalRow[p.predictor_id].points += getPoints(p)
              totalRow[p.predictor_id].correct += (p.correct_score === 1) ? 1 : 0
            })
          }
        })
        aPredictors.forEach(pid => {
          if (totalRow[pid].count > 0) {
            totalRow[pid].goals = totalRow[pid].goals/totalRow[pid].count;  // convert total goals to average goals
          }
          totalRow[pid].display = totalRow[pid].H + "-" + totalRow[pid].D + "-" + totalRow[pid].A
          totalRow[pid].full_display =  totalRow[pid].display + (" (" + totalRow[pid].goals + ")" )
        })
        if (nFinished > 0) {
          totalRow.score = totalRow.score / nFinished;  // convert total goals to average goals
        }
        else{
          totalRow.score = undefined
          totalRow.result = undefined
          totalRow.odds = undefined
        }
        aFiltered.push(totalRow)
        setWeekData (aFiltered)
    },[weekNumber, predictionsData]);
    

  const handleWeekNumberChange = event => {
    setWeekNumber(parseInt(event.target.value, 10));
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
                { weekNumber !== null &&
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
                }
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
                  if (cell.value === undefined) {
                    return (<TableCell key={cell.id}></TableCell>);
                  }
                  else if (cell.info.header === 'fixture') {
                    return (
                       <TableCell key={cell.id}>
                         {cell.value.team_h + " v " + cell.value.team_a}
                       </TableCell>
                     );
                   }
                  else if (cell.info.header === 'score') {
                    if (row.id === 'Total') {
                      // total row
                      return (<TableCell key={cell.id}>{cell.value}</TableCell>);
                    }
                    else  {
                      return (
                          <TableCell key={cell.id}>
                            {cell.value.h + "-" + cell.value.a}
                          </TableCell>
                        );
                    }
                  }
                  else if (cell.info.header === 'result' && row.id === 'Total') {
                      // total row
                      return (<TableCell key={cell.id}><span>{cell.value.H}</span>-<span>{cell.value.D}</span>-<span>{cell.value.A}</span></TableCell>);
                  }
                  else if (cell.info.header === 'odds') {
                    if (row.id === 'Total') {
                      // total row
                      return (<TableCell key={cell.id}><span>{cell.value.F1}</span>-<span>{cell.value.F2}</span>-<span>{cell.value.F3}</span></TableCell>);
                    }
                    else  {
                      return (
                          <TableCell key={cell.id} className={`cell odds odds${cell.value.rank}`}>
                            <div title={cell.value.display}>{cell.value.value}</div>
                          </TableCell>
                        );
                      }
                  }
                  else if (cell.info.header !== 'id' && cell.info.header !== 'result') {
                    // predictions column
                    if (row.id === 'Total') {
                      // total row, either distribution (before results come in) or points
                      if (cell.value.points === 0) {
                        return (<TableCell key={cell.id}><span title={cell.value.goals}>{cell.value.display}</span></TableCell>);
                      }
                      else {
                        return (<TableCell key={cell.id}><span title={cell.value.full_display}>{cell.value.points}</span>(<span>{cell.value.correct}</span>)</TableCell>);
                      }
                    }
                    else if (cell.value.team_h_score !== undefined) {
                    return (
                        <TableCell key={cell.id} className={`points_${cell.value.total_score}`}>
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
    <Button kind="primary" onClick={handleReloadData}>Reload</Button>
    </>
  );
};
export default FPL2021Home;
