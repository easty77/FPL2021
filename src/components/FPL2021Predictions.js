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


const FPL2021Predictions = ({predictionsData, getProfit, predictors, getResultsAggregate}) => {

const [predictionsColumns, setPredictionsColumns] = useState(null);
const [aggregatedPredictionsData, setAggregatedPredictionsData] = useState(null);
const [scoreType, setScoreType] = useState("points");

useEffect(() => {
  let aColumns = [{ "key": "id", "header": "Event"}, { "key": "result", "header": "Results"}, { "key": "odds", "header": "Odds"}]
  predictors.forEach(p => {
    aColumns.push({ "key": p, "header": p})
  })
  setPredictionsColumns(aColumns)
},[]);

  useEffect(() => {
      setAggregatedPredictionsData(getPredictionsData())
	},[predictionsData]);

  const handleScoreTypeChange = event => {
    setScoreType(event.target.value);
  };


  const createScoreRow = (id) => {
    let empty = {"id":id}
    predictors.forEach(p => {
      empty[p] = {"correct":0, "points":0, "profit":{"value":0, "display":""}}
    }) 
    return empty;      
  } 
  const getPredictionsData = () => {
    let m1 = predictionsData.reduce((prev, next) =>{
      let event = next.event.toString()
      if (!(event in prev)) {
         prev[event] = createScoreRow(event)
      }
      // tested using predictor_id=XX, so that dmust not break
      // match must have taken place
      if (prev[event][next.predictor_id] !== undefined && next.correct_score !== undefined) {
        prev[event][next.predictor_id].correct += next.correct_score 
        prev[event][next.predictor_id].points += (3 * next.correct_score) + next.bonus_score
        let profit_value = -1; 
        if (next.correct_score == 1) {
          let profit = getProfit(next.fixture_id)
          profit_value = profit.value
          if (prev[event][next.predictor_id].profit.display != "") {
            prev[event][next.predictor_id].profit.display += ", "
          }
          prev[event][next.predictor_id].profit.display +=  profit.display 
        }
        prev[event][next.predictor_id].profit.value += profit_value
      }
       return prev;
    }, {});

    let aRows = Object.keys(m1).map(id => m1[id]);
    let aggData  = getResultsAggregate()
    aRows.forEach(r => {
      let aggObj = aggData[parseInt(r.id, 10)]
      if (aggObj !== undefined) {
        r.result = aggObj.result.H + "-" + aggObj.result.D + "-" + aggObj.result.A
        r.odds = aggObj.odds[1] + "-" + aggObj.odds[2] + "-" + aggObj.odds[3] 
      }
    })
    // need to deep copy else 1st element is updated!
    let m2 = JSON.parse(JSON.stringify(aRows)).reduce((prev, next) =>{
      for (const a in next) {
        if (a!=="id" && a!=="result" &&a!=="odds") {
          if (prev[a] === undefined) {
              prev[a] = next[a]
              prev[a].profit.display = (next[a].profit.value  > 0) ? "Y" : "-"
           }
          else {
            for (const b in next[a]) {
              if (b === 'profit') {
                prev[a][b].value += next[a][b].value
                prev[a][b].display += (next[a][b].value  > 0) ? "Y" : "-"
              }
              else if (next[a][b] !== undefined)
                prev[a][b] += next[a][b]
           }
          }
        }
      }
      return prev
    }, {});
    m2.id = "Total"
    aRows.push(m2) 
    return aRows;
}
  return (
    <>
        <div className="bx--grid">
            <div className="bx--row">
              <div className="bx--col-lg-12">
                <Select
                  id="score_type"
                  labelText="Type"
                  value={scoreType}
                  onChange={handleScoreTypeChange}>
                  <SelectItem value="points" text="Points" />
                  <SelectItem value="correct" text="#Correct" />
                  <SelectItem value="profit" text="Profit" />
                </Select>
              </div>
             </div>
          </div>
    { aggregatedPredictionsData !== null && 
    <DataTable rows={aggregatedPredictionsData} headers={predictionsColumns}>
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
                  if (cell.info.header != 'id' && cell.info.header != 'result' && cell.info.header != 'odds') {
                    return (
                      <TableCell key={cell.id}>
                        {scoreType === "profit" && cell.value.profit.value != undefined ? 
                        <div title={cell.value.profit.display}>{cell.value.profit.value.toFixed(2)}</div> 
                        : cell.value[scoreType] }
                      </TableCell>
                    );
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
export default FPL2021Predictions;
