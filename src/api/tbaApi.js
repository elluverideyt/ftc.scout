const username = "elluveride";
const authToken = "D49FE5AA-31B0-49D6-AEB3-24B7A32078D6";
const baseUrl = "https://ftc-events.firstinspires.org";

// Create a Basic Auth header value (in browsers use btoa; in Node use Buffer)
const basicAuth = "Basic " + btoa(`${username}:${authToken}`);

// Allow qualification and playoffs matches for the FIRST API
const getMatchInfo = async (matchNumber, matchLevel, currentEventKey) => {
  if (!["qualification", "playoffs"].includes(matchLevel)) {
    throw new Error("Match level not supported");
  }
  // Construct match key following the existing convention – adjust if needed
  const matchKey = `${currentEventKey}_qm${matchNumber}`;
  // Adjust the endpoint path if the FIRST API endpoint differs
  const url = `${baseUrl}/api/match/${matchKey}`;
  
  const rawMatchData = await fetch(url, {
    headers: {
      "Authorization": basicAuth
    },
  });
  
  if (rawMatchData.status === 404) {
    throw new Error("Match not found");
  }
  
  const matchData = await rawMatchData.json();
  return matchData;
};

const getAllianceFromMatch = (matchData, alliance) => {
  const allianceData = matchData.alliances[alliance];
  const teamKeys = allianceData.team_keys;
  // Assuming FIRST API team keys use a prefix such as "ftc" that we remove
  return teamKeys.map((teamKey) => {
    return parseInt(teamKey.replace(/^ftc/, ""));
  });
};

const getTeamFromMatch = (matchData, alliance, teamIndex) => {
  const allianceData = matchData.alliances[alliance];
  const teamKey = allianceData.team_keys[teamIndex];
  return parseInt(teamKey.replace(/^ftc/, ""));
};

export const getTeamNumberFromMatchInfo = async (
  matchNumber,
  matchLevel,
  alliance,
  teamIndex,
  currentEventKey
) => {
  const matchData = await getMatchInfo(matchNumber, matchLevel, currentEventKey);
  return getTeamFromMatch(matchData, alliance, teamIndex);
};

export const getAllianceNumbersFromMatchInfo = async (
  matchNumber,
  matchLevel,
  alliance,
  currentEventKey
) => {
  const matchData = await getMatchInfo(matchNumber, matchLevel, currentEventKey);
  return getAllianceFromMatch(matchData, alliance);
};
