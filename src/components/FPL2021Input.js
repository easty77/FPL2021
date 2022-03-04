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
  MultiSelect,
  SelectItem,
  TextInput,
  NumberInput,
  Button
} from 'carbon-components-react';
import {formatDOW, formatTime, displayFixture} from '../Utils.js';
import { FeatureFlagScope } from 'carbon-components-react/lib/components/FeatureFlags';
import FPL2021Compare from './FPL2021Compare'

// page only available for the designated current week
const FPL2021Input = ({inputWeekData, predictionsData, savePredictionData, submitPredictions, getFixture, numCols}) => {

const aInputColumns = [
        { "key": "id", "header": "ID", "mandatory":false, "preselected":false},
        { "key": "date", "header": "Date", "mandatory":true},
        { "key": "teams", "header": "Fixture", "mandatory":true},
        { "key": "att_def", "header": "Attack v Defence", "mandatory":false, "preselected":false},
        { "key": "deep", "header": "Deep", "mandatory":false, "preselected":false},
        { "key": "goals", "header": "Goals", "mandatory":false, "preselected":true},
        { "key": "points", "header": "Points", "mandatory":false, "preselected":true},
        { "key": "possession", "header": "Possession", "mandatory":false, "preselected":true},
        { "key": "ppda", "header": "PPDA", "mandatory":false, "preselected":false},
        { "key": "shots", "header": "Shots", "mandatory":false, "preselected":false},
        { "key": "strength", "header": "Strength", "mandatory":false, "preselected":false},
        { "key": "sequence", "header": "Sequence", "mandatory":false, "preselected":true},
        { "key": "previous", "header": "Previous", "mandatory":false, "preselected":true},
        { "key": "rank", "header": "Rank", "mandatory":false, "preselected":true},
        { "key": "odds", "header": "Odds", "mandatory":true},
        { "key": "prediction", "header": "Prediction", "mandatory":true},
        { "key": "reason", "header": "Reason", "mandatory":false}
    ];

const [headers, setHeaders] = useState([]);
const [numMatches, setNumMatches] = useState("0");
const [matchType, setMatchType] = useState("total");
const [canSubmit, setCanSubmit] = useState(false);
const [filteredColumns, setFilteredColumns] = useState(null);

useEffect(()=> {
  console.log('Input:useEffect initialise: ' + numCols);
  setFilteredColumns(aInputColumns.filter(c => c.mandatory === true || 
          (numCols >= 3 && c.key === "reason") ||
          (numCols >= 3 && c.preselected === true)))
},[numCols]);

useEffect(() => {
    console.log('Input:useEffect predictions');
    let nReasonCount = 0
    if (predictionsData !== null && inputWeekData !== null) {
      predictionsData.forEach( p => {
          if (p.reason !== '')
              nReasonCount++
      })
      // no validation of Reason input in Smartphone mode
      if (!canSubmit) {
        if (numCols < 3) {
          setCanSubmit(true)
        }
        else {
          let nInputFixtures = inputWeekData.filter(f => canInput(f.date)).length
          console.log("Reasons: " + nReasonCount + " Fixtures: " + nInputFixtures)
          setCanSubmit(nReasonCount >= nInputFixtures)
        }
      }
    }
},[predictionsData, numCols, inputWeekData]);

  const handleMatchTypeChange = event => {
    setMatchType(event.target.value);
  };
  const handleNumMatchesChange = event => {
    setNumMatches(event.target.value);
  };
  const canInput = kickoff_time => {
    return (new Date()).getTime() < (new Date(kickoff_time)).getTime();
  };
  const handleNumberChange = (e) => {
      let aAttributes = e.imaginaryTarget.id.split(".")
      savePredictionData(parseInt(aAttributes[0], 10), aAttributes[1], parseInt(e.imaginaryTarget.value, 10))
  };
  const handleChange = (e) => {
    let aAttributes = e.target.id.split(".")
     savePredictionData(parseInt(aAttributes[0], 10), aAttributes[1], e.target.value)
 };

const handleSubmitPredictions = () => {
    submitPredictions().then(res => console.log('Back in Input: ' + res))
  };

const handleOptionalColumnsChange = (event) => {
  console.log(event)
  setFilteredColumns(aInputColumns.filter(c => c.mandatory === true || (event.selectedItems.findIndex(c1 => c1.key === c.key) >= 0)))
}

const renderSequence=(cell) => {
  return (
  <TableCell key={cell.id}>
  <div className="subtable">
    <div className="row">
      <span className="cell">{renderSequenceElement(cell.value.home[matchType])}</span>
    </div>
    <div className="row">
      <span className="cell">{renderSequenceElement(cell.value.away[matchType])}</span>
    </div>
  </div>
</TableCell>
  )
}
const renderSequenceElement=(sequence) => {
  let aFixtures = sequence.fixtures.split("-")
  // JSON.stringify(getFixture(aFixtures[index]))
  return sequence.results.slice(-10).split("").map((r,index) => <span title={displayFixture(getFixture(aFixtures[index]), numCols)}>{r}</span>)
}
const renderPrediction=(fixture) => {
  let team_h_score = 0
  let team_a_score = 0
  let prediction = predictionsData.find(p => p.fixture_id === parseInt(fixture.id, 10))
  if (prediction !== undefined) {
    team_h_score = prediction.team_h_score
    team_a_score = prediction.team_a_score
  }
  else {
    console.log("Prediction for " + fixture.id + " not found")  // shouldn't happen
  }
  return (
      <div className="subtable">
          <div className="entry_row">
              <span className="cell">
                  <NumberInput required="" id={fixture.id + ".team_h_score"} min={0} max={9} value={team_h_score} size="sm" isMobile={numCols < 3} readOnly={!canInput(fixture.kickoff_time)} onChange={handleNumberChange} />
              </span>
          </div>
          <div className="entry_row">
              <span className="cell">
                  <NumberInput required="" id={fixture.id + ".team_a_score"} min={0} max={9} value={team_a_score} size="sm" isMobile={numCols < 3} readOnly={!canInput(fixture.kickoff_time)} onChange={handleNumberChange} />
              </span>
          </div>
      </div>
  );
}
const renderReason=(fixture) => {
  let reason="Prediction not found"
  let prediction = predictionsData.find(p => p.fixture_id === parseInt(fixture.id, 10))
  if (prediction !== undefined) {
    reason = prediction.reason
  }
  else {
    console.log("Prediction for " + fixture.id + " not found")  // shouldn't happen
  }
  return (
  <TextInput required="" id={fixture.id + ".reason"} labelText="reason" hideLabel={true} maxLength="128" width="40" value={reason} readOnly={!canInput(fixture.kickoff_time)} onChange={handleChange} />
  );
}
  return (
    <>
        <div className="bx--grid">
          {numCols >= 3 &&
            <div className="bx--row">
                 <div className="bx--col-lg-4">
                    <MultiSelect
                    id="optional_columns"
                    label="Optional Columns"
                    titleText="Optional Columns"
                    items={aInputColumns.filter(c => c.mandatory === false)}
                    initialSelectedItems={aInputColumns.filter(c => c.mandatory === false && c.preselected === true)}
                    itemToString={(item) => item.header}
                     onChange={handleOptionalColumnsChange}>
                     </MultiSelect>
                </div>
                <div className="bx--col-lg-4">
                    <Select
                    id="match_type"
                    labelText="Type"
                    value={matchType}
                    onChange={handleMatchTypeChange}>
                    <SelectItem value="total" text="All" />
                    <SelectItem value="ha" text="Home/Away" />
                    </Select>
                </div>
                <div className="bx--col-lg-4">
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
        }
        </div>
    { inputWeekData !== null && predictionsData != null && filteredColumns !== null && 
    <>
    <DataTable rows={inputWeekData} headers={filteredColumns}>
      {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => (
        <Table {...getTableProps()} size="compact">
          <TableHead>
            <TableRow>
              <TableExpandHeader />
              {headers.map(header => (
                <TableHeader key={header.key} {...getHeaderProps({ header })}>
                  {header.header}
                </TableHeader>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(row => (
            <React.Fragment key={row.id}>
            <TableExpandRow
            key={row.id + 'A'} {...getRowProps({ row })}>
                {row.cells.map(cell => {
                  if (cell.value === undefined) {
                    return (<TableCell key={cell.id}></TableCell>);
                  }
                  else if (cell.info.header === 'teams') {
                    return (
                      <TableCell key={cell.id}>
                        <div className="subtable">
                          <div className="row">
                            <span className="cell">{numCols >= 3 ? cell.value.home.name : cell.value.home.short_name}</span>
                          </div>
                          <div className="row">
                            <span className="cell">{numCols >= 3 ? cell.value.away.name : cell.value.away.short_name}</span>
                          </div>
                        </div>
                      </TableCell>
                    );
                  }
                  else if (cell.info.header === 'strength') {
                    return (
                      <TableCell key={cell.id}>
                        <div className="subtable"><div className="row"><span className="cell">{cell.value.home}</span></div><div className="row"><span className="cell">{cell.value.away}</span></div></div>
                      </TableCell>
                    );
                  }
                  else if (cell.info.header === 'att_def') {
                    return (
                      <TableCell key={cell.id}>
                        <div className="subtable">
                          <div className="data_header_row">
                            <span className="cell">O</span><span className="cell">A</span><span className="cell">D</span>
                          </div>
                          <div className="data_row">
                            <span className="cell">{cell.value.home.overall}</span><span className="cell">{cell.value.home.attack}</span><span className="cell">{cell.value.home.defence}</span>
                          </div>
                          <div className="data_row">
                            <span className="cell">{cell.value.away.overall}</span><span className="cell">{cell.value.away.attack}</span><span className="cell">{cell.value.away.defence}</span>
                          </div>
                        </div>
                      </TableCell>
                    );
                  }
                  else if (cell.info.header === 'points') {
                    return (
                      <TableCell key={cell.id}>
                        <div className="subtable">
                          <div className="data_header_row">
                            <span className="cell">A</span><span className="cell">x</span>
                          </div>
                          <div className="data_row">
                            <span className="cell">{cell.value.home[numMatches][matchType].actual}</span><span className="cell">{cell.value.home[numMatches][matchType].expected}</span>
                          </div>
                          <div className="data_row">
                            <span className="cell">{cell.value.away[numMatches][matchType].actual}</span><span className="cell">{cell.value.away[numMatches][matchType].expected}</span>
                          </div>
                        </div>
                      </TableCell>
                    );
                  }
                  else if (cell.info.header === 'goals') {
                    return (
                      <TableCell key={cell.id}>
                        <div className="subtable">
                          <div className="data_header_row">
                            <span className="cell">F</span><span className="cell">xF</span><span className="cell">A</span><span className="cell">xA</span>
                          </div>
                          <div className="data_row">
                            <span className="cell">{cell.value.home[numMatches][matchType].for.actual}</span><span className="cell">{cell.value.home[numMatches][matchType].for.expected}</span>
                            <span className="cell">{cell.value.home[numMatches][matchType].against.actual}</span><span className="cell">{cell.value.home[numMatches][matchType].against.expected}</span>
                          </div>
                          <div className="data_row">
                            <span className="cell">{cell.value.away[numMatches][matchType].for.actual}</span><span className="cell">{cell.value.away[numMatches][matchType].for.expected}</span>
                            <span className="cell">{cell.value.away[numMatches][matchType].against.actual}</span><span className="cell">{cell.value.away[numMatches][matchType].against.expected}</span>
                          </div>
                        </div>
                      </TableCell>
                    );
                  }
                  else if (cell.info.header === 'shots') {
                    return (
                      <TableCell key={cell.id}>
                        <div className="subtable">
                          <div className="data_header_row">
                            <span className="cell">F</span><span className="cell">tF</span><span className="cell">A</span><span className="cell">tA</span>
                          </div>
                          <div className="data_row">
                            <span className="cell">{cell.value.home[numMatches][matchType].for.total}</span><span className="cell">{cell.value.home[numMatches][matchType].for.target}</span>
                            <span className="cell">{cell.value.home[numMatches][matchType].against.total}</span><span className="cell">{cell.value.home[numMatches][matchType].against.target}</span>
                          </div>
                          <div className="data_row">
                            <span className="cell">{cell.value.away[numMatches][matchType].for.total}</span><span className="cell">{cell.value.away[numMatches][matchType].for.target}</span>
                            <span className="cell">{cell.value.away[numMatches][matchType].against.total}</span><span className="cell">{cell.value.away[numMatches][matchType].against.target}</span>
                          </div>
                        </div>
                      </TableCell>
                    );
                  }
                  else if (cell.info.header === 'deep' || cell.info.header === 'ppda') {
                    return (
                      <TableCell key={cell.id}>
                        <div className="subtable">
                          <div className="data_header_row">
                            <span className="cell">F</span><span className="cell">A</span>
                          </div>
                          <div className="data_row">
                            <span className="cell">{cell.value.home[numMatches][matchType].for}</span><span className="cell">{cell.value.home[numMatches][matchType].against}</span>
                          </div>
                          <div className="data_row">
                            <span className="cell">{cell.value.away[numMatches][matchType].for}</span><span className="cell">{cell.value.away[numMatches][matchType].against}</span>
                            </div>
                        </div>
                      </TableCell>
                    );
                  }
                  else if (cell.info.header === 'odds') {
                    return (
                      <TableCell key={cell.id}>
                        {cell.value !== undefined &&
                        <div className="subtable">
                            <div className="odds_row">
                                <span className={`cell odds odds${cell.value.rank[0]}`}>{cell.value.dsp_home}</span>
                            </div>
                            <div className="odds_row">
                                <span className={`cell odds odds${cell.value.rank[1]}`}>{cell.value.dsp_draw}</span>
                            </div>
                            <div className="odds_row">
                                <span className={`cell odds odds${cell.value.rank[2]}`}>{cell.value.dsp_away}</span>
                            </div>
                        </div>
                        }
                      </TableCell>
                    );
                  }
                  else if (cell.info.header === 'previous') {
                      // reverse r/m for R & R1
                      return (
                      <TableCell key={cell.id}>
                        <div className="subtable">
                          <div className="data_header_row">
                            {cell.value.r0.h !== undefined && <span className="cell" title={cell.value.r0.date}>R</span>}
                            {cell.value.m1.h !== undefined && <span className="cell" title={cell.value.m1.date}>M1</span>}
                            {cell.value.r1.h !== undefined && <span className="cell" title={cell.value.r1.date}>R1</span>}
                          </div>
                          <div className="data_row">
                            {cell.value.r0.h !== undefined && <span className="cell">{cell.value.r0.a} ({cell.value.r0.axg})</span>}
                            {cell.value.m1.h !== undefined && <span className="cell">{cell.value.m1.h} ({cell.value.m1.hxg})</span>}
                            {cell.value.r1.h !== undefined && <span className="cell">{cell.value.r1.a} ({cell.value.r1.axg})</span>}
                          </div>
                          <div className="data_row">
                          {cell.value.r0.h !== undefined && <span className="cell">{cell.value.r0.h} ({cell.value.r0.hxg})</span>}
                          {cell.value.m1.h !== undefined && <span className="cell">{cell.value.m1.a} ({cell.value.m1.axg})</span>}
                          {cell.value.r1.h !== undefined && <span className="cell">{cell.value.r1.h} ({cell.value.r1.hxg})</span>}
                          </div>
                        </div>
                      </TableCell>
                    );
                  }
                  else if (cell.info.header === 'possession') {
                    return (
                      <TableCell key={cell.id}>
                        <div className="subtable">
                          <div className="row">
                            <span className="cell">{cell.value.home[numMatches][matchType]}</span>
                          </div>
                          <div className="row">
                            <span className="cell">{cell.value.away[numMatches][matchType]}</span>
                          </div>
                        </div>
                      </TableCell>
                    );
                  }
                  else if (cell.info.header === 'sequence') {
                    return renderSequence(cell);
                  }
                  else if (cell.info.header === 'rank') {
                    return (
                      <TableCell key={cell.id}>
                        <div className="subtable">
                          <div className="data_header_row">
                            <span className="cell">Ch</span><span className="cell">+</span>
                          </div>
                          <div className="data_row">
                            <span className="cell rank">{cell.value.home[numMatches].total_league_position}</span>
                            <span className="cell rank">{cell.value[numMatches][matchType].home}</span>
                          </div>
                          <div className="data_row">
                            <span className="cell rank">{cell.value.away[numMatches].total_league_position}</span>
                            <span className="cell rank">{cell.value[numMatches][matchType].away}</span>
                          </div>
                        </div>
                      </TableCell>
                    );
                  }
                  else if (cell.info.header === 'date') {
                    return (
                      <TableCell key={cell.id}>
                         <div className="subtable">
                          <div className="row">
                            <span className="cell">{formatDOW(cell.value, numCols)}</span>
                          </div>
                          <div className="row">
                            <span className="cell">{formatTime(cell.value)}</span>
                          </div>
                        </div>
                      </TableCell>
                    );
                  }
                  else if (cell.info.header === 'prediction') {
                    return (
                      <TableCell key={cell.id} className={`cell predictionInput`}>
                    {renderPrediction(cell.value)}
                    </TableCell>
                    );
                  }
                  else if (cell.info.header === 'reason') {
                    return (
                      <TableCell key={cell.id}>
                        {renderReason(cell.value)}
                      </TableCell>
                    );
                  }
                  else
                    return <TableCell key={cell.id}>{cell.value}</TableCell>;
                })}  
              </TableExpandRow>
              {/* toggle based off of if the row is expanded. If it is, render TableExpandedRow */}
              {row.isExpanded && (
                <TableExpandedRow
                  {...getRowProps({ row })}
                  colSpan={headers.length + 1}
                  key={row.id + 'B'}>
                  <FPL2021Compare comparisonData={row.cells[filteredColumns.findIndex(c => c.key === 'rank')].value} numMatches={numMatches} matchType={matchType} />
                </TableExpandedRow>
              )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      )}
    </DataTable>
    {canSubmit &&
        <Button kind="primary" onClick={handleSubmitPredictions} >Submit</Button>
    }
    </>
}
    </>
  );
};
export default FPL2021Input;
