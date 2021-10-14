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
import {formatDOWTime, displayFixture} from '../Utils.js';
import { FeatureFlagScope } from 'carbon-components-react/lib/components/FeatureFlags';

// page only available for the designated current week
const FPL2021Input = ({predictor, predictionsData, fixtureData, getTeam, getPreviousByFixture, getSequenceByTeam, getOddsByFixture, 
    savePredictionData, submitPredictions, getTeamStats, getFixture, numCols}) => {

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
        { "key": "odds", "header": "Odds", "mandatory":true},
        { "key": "prediction", "header": "Prediction", "mandatory":true},
        { "key": "reason", "header": "Reason", "mandatory":true}
    ];

const [headers, setHeaders] = useState([]);
const [rows, setRows] = useState([]);
const [numMatches, setNumMatches] = useState("0");
const [matchType, setMatchType] = useState("total");
const [canSubmit, setCanSubmit] = useState(false);
const [filteredColumns, setFilteredColumns] = useState(null);

useEffect(()=> {
  console.log('In input initialise: ' + numCols);
  setFilteredColumns(aInputColumns.filter(c => c.mandatory === true || (numCols >= 3 && c.preselected === true)))
},[]);

useEffect(() => {
    console.log('In input create table');
    let aRows = []
    let nReasonCount = 0
    predictionsData.forEach( p => {
        if (p.reason !== '')
            nReasonCount++
    })
    fixtureData.forEach(f => {
        let home = getTeam(f.team_h)
        let away = getTeam(f.team_a)
        let prediction = predictionsData.find(p => p.fixture_id === parseInt(f.id, 10))
        let odds = getOddsByFixture(f.id)
        let previous = getPreviousByFixture(f.id)
        let hsequence = getSequenceByTeam(f.team_h)
        let asequence = getSequenceByTeam(f.team_a)
        let hstats = getTeamStats(f.team_h)
        let astats = getTeamStats(f.team_a)
        let row = {"id":f.id, "date":f.kickoff_time, 
        "teams":{"home": (numCols >= 3) ? home.name : home.short_name, "away": (numCols >= 3) ? away.name : away.short_name},
        "strength": {"home": home.strength, "away": away.strength},
        "att_def": 
        {
          "home":{"overall":home.strength_overall_home, "attack":home.strength_attack_home, "defence":home.strength_defence_home},
          "away":{"overall":away.strength_overall_away, "attack":away.strength_attack_away, "defence":away.strength_defence_away}
        },
        "points":{"home": {}, "away": {}},
        "goals":{"home": {}, "away": {}},
        "shots":{"home": {}, "away": {}},
        "deep":{"home": {}, "away": {}},
        "ppda":{"home": {}, "away": {}},
        "possession":{"home": {}, "away": {}},
        "sequence":{
          "home": {
            "total":{"results":hsequence.all_matches, "fixtures": hsequence.all_fixtures},
            "ha":{"results":hsequence.home, "fixtures":hsequence.home_fixtures}
                  }, 
          "away": {
            "total":{"results":asequence.all_matches, "fixtures": asequence.all_fixtures},
            "ha":{"results":asequence.away, "fixtures":asequence.away_fixtures} 
                  }
          },
        "previous":previous,
        "odds": odds,
        "prediction":prediction,
        "reason":prediction
        }
        for (let att in hstats) {
          row.possession.home[att] = {"total":hstats[att].total_possession, "ha":hstats[att].h_possession}
          row.points.home[att] = {
            "total":(hstats[att].total_matches === 0) ? undefined : {"actual": avg(hstats[att].total_points,hstats[att].total_matches), "expected": avg(hstats[att].total_xpts,hstats[att].total_matches)},
            "ha":(hstats[att].h_matches === 0) ? undefined : {"actual": avg(hstats[att].h_points,hstats[att].h_matches), "expected": avg(hstats[att].h_xpts,hstats[att].h_matches)}
          }
          row.goals.home[att] = {
            "total":(hstats[att].total_matches === 0) ? undefined : {"for": {"actual": avg(hstats[att].total_goals,hstats[att].total_matches), "expected": avg(hstats[att].total_xg,hstats[att].total_matches)},
              "against": {"actual": avg(hstats[att].total_goals_conceded,hstats[att].total_matches), "expected":avg(hstats[att].total_vxg,hstats[att].total_matches)}},
            "ha":(hstats[att].h_matches === 0) ? undefined : {"for":{"actual": avg(hstats[att].h_goals,hstats[att].h_matches), "expected":avg(hstats[att].h_xg,hstats[att].h_matches)},
              "against":{"actual": avg(hstats[att].h_goals_conceded,hstats[att].h_matches), "expected":avg(hstats[att].h_vxg,hstats[att].h_matches)}}
          }
          row.shots.home[att] = {
            "total":(hstats[att].total_matches === 0) ? undefined : {"for": {"total":avg(hstats[att].total_shots,hstats[att].total_matches), "target":avg(hstats[att].total_target,hstats[att].total_matches)}, 
                  "against": {"total": avg(hstats[att].total_vshots,hstats[att].total_matches), "target":avg(hstats[att].total_vtarget,hstats[att].total_matches)}},
            "ha":(hstats[att].h_matches === 0) ? undefined : {"for": {"total":avg(hstats[att].h_shots,hstats[att].h_matches), "target":avg(hstats[att].h_target,hstats[att].h_matches)},
                  "against": {"total": avg(hstats[att].h_vshots,hstats[att].h_matches), "target":avg(hstats[att].h_vtarget,hstats[att].h_matches)}}
          }
          row.deep.home[att] = {
            "total":(hstats[att].total_matches === 0) ? undefined : {"for": avg(hstats[att].total_deep,hstats[att].total_matches), "against": avg(hstats[att].total_vdeep,hstats[att].total_matches)},
            "ha":(hstats[att].h_matches === 0) ? undefined : {"for": avg(hstats[att].h_deep,hstats[att].h_matches), "against": avg(hstats[att].h_vdeep,hstats[att].h_matches)}
          }
          row.ppda.home[att] = {
            "total":(hstats[att].total_matches === 0) ? undefined : {"for": avg(hstats[att].total_ppda,hstats[att].total_matches), "against": avg(hstats[att].total_vppda,hstats[att].total_matches)},
            "ha":(hstats[att].h_matches === 0) ? undefined : {"for": avg(hstats[att].h_ppda,hstats[att].h_matches), "against": avg(hstats[att].h_vppda,hstats[att].h_matches)}
          }
        }
        for (let att in astats) {
          row.possession.away[att] = {"total":astats[att].total_possession, "ha":astats[att].a_possession}
          row.points.away[att] = {
            "total":(astats[att].total_matches === 0) ? undefined : {"actual": avg(astats[att].total_points,astats[att].total_matches), "expected":avg(astats[att].total_xpts,astats[att].total_matches)},
            "ha":(astats[att].a_matches === 0) ? undefined : {"actual": avg(astats[att].a_points,astats[att].a_matches), "expected":avg(astats[att].a_xpts,astats[att].a_matches)}
          }
          row.goals.away[att] = {
            "total":(astats[att].total_matches === 0) ? undefined : {"for": {"actual": avg(astats[att].total_goals,astats[att].total_matches), "expected":avg(astats[att].total_xg,astats[att].total_matches)},
              "against": {"actual": avg(astats[att].total_goals_conceded,astats[att].total_matches), "expected":avg(astats[att].total_vxg,astats[att].total_matches)}},
            "ha":(astats[att].a_matches === 0) ? undefined : {"for":{"actual": avg(astats[att].a_goals,astats[att].a_matches), "expected":avg(astats[att].a_xg,astats[att].a_matches)},
              "against":{"actual": avg(astats[att].a_goals_conceded,astats[att].a_matches), "expected":avg(astats[att].a_vxg,astats[att].a_matches)}}
          }
          row.shots.away[att] = {
            "total":(astats[att].total_matches === 0) ? undefined : {"for": {"total":avg(astats[att].total_shots,astats[att].total_matches), "target":avg(astats[att].total_target,astats[att].total_matches)}, 
                  "against": {"total": avg(astats[att].total_vshots,astats[att].total_matches), "target":avg(astats[att].total_vtarget,astats[att].total_matches)}},
            "ha":(astats[att].a_matches === 0) ? undefined : {"for": {"total":avg(astats[att].a_shots,astats[att].a_matches), "target":avg(astats[att].a_target,astats[att].a_matches)},
                  "against": {"total": avg(astats[att].a_vshots,astats[att].a_matches), "target":avg(astats[att].a_vtarget,astats[att].a_matches)}}
          }
          row.deep.away[att] = {
            "total":(astats[att].total_matches === 0) ? undefined : {"for": avg(astats[att].total_deep,astats[att].total_matches), "against": avg(astats[att].total_vdeep,astats[att].total_matches)},
            "ha":(astats[att].a_matches === 0) ? undefined : {"for": avg(astats[att].a_deep,astats[att].a_matches), "against": avg(astats[att].a_vdeep,astats[att].a_matches)}
          }
          row.ppda.away[att] = {
            "total":(astats[att].total_matches === 0) ? undefined : {"for": avg(astats[att].total_ppda,astats[att].total_matches), "against": avg(astats[att].total_vppda,astats[att].total_matches)},
            "ha":(astats[att].a_matches === 0) ? undefined : {"for": avg(astats[att].h_ppda,astats[att].a_matches), "against": avg(astats[att].a_vppda,astats[att].a_matches)}
          }
        }  
        aRows.push(row)
    })
    setRows(aRows)
    setCanSubmit(nReasonCount == fixtureData.length)
},[predictionsData]);

const avg=(total, count) => {
  return Math.round(total/count * 10)/10
}
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
  return sequence.results.split("").map((r,index) => <span title={displayFixture(getFixture(aFixtures[index]), numCols)}>{r}</span>)
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
    { rows !== null && filteredColumns !== null && 
    <>
    <DataTable rows={rows} headers={filteredColumns}>
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
                  if (cell.value === undefined) {
                    return (<TableCell key={cell.id}></TableCell>);
                  }
                  else if (cell.info.header === 'teams' || cell.info.header === 'strength') {
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
                    return (
                      <TableCell key={cell.id}>
                        <div className="subtable">
                          <div className="data_header_row">
                            <span className="cell">M1</span><span className="cell">R1</span>
                          </div>
                          <div className="data_row">
                            <span className="cell">{cell.value.m1.h}</span><span className="cell">{cell.value.r1.h}</span>
                          </div>
                          <div className="data_row">
                            <span className="cell">{cell.value.m1.a}</span><span className="cell">{cell.value.r1.a}</span>
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
                  else if (cell.info.header === 'date') {
                    return (
                      <TableCell key={cell.id}>
                        {formatDOWTime(cell.value)}
                      </TableCell>
                    );
                  }
                  else if (cell.info.header === 'prediction') {
                    return (
                      <TableCell key={cell.id}>
                        <div className="subtable">
                            <div className="entry_row">
                                <span className="cell">
                                    <NumberInput required="" id={cell.value.fixture_id + ".team_h_score"} min={0} max={9} value={cell.value.team_h_score} readOnly={!canInput(cell.value.kickoff_time)} onChange={handleNumberChange} />
                                </span>
                            </div>
                            <div className="entry_row">
                                <span className="cell">
                                    <NumberInput required="" id={cell.value.fixture_id + ".team_a_score"} min={0} max={9} value={cell.value.team_a_score} readOnly={!canInput(cell.value.kickoff_time)} onChange={handleNumberChange} />
                                </span>
                            </div>
                        </div>
                      </TableCell>
                    );
                  }
                  else if (cell.info.header === 'reason') {
                    return (
                      <TableCell key={cell.id}>
                        <TextInput required="" id={cell.value.fixture_id + ".reason"} labelText="reason" hideLabel={true} maxLength="128" width="40" value={cell.value.reason} readOnly={!canInput(cell.value.kickoff_time)} onChange={handleChange} />
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
    {canSubmit &&
        <Button kind="primary" onClick={handleSubmitPredictions} >Submit</Button>
    }
    </>
}
    </>
  );
};
export default FPL2021Input;
