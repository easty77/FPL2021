import React, { useState, useEffect } from 'react';
import {Content} from 'carbon-components-react';
import {BrowserRouter, Switch, Route} from 'react-router-dom';
import './App.scss';

import {
  Header,
  HeaderName
} from "carbon-components-react/lib/components/UIShell";

import FPL2021Championship from './components/FPL2021Championship'
import FPL2021Predictions from './components/FPL2021Predictions'
import FPL2021Home from './components/FPL2021Home'
import FPL2021Input from './components/FPL2021Input'
import FPL2021Header from './components/FPL2021Header'

class DebugRouter extends BrowserRouter {
  constructor( props ){
    super( props )
    if( props.silent !== undefined ){
      console.log( 'initial history is: ', JSON.stringify( this.history, null, 2 ))
      this.history.listen(( loc, action )=>{
        console.log(
          `The current URL is ${ loc.pathname }${ loc.search }${ loc.hash }`
        )
        console.log( `The last navigation action was ${ action }`, JSON.stringify( this.history, null, 2 ))
      })
    }
  }
}

function App()
{
  const urls = {
    mock: {
      bootstrap: '/FPL2021/data/bootstrap-static.json',
      fixtures: '/FPL2021/data/fixtures.json',
      predictions: '/FPL2021/data/predictions.json',
      odds: '/FPL2021/data/odds.json',
      sequence: '/FPL2021/data/team_results_sequence_2021.json',
      previous: '/FPL2021/data/team_previous_instances_2021.json',
      team_stats:{"0":"/FPL2021/data/team_stats_2021.json", "3":"/FPL2021/data/team_last3_stats_2021.json"},
      save_predictions:'/FPL2021/data/success.json'
    },
    server: {
      bootstrap: '/fpl/json/2021/bootstrap-static.json',
      fixtures: '/fpl/json/2021/fixtures.json',
      predictions: '/FPL/servlet/ENEFPLServlet?action=select_predictions&output=json&year=2021',
      odds: '/FPL/servlet/ENEFPLServlet?action=select_matchodds&output=json&year=2021',
      sequence: '/fpl/json/2021/team_results_sequence_2021.json',
      previous: '/fpl/json/2021/team_previous_instances_2021.json',
      team_stats:{"0":"/json/fpl/team_stats_2021.json", "3":"/json/fpl/team_last3_stats_2021.json"},
      save_predictions:'/FPL/servlet/ENEFPLServlet?action=save_predictions&output=json&year=2021'
    },
  };
  
  const [predictorId, setPredictorId] = useState("SE");
  const [weekNumber, setWeekNumber] = useState(6);
  const [eventsData, setEventsData] = useState(null);
  const [teamsData, setTeamsData] = useState(null);
  const [fixtureData, setFixtureData] = useState(null);
  const [teamStatsData, setTeamStatsData] = useState(null);
  const [predictionsData, setPredictionsData] = useState(null);
  const [oddsData, setOddsData] = useState(null);
  const [previousInstanceData, setPreviousInstanceData] = useState(null);
  const [resultsSequenceData, setResultsSequenceData] = useState(null);
  const [staticDataLoaded, setStaticDataLoaded] = useState(false);

  const retrieveURL = urlName => {
    return urls[process.env.NODE_ENV === 'development' ? 'mock' : 'server'][
      urlName
    ];
  };

  useEffect(() => {
    // initialise
    loadBaseData();
	},[]);

  const getTeam=( id )=>{
    return teamsData.find(t => t.id === id.toString())
  }  
  const getTeamStats=( id )=>{
    return teamsData.find(t => t.id === id.toString())
  }  
  const getPreviousByFixture=( fixture_id )=>{
    return previousInstanceData.find(f => f.fixture_id === fixture_id)
  }  
  const getSequenceByTeam=( team_id )=>{
    return resultsSequenceData.find(s=> s.team_id === team_id)
  }  
  const getOddsByFixture=( fixture_id )=>{
    return oddsData.find(o=> o.fixture_id === fixture_id)
  } 
  const callSubmitPredictions=(aPredictions)=>{
    if (process.env.NODE_ENV === 'development') {
      return fetch(retrieveURL('save_predictions'))
    }
    else {
      return fetch(retrieveURL('save_predictions'), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(aPredictions)
      })
    }  
  } 
  const submitPredictions=( predictionsObj )=>{
    console.log(predictionsObj)
    let aPredictions = []
    for (let p in predictionsObj) {
      aPredictions.push(predictionsObj[p])
    }
    return callSubmitPredictions(aPredictions).then(res => res.json())
    .then(res => {
      if (res.code === "0") {
        fetch(retrieveURL('predictions')).then(response => response.json())
        .then(jsonData => {
          let aPredictions = jsonData.rowdata
          aPredictions.forEach(item => {
           item.fixture_id = item.fixture_id.toString();
          });  
          setPredictionsData(aPredictions)
        })
      }
      else {
        alert('Error')
      }
    }
    );
  }  
  
  const calculateFixtureProfit=( fixture_id )=>{
    if (fixtureData === undefined)
    {
      console.log("fixtureData undefined")
      return 0
    }
    let fixture = fixtureData.find(f => f.id === fixture_id.toString())
    if (fixture === undefined) {
      console.log('Fixture not found: ' + fixture_id)
      return 0.00
    }
    let odds_att = "draw"
    if (fixture.team_h_score > fixture.team_a_score)
      odds_att = "home"
    else if (fixture.team_a_score > fixture.team_h_score)
      odds_att = "away"

    // subtract 1 as includes stake 
    let odds = oddsData.find(o => o.fixture_id === fixture_id.toString())
    let profit = {"value": parseFloat((odds[odds_att] - 1).toFixed(2)),
              "display": odds["dsp_" + odds_att]};

    return profit;
  }

  const loadBaseData = () => {
    let aURLs=[]
    let retrieveURLs = retrieveURL('team_stats');
    aURLs.push(fetch(retrieveURL('bootstrap')).then(response => response.json()));
    aURLs.push(fetch(retrieveURL('fixtures')).then(response => response.json()));
    for (var u in retrieveURLs)
    {
        aURLs.push(fetch(retrieveURLs[u]).then(response => response.json()));
    }
    aURLs.push(fetch(retrieveURL('previous')).then(response => response.json()));
    aURLs.push(fetch(retrieveURL('sequence')).then(response => response.json()));
    aURLs.push(fetch(retrieveURL('odds')).then(response => response.json()));
    aURLs.push(fetch(retrieveURL('predictions')).then(response => response.json()));
    Promise.all(aURLs).then(jsonData => {
      // unique id attribute (of type string) required for display in DataTable, so add
      let aEvents = jsonData[0].events
      aEvents.forEach((item, i) => {
        item.id = item.id.toString();
      });  
      setEventsData(aEvents);
      let aTeams = jsonData[0].teams
      aTeams.forEach((item, i) => {
        item.id = item.id.toString();
      });  
      setTeamsData(aTeams);
      let aFixtures = jsonData[1];
      aFixtures.forEach((item, i) => {
            item.id = item.id.toString();
          });  
      setFixtureData(aFixtures);
      let tSD = {};
      let nIndex = 2;
      for (var u in retrieveURLs) {
          let aTeamStats= jsonData[nIndex++].data;
          // id for dataTable row must be a string
          aTeamStats.forEach(item => {
              item.id = item.id.toString();
          });
          tSD[u] = aTeamStats
      }
      setTeamStatsData(tSD);
      let aPrevious = jsonData[nIndex++].data
      aPrevious.forEach(item=> {
            item.id = item.fixture_id.toString();
            item.fixture_id = item.fixture_id.toString();
          });  
      setPreviousInstanceData(aPrevious)
      setResultsSequenceData(jsonData[nIndex++].data)
     
      let aOdds =  jsonData[nIndex++].rowdata; 
      // unique id attribute (of type string) required for display in DataTable, so add
      aOdds.forEach(item => {
        item.id = item.fixture_id.toString();
        item.fixture_id = item.fixture_id.toString();
      });  
       setOddsData(aOdds);
       let aPredictions = jsonData[nIndex++].rowdata
       aPredictions.forEach(item => {
        item.fixture_id = item.fixture_id.toString();
      });  
       setPredictionsData(aPredictions);

       setStaticDataLoaded(true)
      console.log('events, teams & fixtures loaded')
    });
  };

    return (
    <div className="container">
        <DebugRouter silent>
           <FPL2021Header />
           { staticDataLoaded &&
           <Content>
              <Switch>
                <Route exact path="/FPL2021/predictions">
                  <FPL2021Predictions 	predictionsData={predictionsData} 
                    getProfit = {calculateFixtureProfit} /> 
                </Route>
                <Route exact path="/FPL2021/championship">
                  <FPL2021Championship 	teamStatsData={teamStatsData}
                    />
                </Route>
                <Route exact path="/FPL2021/input">
                  <FPL2021Input 	fixtureData={fixtureData.filter(f => f.event === weekNumber)}
                  predictor = {predictorId}
                  predictionsData={predictionsData.filter(p => p.event === weekNumber && p.predictor_id === predictorId)}
                    getTeam={getTeam}
                    getSequenceByTeam={getSequenceByTeam}
                    getPreviousByFixture={getPreviousByFixture}
                    getOddsByFixture={getOddsByFixture}
                    submitPredictions={submitPredictions}
                    />
                </Route>
                <Route path={["/", "/FPL2021"]}>
                  <FPL2021Home 	predictionsData={predictionsData}
                    fixtureData={fixtureData}
                    getTeam={getTeam}
                    getOddsByFixture={getOddsByFixture}
                    /> 
                </Route>
              </Switch>
              </Content>
            }
          </DebugRouter>
     </div>
    );
}

export default App;

