import React, { useState, useEffect } from 'react';
import {Content} from 'carbon-components-react';
import {BrowserRouter, Switch, Route} from 'react-router-dom';
import FacebookLogin from 'react-facebook-login';
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
import FPL2021Admin from './components/FPL2021Admin'
import {getResultIndex} from './Utils.js';

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
      team_stats:{"0":"/FPL2021/data/team_stats_2021.json", "3":"/FPL2021/data/team_last3_stats_2021.json", "5":"/FPL2021/data/team_last5_stats_2021.json"},
      save_predictions:'/FPL2021/data/success.json'
    },
    server: {
      bootstrap: '/fpl/json/2021/bootstrap-static.json',
      fixtures: '/fpl/json/2021/fixtures.json',
      predictions: '/FPL/servlet/ENEFPLServlet?action=select_predictions&output=json&year=2021',
      odds: '/FPL/servlet/ENEFPLServlet?action=select_matchodds&output=json&year=2021',
      sequence: '/json/fpl/team_results_sequence_2021.json',
      previous: '/json/fpl/team_previous_instances_2021.json',
      team_stats:{"0":"/json/fpl/team_stats_2021.json", "3":"/json/fpl/team_last3_stats_2021.json", "5":"/json/fpl/team_last5_stats_2021.json"},
      save_predictions:'/FPL/servlet/ENEFPLServlet?action=save_predictions&output=json&year=2021'
    },
  };

  // Facebook
  const faceBookAppId = 744762949292992;
  const [facebookPicture, setFacebookPicture] = useState('');
  const [facebookName, setFacebookName] = useState(null);

  const predictors = ["SE", "TE", "ME", "PE", "AP"]
  const [predictorId, setPredictorId] = useState(null);
  const [weekNumber, setWeekNumber] = useState(null);
  const [eventsData, setEventsData] = useState(null);
  const [teamsData, setTeamsData] = useState(null);
  const [fixtureData, setFixtureData] = useState(null);
  const [teamStatsData, setTeamStatsData] = useState(null);
  const [predictionsData, setPredictionsData] = useState(null);
  const [inputPredictionsData, setInputPredictionsData] = useState(null);
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

  useEffect(() => {
    if (predictionsData !== null) {
      loadInputPredictionsData()
    }
  },[predictorId]);

  const getTeam=( id )=>{
    let team = teamsData.find(t => t.id === id.toString())
    if (team === undefined)
      console.log('Team not found: ' + id)
    else
      return team;  
  }  
  const getTeamStats=( id, nMatches )=>{
    if (nMatches === undefined) {
      let objTeamStats = {}
      for (let att in teamStatsData) {
        objTeamStats[att] = teamStatsData[att].find(t => t.id === id.toString())
      }
      return objTeamStats
    }
    else {
      return teamStatsData[nMatches.toString()].find(t => t.id === id.toString())
    }
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
      // last event with finished matches
      let nEventDisplay = 0
      // first event with unfinished matches
      let nEventInput = 0
      let nEvent=1
      while (aFixtures.findIndex(f => f.event === nEvent) >= 0) {
          if (aFixtures.findIndex(f => f.event === nEvent && f.finished === false) >= 0) {
              // there is an unfinished match, so activate Input for this week
              nEventInput = nEvent
              if (aFixtures.findIndex(f => f.event === nEvent && f.finished === true) >= 0) {
                  // event is partially complete, so display the same week
                  nEventDisplay = nEvent
              }
              else {
                // display previous week
                nEventDisplay = nEvent - 1
              }
              break;
          }
          
          nEvent++
      }

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
        item.rank = rankOdds([item.home, item.draw, item.away])
      });  
       setOddsData(aOdds);
       let aPredictions = jsonData[nIndex++].rowdata
       let nMaxPredictionEvent = 0
       aPredictions.forEach( p => {
         p.total_score = 3 * p.correct_score + p.bonus_score
         if (p.event > nMaxPredictionEvent)
         nMaxPredictionEvent = p.event
       })
       setPredictionsData(aPredictions);
       if (nMaxPredictionEvent > nEventDisplay)
        nEventDisplay = nMaxPredictionEvent
       setWeekNumber({"display":nEventDisplay, "input":nEventInput})

       if (process.env.NODE_ENV === 'development') {
        setPredictorId('SE')
        setFacebookName('Simon East')
        setFacebookPicture('https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=1405387009639461&height=50&width=50&ext=1635351184&hash=AeTwmQNSsJ3QQ-1cmQo')
       }
 
      setStaticDataLoaded(true)
      console.log('events, teams & fixtures loaded')
    });
  };
  const isLoggedIn=()=> {
    return predictorId !== null
  }
  function rankOdds(arr) {
    // return string ranking odds with lowest as 1
    let sorted = arr.slice().sort(function(a, b) {
      return a - b
    })
    let ranks = arr.slice().map(function(v) {
      return sorted.indexOf(v) + 1
    });
    return ranks.join('');
  }

  const loadInputPredictionsData=()=> {
    let aInputPredictions = [...predictionsData.filter(p => p.event === weekNumber.input && p.predictor_id=== predictorId)]
    fixtureData.filter(f => f.event === weekNumber.input).forEach(f1 =>{
      let nIndex = aInputPredictions.findIndex(p => p.fixture_id === parseInt(f1.id, 10))
      if ( nIndex < 0) {
         aInputPredictions.push({"fixture_id":parseInt(f1.id, 10), "predictor_id":predictorId, "team_h_score":0, "team_a_score":0, "reason":"", "kickoff_time":f1.kickoff_time})
      }
      else {
        aInputPredictions[nIndex].kickoff_time = f1.kickoff_time
      }
    })
    setInputPredictionsData(aInputPredictions);
  }
  const savePredictionData=( fixture_id, att, value )=>{
    var newData = [...inputPredictionsData];
    let nPrediction = newData.findIndex(p => p.fixture_id === fixture_id && p.predictor_id === predictorId)
    if (nPrediction < 0) {
      console.log('Prediction not found: ' + fixture_id)
    }
    else  
      newData[nPrediction][att] = value
    setInputPredictionsData(newData)
  }
  
  const submitPredictions=(  )=>{
    let predictionsToSend = [...inputPredictionsData]
    predictionsToSend.forEach(p => {
    // inconsistent naming - save_predictions action requires home/away + predictor + fixture (all strings)
      p.fixture = p.fixture_id.toString()
      p.home = p.team_h_score.toString()
      p.away = p.team_a_score.toString()
      p.predictor = p.predictor_id
    })
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
        body: JSON.stringify(predictionsToSend)
      })
    }  
  }  
  const responseFacebook = (response) => {
    console.log(response);
    let strName = response.name
    if (strName !== undefined && response.accessToken) {
      let aNames = strName.split(" ")
      let strInitials = ""
      aNames.forEach(n => strInitials += n[0])
      setFacebookName(strName);
      setFacebookPicture(response.picture.data.url);
      setPredictorId(strInitials)
    }
  };
  const handleReloadData = () => {
    setStaticDataLoaded(true)
    loadBaseData()
  }
  const getResultsAggregate = () => {
    let aResults = fixtureData.filter(f => f.finished === true)
    let aAgg = aResults.reduce((prev, next) =>{
      if (prev[next.event] === undefined) {
        prev[next.event] = {"result":{"H":0, "D": 0, "A" : 0}, "odds":{"1":0, "2":0, "3":0}}
      }
      let nIndex = getResultIndex(next)
      prev[next.event].result[['H', 'D', 'A'][nIndex]]++
      let odds = oddsData.find(o => o.fixture_id === next.id)
      let resultOddsRank = rankOdds([odds.home, odds.draw, odds.away])[nIndex]
      prev[next.event].odds[resultOddsRank]++
      return prev;
    }, {});

    return aAgg
  }



    return (
    <div className="container">
        <DebugRouter silent basename="/FPL2021">
           <FPL2021Header isLoggedIn={isLoggedIn()} facebookName={facebookName} facebookPicture={facebookPicture} />
           <Content>
            {process.env.NODE_ENV !== 'development' && !isLoggedIn() &&
              <FacebookLogin
                appId={faceBookAppId}
                autoLoad={true}
                fields="name,email,picture"
                scope="public_profile"
                callback={responseFacebook}
                disableMobileRedirect={true}
                icon="fa-facebook" />
            }   
             { staticDataLoaded && weekNumber !== null &&
              <Switch>
                <Route exact path="/predictions">
                  <FPL2021Predictions 	
                    predictionsData={predictionsData} 
                    getProfit = {calculateFixtureProfit} 
                    predictors = {predictors}
                    getResultsAggregate = {getResultsAggregate}
                    /> 
                </Route>
                <Route exact path="/championship">
                  <FPL2021Championship 	teamStatsData={teamStatsData}
                    />
                </Route>
                <Route exact path="/input">
                  <FPL2021Input 	fixtureData={fixtureData.filter(f => f.event === weekNumber.input)}
                  predictor = {predictorId}
                    predictionsData={inputPredictionsData}
                    getTeam={getTeam}
                    getTeamStats={getTeamStats}
                    getSequenceByTeam={getSequenceByTeam}
                    getPreviousByFixture={getPreviousByFixture}
                    getOddsByFixture={getOddsByFixture}
                    submitPredictions={submitPredictions}
                    savePredictionData={savePredictionData}
                    />
                </Route>
                {predictorId === 'SE' &&
                <Route exact path="/admin">
                  <FPL2021Admin />
                </Route>
                }
                <Route path={["/", "/FPL2021"]}>
                  <FPL2021Home 	predictionsData={predictionsData}
                    predictors={predictors}
                    fixtureData={fixtureData}
                    getTeam={getTeam}
                    getOddsByFixture={getOddsByFixture}
                    currentWeek = {weekNumber.display}
                    handleReloadData = {handleReloadData}
                    /> 
                </Route>
              </Switch>
              }
              </Content>
          </DebugRouter>
     </div>
    );
}

export default App;

