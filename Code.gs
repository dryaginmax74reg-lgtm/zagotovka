// Запустите setupHousehold один раз из Apps Script, привязанного к таблице.
function setupHousehold() {
  const props = PropertiesService.getScriptProperties();
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error('Откройте Apps Script из нужной Google Таблицы.');
  props.setProperty('HOUSEHOLD_SHEET', spreadsheet.getId());
  if (!props.getProperty('HOUSEHOLD_CODE')) {
    props.setProperty('HOUSEHOLD_CODE', Utilities.getUuid().replace(/-/g, ''));
  }
  if (!props.getProperty('BETA_CREATE_CODE')) {
    props.setProperty('BETA_CREATE_CODE', Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, ''));
  }
}

// После публикации запустите showBetaLink. Ссылка с правом создания планов появится в журнале.
function showBetaLink() {
  const u = ScriptApp.getService().getUrl();
  const c = PropertiesService.getScriptProperties().getProperty('BETA_CREATE_CODE');
  if (!u || !u.endsWith('/exec') || !c) throw new Error('Сначала запустите setupHousehold и разверните веб-приложение.');
  const invite = Utilities.base64Encode(JSON.stringify({u,c}));
  Logger.log('https://dryaginmax74reg-lgtm.github.io/zagotovka/#h=' + invite);
}

function doGet(event) {
  return householdRequest(event, false);
}

function doPost(event) {
  return householdRequest(event, true);
}

function householdRequest(event, write) {
  const reply = data => ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  try {
    const request = write ? JSON.parse(event.postData.contents) : event.parameter;
    const props = PropertiesService.getScriptProperties();
    const action = request.action;
    const beta = action === 'create' || action === 'pull' || action === 'push';
    let sheetName = 'HouseholdSync';
    if (beta) {
      if (!write || typeof request.c !== 'string' || !/^[a-f0-9]{64}$/.test(request.c))
        return reply({ok:false,error:'access'});
      const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, request.c);
      sheetName = 'Family_' + digest.map(b => ((b + 256) % 256).toString(16).padStart(2,'0')).join('');
    } else {
      const secret = props.getProperty('HOUSEHOLD_CODE');
      if (!secret || request.c !== secret) return reply({ok: false, error: 'access'});
    }
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const book = SpreadsheetApp.openById(props.getProperty('HOUSEHOLD_SHEET'));
      let sheet = book.getSheetByName(sheetName);
      if (beta && action !== 'create' && !sheet) return reply({ok:false,error:'access'});
      if (action === 'create' && sheet?.getLastRow()) return reply({ok:true});
      if (action === 'create' && !sheet && book.getSheets().filter(s => s.getName().startsWith('Family_')).length >= 25)
        return reply({ok:false,error:'capacity'});
      const count = sheet ? sheet.getLastRow() : 0;
      const rows = count ? sheet.getRange(1, 1, count, 5).getValues() : [];
      if (!write || action === 'pull') {
        const since = Math.max(0, Number(request.since) || 0);
        return reply({ok: true, rows: rows.filter(row => row[2] > since)
          .map(([k,v,st,d,u]) => ({k,v,st,d:!!d,u}))});
      }
      if (!Array.isArray(request.set) || request.set.length > 2000 || (action === 'create' &&
        !['cook','bf'].every(key => request.set.some(row => row.k === key && !row.d))))
        return reply({ok: false, error: 'invalid batch'});
      const keys = new Map(rows.map(([k], i) => [k, i]));
      const stamp = Math.max(Date.now(), rows.reduce((n,row) => Math.max(n,row[2]),0) + 1);
      const author = typeof request.u === 'string' && /^(m|d|p[2-7])$/.test(request.u) ? request.u : '';
      const updates = [];
      for (const {k,v,d} of request.set) {
        if (typeof k !== 'string' || !/^[A-Za-z][A-Za-z0-9]*(?:\|[^|\r\n]+)?$/.test(k) || k.length > 256)
          return reply({ok: false, error: 'invalid key'});
        if (!d) {
          if (typeof v !== 'string' || v.length >= 45000) return reply({ok: false, error: 'invalid value'});
          JSON.parse(v);
        }
        if (!keys.has(k)) keys.set(k, rows.length);
        rows[keys.get(k)] = [k,d?'':v,stamp,d?1:0,author];
        updates.push({k,st:stamp});
      }
      if (rows.length) {
        sheet = sheet || book.insertSheet(sheetName);
        if (rows.length > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(), rows.length - sheet.getMaxRows());
        sheet.getRange(1, 1, rows.length, 5).setValues(rows);
      }
      SpreadsheetApp.flush();
      return reply({ok:true,st:updates});
    } finally {
      lock.releaseLock();
    }
  } catch (_) {
    return reply({ok:false,error:'storage'});
  }
}
