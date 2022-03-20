const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();

let dbpath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDb = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => console.log("server is running"));
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

initializeDb();

const convertingToObject = (object) => {
  return {
    playerId: object.player_id,
    playerName: object.player_name,
  };
};

// Get all the players

app.get("/players/", async (request, response) => {
  let getPlayersQuery = `
    SELECT 
      *
    FROM 
      player_details`;

  let allPlayersFromDb = await db.all(getPlayersQuery);
  response.send(allPlayersFromDb.map((value) => convertingToObject(value)));
});

//Get player with Id

app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT 
      * 
    FROM 
      player_details
    WHERE 
      player_id = ${playerId}`;

  let playerFromDb = await db.get(getPlayerQuery);
  response.send(convertingToObject(playerFromDb));
});

//updating the player details

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayerQuery = `
  UPDATE
    player_details
  SET
    player_name ='${playerName}'
  WHERE
    player_id = ${playerId};`;

  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

const convertingMatchToObject = (object) => {
  return {
    matchId: object.match_id,
    match: object.match,
    year: object.year,
  };
};

//get match with match id
app.get("/matches/:matchId", async (request, response) => {
  const { matchId } = request.params;
  const getMatchQuery = `
    SELECT 
      * 
    FROM 
      match_details
    WHERE 
      match_id = ${matchId}`;

  let matchFromDb = await db.get(getMatchQuery);
  response.send(convertingMatchToObject(matchFromDb));
});

const convertingmatchIdObject = (object) => {
  return {
    playerId: object.player_id,
    playerName: object.player_name,
  };
};

//list of players from matchid

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  let getPlayerWithMatchQuery = `
    SELECT 
      player_id,player_name
    FROM 
      player_match_score NATURAL JOIN player_details
    WHERE 
      match_id = ${matchId}`;

  let PlayerWithFromDb = await db.all(getPlayerWithMatchQuery);
  response.send(
    PlayerWithFromDb.map((value) => convertingmatchIdObject(value))
  );
});

//list of matches from playerId

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  let getMatchWithPlayerQuery = `
    SELECT 
      *
    FROM 
      player_match_score NATURAL JOIN match_details
    WHERE 
      player_id = ${playerId}`;

  let matchWithFromDb = await db.all(getMatchWithPlayerQuery);
  response.send(matchWithFromDb.map((value) => convertingMatchToObject(value)));
});

const playersObject = (object) => {
  return {
    playerId: object.player_id,
    playerName: object.player_name,
    totalScore: object.totalScore,
    totalFours: object.totalFours,
    totalSixes: object.totalSixes,
  };
};

//total score of a particular player

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  let getplayerStatisticsQuery = `
    SELECT 
      player_id,player_name,
      SUM(score) AS totalScore,
      SUM(fours) AS totalFours,
      SUM(sixes) AS totalSixes
    FROM 
      player_match_score NATURAL JOIN player_details
    WHERE 
      player_id = ${playerId}`;

  let scoresFromDb = await db.get(getplayerStatisticsQuery);
  response.send(playersObject(scoresFromDb));
});

module.exports = app;
