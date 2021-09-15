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
      bootstrap: './FPL2021/data/bootstrap-static.json',
      fixtures: './FPL2021/data/fixtures.json',
      predictions: './FPL2021/data/predictions.json',
      odds: './FPL2021/data/odds.json',
      sequence: './FPL2021/data/team_results_sequence_2021.json',
      previous: './FPL2021/data/team_previous_instances_2021.json',
      team_stats:{"0":"./FPL2021/data/team_stats_2021.json", "3":"./FPL2021/data/team_last3_stats_2021.json"}
    },
    server: {
      bootstrap: '/fpl/json/2021/bootstrap-static.json',
      fixtures: '/fpl/json/2021/fixtures.json',
      predictions: '/FPL/servlet/ENEFPLServlet?action=select_predictions&output=json&year=2021',
      odds: '/FPL/servlet/ENEFPLServlet?action=select_matchodds&output=json&year=2021',
      sequence: '/fpl/json/2021/team_results_sequence_2021.json',
      previous: '/fpl/json/2021/team_previous_instances_2021.json',
      team_stats:{"0":"/json/fpl/team_stats_2021.json", "3":"/json/fpl/team_last3_stats_2021.json"}
    },
  };
  
  const [bootstrapData, setBootstrapData] = useState(null);
  const [fixtureData, setFixtureData] = useState(null);
  const [teamStatsData, setTeamStatsData] = useState(null);
  const [predictionsData, setPredictionsData] = useState(null);
  const [oddsData, setOddsData] = useState(null);

  const retrieveURL = urlName => {
    return urls[process.env.NODE_ENV === 'development' ? 'mock' : 'server'][
      urlName
    ];
  };

  useEffect(() => {
    // initialise
    loadBaseData();
	},[]);

  const renderPage=( props )=>{
    const usePage = setSelectedPage( )
    return renderMEAStudent( usePage, local, library )
  }

  const renderMEAStudent=( page, isLocal, current )=>{

    console.log( "rendering page", page )

    window.scrollTo( 0, 0 )

    return (

      fixtureData &&
      <>
        {
          page === "championship" &&
          <FPL2021Championship 	teamStatsData={teamStatsData}
          saveTeamStats={setTeamStatsData}
          retrieveURL = {retrieveURL} />
        }
        {
          page === "predictions" &&
          <FPL2021Predictions 	predictionsData={predictionsData} oddsData={oddsData}
          savePredictions={setPredictionsData}
          saveOdds={setOddsData}
          retrieveURL = {retrieveURL} /> 
        }
      </>
    )
  }

  const setSelectedPage =()=>{
    let URLParams = new URLSearchParams( window.location.search )
    const useAction = URLParams.get( 'action' )
    const usePage = URLParams.get( 'content' )
    let filtered = mastheadL1.navigationL1.filter( item => item.to ? item.to.indexOf( usePage ) !== -1 : false )
    let newSelectedItem = filtered.length > 0 ? filtered[ 0 ].titleEnglish : null
    console.log( "selectedPage: " + selectedItem + "-" + newSelectedItem )
    if (useAction === 'student' && selectedItem !== newSelectedItem)
    {
      setSelectedItem( newSelectedItem )
    }
    return usePage;
  }
  const loadBaseData = () => {
    let urlRetrieveBootstrap = retrieveURL('bootstrap');
    let urlRetrieveFixtures = retrieveURL('fixtures');
    Promise.all([
      fetch(urlRetrieveBootstrap).then(response => response.json()),
      fetch(urlRetrieveFixtures).then(response => response.json())
    ]).then(jsonData => {
      setBootstrapData(jsonData[0].data);
      setFixtureData(jsonData[1].data);
    });
  };

    return (
    <div className="container">
       {fixtureData !== null &&
        <Content>
        <DebugRouter silent>
           <FPL2021Header />
              <Switch>
                <Route exact path="/FPL2021/predictions">
                  <FPL2021Predictions 	predictionsData={predictionsData} oddsData={oddsData}
                    savePredictions={setPredictionsData}
                    saveOdds={setOddsData}
                    retrieveURL = {retrieveURL} /> 
                </Route>
                <Route exact path="/FPL2021/championship">
                  <FPL2021Championship 	teamStatsData={teamStatsData}
                    saveTeamStats={setTeamStatsData}
                    retrieveURL = {retrieveURL} />
                </Route>
              </Switch>
          </DebugRouter>
        </Content>
      }
    </div>
    );
}

export default App;

