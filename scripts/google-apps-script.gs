/**
 * Spain Move Tracker — Google Apps Script bridge.
 *
 * 1. Open the Google Sheet.
 * 2. Extensions > Apps Script.
 * 3. Replace the default script with this file.
 * 4. Project Settings > Script Properties > add:
 *      AUTH_USERNAME, AUTH_PASSWORD   (the website login, same values as before in Netlify)
 *      TRACKER_API_TOKEN              (optional; still accepted)
 * 5. Deploy > Manage deployments > edit the existing Web app > Version: New version > Deploy.
 *    (Editing the existing deployment keeps the same /exec URL.)
 *    Execute as: Me. Who has access: Anyone.
 * 6. The /exec URL goes in the GitHub repo variable SHEETS_WEBAPP_URL.
 */

const SHEETS = ["Checklist", "Timeline", "Sources", "Warnings", "Settings", "Uploads"];

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

// Accepts the website login (username + password) or the old API token.
function assertAuth_(p) {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty("TRACKER_API_TOKEN");
  const user = props.getProperty("AUTH_USERNAME");
  const pass = props.getProperty("AUTH_PASSWORD");
  if (token && p && p.token === token) return;
  if (user && pass && p && p.username === user && p.password === pass) return;
  throw new Error("Unauthorized");
}

function tableToObjects_(sheet) {
  const values = sheet.getDataRange().getDisplayValues();
  if (!values.length) return [];
  const headers = values[0];
  return values.slice(1).filter(row => row.some(Boolean)).map(row => {
    const out = {};
    headers.forEach((h, i) => out[h] = row[i]);
    return out;
  });
}

function readAll_() {
  const ss = SpreadsheetApp.getActive();
  const out = {};
  SHEETS.forEach(name => {
    const sheet = ss.getSheetByName(name);
    out[name.toLowerCase()] = sheet ? tableToObjects_(sheet) : [];
  });
  return out;
}

function doGet(e) {
  try {
    assertAuth_(e.parameter);
    return json_(readAll_());
  } catch (err) {
    return json_({ error: String(err && err.message ? err.message : err) });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");
    assertAuth_(body);
    const ss = SpreadsheetApp.getActive();

    // Read over POST so the password never goes in a URL.
    if (body.action === "read") {
      return json_(readAll_());
    }

    if (body.action === "updateItem") {
      const sheet = ss.getSheetByName("Checklist");
      const values = sheet.getDataRange().getValues();
      const headers = values[0].map(String);
      const idCol = headers.indexOf("id");
      const rowIndex = values.findIndex((row, idx) => idx > 0 && String(row[idCol]) === String(body.id));
      if (rowIndex < 1) throw new Error("Checklist item not found");

      const allowed = ["status", "notes", "validity", "recommendedLeadTime", "caution"];
      Object.entries(body.patch || {}).forEach(([key, value]) => {
        if (!allowed.includes(key)) return;
        const col = headers.indexOf(key);
        if (col >= 0) sheet.getRange(rowIndex + 1, col + 1).setValue(value);
      });
      SpreadsheetApp.flush();
      return json_({ ok: true });
    }

    if (body.action === "updateSetting") {
      const sheet = ss.getSheetByName("Settings");
      const values = sheet.getDataRange().getValues();
      const rowIndex = values.findIndex((row, idx) => idx > 0 && String(row[0]) === String(body.key));
      if (rowIndex < 1) throw new Error("Setting not found");
      sheet.getRange(rowIndex + 1, 2).setValue(body.value || "");
      SpreadsheetApp.flush();
      return json_({ ok: true });
    }

    if (body.action === "addUpload") {
      const sheet = ss.getSheetByName("Uploads");
      sheet.appendRow([
        body.item_id || "",
        body.file_name || "",
        body.drive_url || "",
        new Date(),
        body.notes || "",
      ]);
      SpreadsheetApp.flush();
      return json_({ ok: true });
    }

    throw new Error("Unknown action");
  } catch (err) {
    return json_({ error: String(err && err.message ? err.message : err) });
  }
}
