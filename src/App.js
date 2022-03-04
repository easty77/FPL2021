import React, { useState, useEffect } from 'react';
import {Content} from 'carbon-components-react';
import {HashRouter, Switch, Route} from 'react-router-dom';
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
import {getResultIndex, rankArray, avg} from './Utils.js';

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
  const [numCols, setNumCols] = useState(5);
  const [predictorId, setPredictorId] = useState(null);
  const [weekNumber, setWeekNumber] = useState(null);
  const [staticDataLoaded, setStaticDataLoaded] = useState(false);

  const [eventsData, setEventsData] = useState(null);
  const [teamsData, setTeamsData] = useState(null);
  const [fixtureData, setFixtureData] = useState(null);
  const [teamStatsData, setTeamStatsData] = useState(null);
  const [predictionsData, setPredictionsData] = useState(null);
  const [inputPredictionsData, setInputPredictionsData] = useState(null);
  const [oddsData, setOddsData] = useState(null);
  const [previousInstanceData, setPreviousInstanceData] = useState(null);
  const [resultsSequenceData, setResultsSequenceData] = useState(null);
  const [inputWeekData, setInputWeekData] = useState(null);

  const retrieveURL = urlName => {
    return urls[process.env.NODE_ENV === 'development' ? 'mock' : 'server'][
      urlName
    ];
  };

  const getNumCols=()=>{

    if( document.documentElement.clientWidth < 672 ){
      return 1
    } else if( document.documentElement.clientWidth < 1056 ){
      return 2
    } else if( document.documentElement.clientWidth < 1312 ){
      return 3
    } else if( document.documentElement.clientWidth < 1584 ){
      return 4
    }
    else return 5
  }


  useEffect(() => {
    // initialise
    console.log('App:useEffect initialise')
    loadBaseData();
    const handleResize = () =>{ 
      setNumCols( getNumCols( ))
    }
    window.removeEventListener( "resize", handleResize )
    window.addEventListener( "resize", handleResize )
    if( document.getElementById("loading_overlay") !== null ) document.getElementById("loading_overlay").remove()
    return (()=>{
      window.removeEventListener( "resize", handleResize )
    })
	},[]);

  useEffect(() => {
    console.log('App:useEffect predictions')
    if (predictionsData !== null && weekNumber !== null) {
      loadInputPredictionsData()
    }
  },[predictorId, predictionsData, weekNumber]);

  useEffect(() => {
    console.log('App:useEffect input data')
    if (inputWeekData === null && fixtureData !== null && weekNumber !== null) {
      let aRows = []
      let aFixtures = fixtureData.filter(f => f.event === weekNumber.input)
      aFixtures.forEach(f => {
        let home = getTeam(f.team_h)
        let away = getTeam(f.team_a)
        let odds = getOddsByFixture(f.id)
        let previous = getPreviousByFixture(f.id)
        let hsequence = getSequenceByTeam(f.team_h)
        let asequence = getSequenceByTeam(f.team_a)
        let hstats = getTeamStats(f.team_h)
        let astats = getTeamStats(f.team_a)
        let row = {"id":f.id, "date":f.kickoff_time, 
        "teams":{
            "home": {"name": home.name, "short_name" : home.short_name}, 
            "away": {"name": away.name, "short_name" : away.short_name}
          },
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
        "rank":{"home": {}, "away": {}},
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
        "prediction": {"id":f.id, "kickoff_time":f.kickoff_time},// just a placeholder to retrieve prediction dynamically in Input component,
        "reason": {"id":f.id, "kickoff_time":f.kickoff_time} // just a placeholder to retrieve prediction dynamically in Input component
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
          // this is a home team so store home attributes as ha  (so can be displayed in ha mode)
          for (let s in astats[att].rank) {
            if (s.indexOf("h_") === 0) {
              hstats[att].rank[s.replace("h_", "ha_")] = hstats[att].rank[s]
            }
          }
          row.rank.home[att] = hstats[att].rank
          row.rank.home[att].id = f.team_h
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
          // this is a away team so store away attributes as ha  (so can be displayed in ha mode)
          for (let s in astats[att].rank) {
            if (s.indexOf("a_") === 0) {
              astats[att].rank[s.replace("a_", "ha_")] = astats[att].rank[s]
            }
          }
          row.rank.away[att] = astats[att].rank
          row.rank.away[att].id = f.team_a
        }  
        for (let att in astats) {
          let count = {"total":{"home":0, "away": 0}, "ha":{"home":0, "away": 0}};
          for (let dim in row.rank.home[att]) {
              if (dim.indexOf("total_") === 0) {
                if (row.rank.home[att][dim] < row.rank.away[att][dim]) {
                  count.total.home++
                }
                else if (row.rank.home[att][dim] > row.rank.away[att][dim]) {
                  count.total.away++
                }
              }
              else if (dim.indexOf("h_") === 0) {
                if (row.rank.home[att][dim] < row.rank.away[att][dim.replace("h_", "a_")]) {
                  count.ha.home++
                }
                else if (row.rank.home[att][dim] > row.rank.away[att][dim.replace("h_", "a_")]) {
                  count.ha.away++
                }
              }
          }
          row.rank[att] = count
        }
          aRows.push(row)
    })
    setInputWeekData(aRows)
  }
  },[fixtureData, weekNumber]);

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
  const getFixture=( fixture_id )=>{
    return fixtureData.find(f=> f.id === fixture_id)
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
          let eventFixtures = aFixtures.filter(f => f.event === nEvent)
          eventFixtures.forEach(f => {
            let hteam = aTeams.find(t => t.id === f.team_h.toString())
            let ateam = aTeams.find(t => t.id === f.team_a.toString())
            f.team_h_name = hteam.name
            f.team_a_name = ateam.name
            f.team_h_short_name = hteam.short_name
            f.team_a_short_name = ateam.short_name
          })
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
              item.rank = {}
          });

          let aTeamStatsCopy = JSON.parse(JSON.stringify(aTeamStats)) // take deep copy to use for sorting
          let aTypes = ['total', 'h', 'a'];
          aTypes.forEach(t => {
            aTeamStatsCopy = aTeamStatsCopy.sort(function(a, b){return (b[t + '_points']*1000 + ((b[t + '_goals'] - b[t + '_goals_conceded']) * 10) + b[t + '_goals']) - (a[t + '_points']*1000 + ((a[t + '_goals'] - a[t + '_goals_conceded']) * 10) + a[t + '_goals'])});

            aTeamStats.forEach(item => {
              item.rank[t + '_league_position'] = aTeamStatsCopy.findIndex(p => p.id === item.id) + 1;
            });
          });

          let aPositive = ['points', 'deep', 'goals', 'xg', 'xpts', 'possession', 'vppda', 'shots', 'target'];
          let aNegative= ['vdeep', 'goals_conceded', 'vxg', 'ppda', 'vshots', 'vtarget'];
          aTypes.forEach(t => {
            aPositive.forEach(p => {
              // check if already a game average
              if (p !== 'possession' && p !== 'deep' && p !== 'vppda') {
                aTeamStatsCopy.sort(function(a, b){return b[t + '_' + p]/b[t + '_matches']- a[t + '_' + p]/a[t + '_matches']});
              }
              else {
                aTeamStatsCopy.sort(function(a, b){return b[t + '_' + p]- a[t + '_' + p]});
              }
              aTeamStats.forEach(item => {
                item.rank[t + '_' + p] = aTeamStatsCopy.findIndex(c => c.id === item.id) + 1;
                if (u==="3" && t === 'total' && p === 'xpts')
                  console.log(item.name + '=' + item.rank.total_xpts + "-" + item.total_xpts + "-" + item.total_xpts/item.total_matches)
              });
            });
            aNegative.forEach(n => {
              // check if already a game average
              if (n !== 'vdeep' && n !== 'ppda') {
                aTeamStatsCopy.sort(function(a, b){return a[t + '_' + n]/a[t + '_matches'] - b[t + '_' + n]/b[t + '_matches']});
              }
              else {
                aTeamStatsCopy.sort(function(a, b){return a[t + '_' + n] - b[t + '_' + n]});
              }
              aTeamStats.forEach(item => {
                item.rank[t + '_' + n] = aTeamStatsCopy.findIndex(c => c.id === item.id) + 1;
              });
            });
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
         if (p.correct_score !== undefined && p.bonus_score !== undefined) {
          p.total_score = 3 * p.correct_score + p.bonus_score
         }
         p.result = ['H', 'D', 'A'][getResultIndex(p)]
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
       setNumCols(getNumCols())
      setStaticDataLoaded(true)
      console.log('events, teams & fixtures loaded')
    });
  };
  const isLoggedIn=()=> {
    return predictorId !== null
  }
  function rankOdds(arr) {
     return rankArray(arr, true).join('');
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
        <HashRouter silent basename="">
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
                    numCols={numCols}
                    /> 
                </Route>
                <Route exact path="/championship">
                  <FPL2021Championship 	teamStatsData={teamStatsData}
                    />
                </Route>
                <Route exact path="/input">
                  <FPL2021Input 	inputWeekData={inputWeekData}
                    predictionsData={inputPredictionsData}
                    getTeam={getTeam}
                    getTeamStats={getTeamStats}
                    getSequenceByTeam={getSequenceByTeam}
                    getPreviousByFixture={getPreviousByFixture}
                    getOddsByFixture={getOddsByFixture}
                    submitPredictions={submitPredictions}
                    savePredictionData={savePredictionData}
                    getFixture={getFixture}
                    numCols={numCols}
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
                    numCols={numCols}
                    /> 
                </Route>
              </Switch>
              }
              </Content>
          </HashRouter>
     </div>
    );
}

export default App;

