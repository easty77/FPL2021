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
  SelectItem,
  TextInput,
  NumberInput,
  Button
} from 'carbon-components-react';
import {formatDOWTime} from '../Utils.js';
import { FeatureFlagScope } from 'carbon-components-react/lib/components/FeatureFlags';

// page only available for the designated current week
const FPL2021Input = ({predictor, predictionsData, fixtureData, getTeam, getPreviousByFixture, getSequenceByTeam, getOddsByFixture, submitPredictions}) => {

const aInputColumns = [
        { "key": "id", "header": "ID"},
        { "key": "date", "header": "Date"},
        { "key": "teams", "header": "Fixture"},
        { "key": "strength", "header": "Strength"},
        { "key": "att_def", "header": "Attack v Defence"},
        { "key": "data", "header": "Data"},
        { "key": "sequence", "header": "Sequence"},
        { "key": "previous", "header": "Previous"},
        { "key": "odds", "header": "Odds"},
        { "key": "prediction", "header": "Prediction"},
        { "key": "reason", "header": "Reason"}
    ];

const [headers, setHeaders] = useState([]);
const [rows, setRows] = useState([]);
const [numMatches, setNumMatches] = useState("0");
const [matchType, setMatchType] = useState("total");
const [predictionsObj, setPredictionsObj] = useState(null);
const [canSubmit, setCanSubmit] = useState(false);

useEffect(() => {
    console.log('In input initialise');
    let aRows = []
    let objPredict = {}
    fixtureData.forEach(f => {
        objPredict[f.id] = {"predictor":predictor, "fixture":f.id, "kickoff_time": f.kickoff_time, "home":0, "away":0, "reason":""}
    })
    let nReasonCount = 0
    predictionsData.forEach( p => {
        objPredict[p.fixture_id].home = p.team_h_score
        objPredict[p.fixture_id].away = p.team_a_score
        objPredict[p.fixture_id].reason = p.reason
        if (p.reason !== '')
            nReasonCount++
    })
    setCanSubmit(nReasonCount == fixtureData.length)
    fixtureData.forEach(f => {
        let home = getTeam(f.team_h)
        let away = getTeam(f.team_a)
        let row = {"id":f.id, "date":f.kickoff_time, 
        "teams":{"home": home.name, "away": away.name},
        "strength": {"home": home.strength, "away": away.strength},
        "att_def": {"home":{"overall":home.strength_overall_home, "attack":home.strength_attack_home, "defence":home.strength_defence_home},
        "away":{"overall":home.strength_overall_away, "attack":home.strength_attack_away, "defence":home.strength_defence_away}},
            "points":"Points",
        "goals":"Goals",
        "sequence":{"home": getSequenceByTeam(f.team_h), "away": getSequenceByTeam(f.team_a)},
        "previous":getPreviousByFixture(f.id),
        "odds":getOddsByFixture(f.id),
        "prediction":objPredict[f.id],
        "reason":objPredict[f.id]
        }
        aRows.push(row)
    })
    setPredictionsObj(objPredict)
    setRows(aRows)
},[predictionsData]);

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
      let po = predictionsObj
       po[aAttributes[0]][aAttributes[1]] = parseInt(e.imaginaryTarget.value, 10)
       setPredictionsObj(po)
  };
  const handleChange = (e) => {
    let aAttributes = e.target.id.split(".")
    let po = predictionsObj
    po[aAttributes[0]][aAttributes[1]] = e.target.value

    let bCanSubmit = true
    for (let p in po) {
        if (po[p].reason === undefined || predictionsObj[p].reason === '') {
            bCanSubmit = false
            break
        }
    }
    console.log('set CanSubmit')
    setCanSubmit(bCanSubmit)

    console.log('set Predictions')
    setPredictionsObj(po)
};

const handleSubmitPredictions = () => {
    submitPredictions(predictionsObj).then(res => console.log('Back in Input: ' + res))
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
                    <SelectItem value="ha" text="Home/Away" />
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
    { rows !== null && 
    <>
    <DataTable rows={rows} headers={aInputColumns}>
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
                  if (cell.info.header === 'teams' || cell.info.header === 'strength') {
                    return (
                      <TableCell key={cell.id}>
                        <div className="subtable"><div className="row"><span className="cell">{cell.value.home}</span></div><div className="row"><span className="cell">{cell.value.away}</span></div></div>
                      </TableCell>
                    );
                  }
                  else if (cell.info.header === 'att_def') {
                    return (
                      <TableCell key={cell.id}>
                        <div className="subtable"><div className="row"><span className="cell">{cell.value.home.attack - cell.value.away.defence}</span></div><div className="row"><span className="cell">{cell.value.away.attack - cell.value.home.defence}</span></div></div>
                      </TableCell>
                    );
                  }
                  else if (cell.info.header === 'points') {
                    return (
                      <TableCell key={cell.id}>
                        <div className="subtable">
                            <div className="data_header_row"><span className="cell">P</span><span className="cell">xP</span><span className="cell">P3</span><span className="cell">xP3</span></div>
                            <div className="data_row"><span className="cell">0.50</span><span className="cell">0.34</span><span className="cell">0.50</span><span className="cell">0.34</span></div>
                            <div className="data_row"><span className="cell">0.50</span><span className="cell">0.85</span><span className="cell">0.50</span><span className="cell">0.85</span></div>
                        </div>
                        <div className="subtable"><div className="row"><span className="cell">{cell.value.home.attack - cell.value.away.defence}</span></div><div className="row"><span className="cell">{cell.value.away.attack - cell.value.home.defence}</span></div></div>
                      </TableCell>
                    );
                  }
                  else if (cell.info.header === 'odds') {
                    return (
                      <TableCell key={cell.id}>
                        <div className="subtable"><div className="odds_row"><span className="cell">{cell.value.dsp_home}</span></div><div className="odds_row"><span className="cell">{cell.value.dsp_draw}</span></div><div className="odds_row"><span className="cell">{cell.value.dsp_away}</span></div></div>
                      </TableCell>
                    );
                  }
                  else if (cell.info.header === 'previous') {
                    return (
                      <TableCell key={cell.id}>
                        <div className="subtable"><div className="row"><span className="cell">{cell.value.m1.h}</span></div><div className="row"><span className="cell">{cell.value.m1.a}</span></div></div>
                      </TableCell>
                    );
                  }
                  else if (cell.info.header === 'sequence') {
                    return (
                      <TableCell key={cell.id}>
                        <div className="subtable"><div className="row"><span className="cell">{cell.value.home.all_matches}</span></div><div className="row"><span className="cell">{cell.value.away.all_matches}</span></div></div>
                      </TableCell>
                    );
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
                                    <NumberInput required="" id={cell.value.fixture + ".home"} min={0} max={9} value={cell.value.home} readOnly={!canInput(cell.value.kickoff_time)} onChange={handleNumberChange} />
                                </span>
                            </div>
                            <div className="entry_row">
                                <span className="cell">
                                    <NumberInput required="" id={cell.value.fixture + ".away"} min={0} max={9} value={cell.value.away} readOnly={!canInput(cell.value.kickoff_time)} onChange={handleNumberChange} />
                                </span>
                            </div>
                        </div>
                      </TableCell>
                    );
                  }
                  else if (cell.info.header === 'reason') {
                    return (
                      <TableCell key={cell.id}>
                        <TextInput required="" id={cell.value.fixture + ".reason"} labelText="reason" hideLabel={true} maxLength="128" width="40" value={cell.value.reason} readOnly={!canInput(cell.value.kickoff_time)} onChange={handleChange} />
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
