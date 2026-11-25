/**
 * Deposera booth games: shared leaderboard.
 * Paste this whole file into Extensions > Apps Script of a Google Sheet,
 * then deploy it as a Web app (see LEADERBOARD-SETUP.md).
 * Scores are saved in a sheet tab called "Scores".
 */

var SHEET_NAME = "Scores";
var HEADERS = ["Time", "Name", "Game", "Level", "Score", "Result", "Id"];
var MAX_SCORE = { spot: 4200, fair: 1500 };

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

// Everyone's scores (the newest 3000).
function doGet() {
  var sheet = getSheet_();
  var last = sheet.getLastRow();
  if (last < 2) return json_({ ok: true, scores: [] });
  var first = Math.max(2, last - 2999);
  var rows = sheet.getRange(first, 1, last - first + 1, HEADERS.length).getValues();
  var scores = rows.map(function (r) {
    return {
      t: r[0] instanceof Date ? r[0].getTime() : Date.parse(r[0]) || 0,
      name: String(r[1]),
      game: r[2] === "Fair or not?" ? "fair" : "spot",
      level: Number(r[3]) || 1,
      score: Number(r[4]) || 0,
      result: String(r[5]),
      id: String(r[6])
    };
  });
  return json_({ ok: true, scores: scores });
}

// Save one score sent by the game.
function doPost(e) {
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: "bad data" });
  }
  var game = data.game === "fair" ? "fair" : "spot";
  var name = String(data.name || "").replace(/[^\p{L}\p{N} .'-]/gu, "").replace(/\s+/g, " ").trim().slice(0, 16);
  var level = Math.min(3, Math.max(1, parseInt(data.level, 10) || 1));
  var score = Math.min(MAX_SCORE[game], Math.max(0, parseInt(data.score, 10) || 0));
  var result = String(data.result || "").slice(0, 60);
  var id = String(data.id || "").slice(0, 40);
  if (!name) return json_({ ok: false, error: "no name" });

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = getSheet_();
    // Ignore a score that was already saved (the game retries if the Wi-Fi drops).
    var last = sheet.getLastRow();
    if (id && last > 1) {
      var start = Math.max(2, last - 199);
      var ids = sheet.getRange(start, 7, last - start + 1, 1).getValues();
      for (var i = 0; i < ids.length; i++) {
        if (String(ids[i][0]) === id) return json_({ ok: true, duplicate: true });
      }
    }
    sheet.appendRow([new Date(), name, game === "fair" ? "Fair or not?" : "Spot the damage", level, score, result, id]);
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}
