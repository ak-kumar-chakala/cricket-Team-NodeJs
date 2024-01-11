const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const app = express();
app.use(express.json());

const intiliazeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3002, () => {
      console.log("server intialized");
    });
  } catch (e) {
    console.log(e.message);
  }
};

intiliazeDBAndServer();

app.get("/players/", async (request, response) => {
  let getPlayersQuery = `
    SELECT *
    FROM cricket_team
    ORDER BY player_id;`;

  let result = await db.all(getPlayersQuery);
  response.send(
    result.map((eachObject) => ({
      playerId: eachObject.player_id,
      playerName: eachObject.player_name,
      jerseyNumber: eachObject.jersey_number,
      role: eachObject.role,
    }))
  );
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const playerAddQuery = `
    INSERT INTO cricket_team(player_name,jersey_number,role)
    VALUES('${playerName}',${jerseyNumber},'${role}');`;

  await db.run(playerAddQuery);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const getPlayer = `
    SELECT *
    FROM cricket_team
    WHERE player_id=${playerId};`;
  const result = await db.get(getPlayer);
  response.send({
    playerId: result.player_id,
    playerName: result.player_name,
    jerseyNumber: result.jersey_number,
    role: result.role,
  });
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const updateQuery = `
    UPDATE cricket_team
    SET 
    player_name='${playerName}',
    jersey_number=${jerseyNumber},
    role='${role}'
    WHERE player_id=${playerId};`;
  await db.run(updateQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const DeleteQuery = `
    DELETE FROM cricket_team
    WHERE player_id=${playerId};`;

  await db.run(DeleteQuery);
  response.send("Player Removed");
});

module.exports = app;
