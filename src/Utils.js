const someCommonValues = ['common', 'values'];
 
export const capitalizeColumnName = (strColName)=>{
    var aParts = strColName.split("_");
    var aNewParts = [];
    aParts.forEach(element => aNewParts.push(element[0].toUpperCase() + element.slice(1)));
    return aNewParts.join(" ");
}

export const fieldValueConstant = (rows, field)=>{
    var value = rows[0][field];
    const found = rows.find(element => element[field] !== value);
    return found === undefined;
}

export const groupBy = (data, key) => { // `data` is an array of objects, `key` is the key (or property accessor) to group by
    // reduce runs this anonymous function on each element of `data` (the `item` parameter,
    // returning the `storage` parameter at the end
    return data.reduce(function(storage, item) {
      // get the first instance of the key by which we're grouping
      var group = item[key];
      
      // set storage for this instance of group to the outer scope (if not empty) or initialize it
      storage[group] = storage[group] || [];
      
      // add this item to its group within `storage`
      storage[group].push(item);
      
      // return the updated storage to the reduce function, which will then loop through the next 
      return storage; 
    }, {}); // {} is the initial value of the storage
  }
export const formatDate = (isoDate)=>{
    let date = new Date(isoDate)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
} 
export const formatDOWTime = (isoDate)=>{
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let date = new Date(isoDate)
    return days[date.getDay()] + ' ' + date.toLocaleTimeString().substr(0, 5)
} 
  export const getPredictionsColumns = ()=>{
    return [
        { "key": "event", "header": "Event"},
        { "key": "fixture_id", "header": "Fixture"},
        { "key": "predictor_id", "header": "Predictor"},
        { "key": "team_h_score", "header": "H"},
        { "key": "team_a_score", "header": "A"},
        { "key": "reason", "header": "Reason"},
        { "key": "correct_score", "header": "Correct"},
        { "key": "bonus_score", "header": "Bonus"},
    ];
    }

 export const getOddsColumns = ()=>{
    return [
        { "key": "fixture_id", "header": "Fixture"},
        { "key": "dsp_home", "header": "H"},
        { "key": "dsp_away", "header": "A"},
        { "key": "dsp_draw", "header": "D"}
    ];
    }

 export const getChampionshipColumns = ()=>{
    return [
        { "key": "name", "header": "Name"},
        { "key": "total_matches", "header": "#Matches"},
        { "key": "total_points", "header": "#Pts"},
        { "key": "total_xpts", "header": "#xPts"},
        { "key": "total_goals", "header": "#F"},
        { "key": "total_goals_conceded", "header": "#A"},
        { "key": "total_xg", "header": "#xF"},
        { "key": "total_vxg", "header": "#xA"},
        { "key": "total_shots", "header": "#Shots"},
        { "key": "total_target", "header": "#On Target"},
        { "key": "total_deep", "header": "#Deep"},
        { "key": "total_ppda", "header": "#PPDA"},
        { "key": "total_vshots", "header": "#Opponent Shots"},
        { "key": "total_vtarget", "header": "#Opponent On Target"},
        { "key": "total_vdeep", "header": "#Opponent Deep"},
        { "key": "total_vppda", "header": "#Opponent PPDA"},
        { "key": "total_possession", "header": "Possession"},
        { "key": "h_matches", "header": "#Matches"},
        { "key": "h_points", "header": "#Pts"},
        { "key": "h_xpts", "header": "#xPts"},
        { "key": "h_goals", "header": "#F"},
        { "key": "h_goals_conceded", "header": "#A"},
        { "key": "h_xg", "header": "#xF"},
        { "key": "h_vxg", "header": "#xA"},
        { "key": "h_shots", "header": "#Shots"},
        { "key": "h_target", "header": "#On Target"},
        { "key": "h_deep", "header": "#Deep"},
        { "key": "h_ppda", "header": "#PPDA"},
        { "key": "h_vshots", "header": "#Opponent Shots"},
        { "key": "h_vtarget", "header": "#Opponent On Target"},
        { "key": "h_vdeep", "header": "#Opponent Deep"},
        { "key": "h_vppda", "header": "#Opponent PPDA"},
        { "key": "h_possession", "header": "Possession"},
        { "key": "a_matches", "header": "#Matches"},
        { "key": "a_points", "header": "#Pts"},
        { "key": "a_xpts", "header": "#xG Pts"},
        { "key": "a_goals", "header": "#F"},
        { "key": "a_goals_conceded", "header": "#A"},
        { "key": "a_xg", "header": "#xF"},
        { "key": "a_vxg", "header": "#xA"},
        { "key": "a_shots", "header": "#Shots"},
        { "key": "a_target", "header": "#On Target"},
        { "key": "a_deep", "header": "#Deep"},
        { "key": "a_ppda", "header": "#PPDA"},
        { "key": "a_vshots", "header": "#Opponent Shots"},
        { "key": "a_vtarget", "header": "#Opponent On Target"},
        { "key": "a_vdeep", "header": "#Opponent Deep"},
        { "key": "a_vppda", "header": "#Opponent PPDA"},
        { "key": "a_possession", "header": "Possession"}
    ];
            }

    export const getFixtureColumns = ()=>{
        return [
            { "key": "event", "header": "Event"},
            { "key": "id", "header": "Fixture"},
            { "key": "kickoff_time", "header": "Start"},
            { "key": "team_h", "header": "Team H"},
            { "key": "team_a", "header": "Team A"},
            { "key": "team_h_score", "header": "Score H"},
            { "key": "team_a_score", "header": "Score A"},
        ];
    }
                        
    export const getTeamColumns = ()=>{
        return [
            { "key": "id", "header": "ID"},
            { "key": "code", "header": "Code"},
            { "key": "name", "header": "Name"},
            { "key": "short_name", "header": "Short Name"},
            { "key": "strength", "header": "Strength"},
            { "key": "strength_overall_home", "header": "Strength Home"},
            { "key": "strength_overall_away", "header": "Strength Away"},
            { "key": "strength_attack_home", "header": "Attack Home"},
            { "key": "strength_attack_away", "header": "Attack Away"},
            { "key": "strength_defence_home", "header": "Defence Home"},
            { "key": "strength_defence_away", "header": "Defence Away"},
        ];
    }
    
    export const getResultIndex = (obj) => {
        return (obj.team_h_score >= obj.team_a_score) ? ((obj.team_h_score === obj.team_a_score) ? 1 : 0): 2
    }

    export const rankArray = (arr, bAscending) => {

        let sorted = arr.slice().sort(function(a, b) {
            return bAscending ? (a - b) : (b - a)
          })
          let ranks = arr.slice().map(function(v) {
            return sorted.indexOf(v) + 1
          });

          return ranks
    }
  export const displayFixture = (f, numCols) => {
      let hteam = (numCols >= 3) ? f.team_h_name : f.team_h_short_name
      let ateam = (numCols >= 3) ? f.team_a_name : f.team_a_short_name
      return `${hteam}: ${f.team_h_score}\n${ateam}: ${f.team_a_score}`
  }

  export const avg=(total, count) => {
    return Math.round(total/count * 10)/10
  }
  