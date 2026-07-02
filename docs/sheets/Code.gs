/**
 * 평촌 한가람 A-5구역 동의율 모니터링 - Apps Script
 *
 * [시트 구성 — 6개 탭]
 *  · 현황파악 : 동의율 + 의향(통합/제자리, 신탁/조합) 실시간 집계
 *  · 한양/삼성/두산 : 아파트 동·호별 한 줄
 *  · 상가     : 단지별 상가 한 줄 (A열=단지)
 *  · 단지정보 : 기본정보 + 공부상 세대수 + 동별 층수·라인수
 *
 * 각 세대 행의 입력 항목:
 *   동의(체크박스) · 통합/제자리(택1) · 신탁/조합(택1)
 *
 * [사용 순서]
 *  1) 확장 프로그램 > Apps Script > 이 코드 전체 붙여넣기 > 저장
 *  2) [setup] 실행 (예전 버전 썼으면 [재설정] 실행 → 현황파악/상가 갱신)
 *  3) 기존 시트가 구버전 열이면 [동의칸수정] 실행 → 열/드롭다운/요약 갱신
 *  4) 단지정보 [동별 구성]에 층수·라인수 입력 → [호생성]
 *  5) 배포 > 새 배포 > 웹 앱(실행:나 / 액세스:모든 사용자)
 *
 *  ※ 개인정보(이름/연락처)는 어떤 탭에도 입력하지 않는다.
 */

var DANJI = ['한양', '삼성', '두산'];
var SANGGA = '상가';
var OPT1 = ['통합', '제자리'];
var OPT2 = ['신탁', '조합'];
var HEADER_APT = ['동', '호', '동의', '통합/제자리', '신탁/조합', '동의일자', '비고'];
var HEADER_SG = ['단지', '호', '동의', '통합/제자리', '신탁/조합', '동의일자', '비고'];
var NCOL = 7; // 데이터 열 수

var DANJI_MAP = {
  '한양': { 동: [301, 302, 303, 304, 305, 306, 307, 308], 세대수: 952 },
  '삼성': { 동: [201, 202, 203, 204, 205, 206, 207, 208, 209, 210], 세대수: 708 },
  '두산': { 동: [101, 102, 103, 104, 105, 106], 세대수: 436 },
};

/* ========================= 셋업 ========================= */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  setup_단지정보(ss);
  DANJI.forEach(function (name) { setup_단지시트(ss, name); });
  setup_상가시트(ss);
  setup_현황파악(ss);

  ['현황파악', '한양', '삼성', '두산', '상가', '단지정보'].forEach(function (n, i) {
    var sh = ss.getSheetByName(n);
    if (sh) { ss.setActiveSheet(sh); ss.moveActiveSheet(i + 1); }
  });
  ['시트1', 'Sheet1'].forEach(function (n) {
    var sh = ss.getSheetByName(n);
    if (sh && ss.getSheets().length > 1 && sh.getLastRow() === 0) ss.deleteSheet(sh);
  });
  ss.setActiveSheet(ss.getSheetByName('현황파악'));
  ss.toast('setup 완료. 단지정보에 층수·라인수 입력 후 [호생성] 실행', '✅', 8);
}

/** 예전 setup 이후 구조 변경 시: 현황파악/상가만 재생성(나머지 보존) */
function 재설정() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var old = ss.getSheetByName('현황파악');
  if (old) ss.deleteSheet(old);
  setup();
}

function setup_단지정보(ss) {
  if (ss.getSheetByName('단지정보')) return;
  var sh = ss.insertSheet('단지정보');

  var info = [
    ['키', '값', '설명'],
    ['구역명', '평촌 한가람 A-5구역', '헤더 표기'],
    ['주체', '주민대표단', '헤더 표기'],
    ['접수마감', '2026-07-29', 'D-day 계산 기준(YYYY-MM-DD)'],
    ['최소목표', 0.5, '과반 50% 마커'],
    ['최종목표', 0.81, '목표 81% 마커(선정 기준)'],
    ['상가포함', 'TRUE', '전체 동의율에 상가 세대 합산 여부'],
    ['단지순서', '한양,삼성,두산', '화면 정렬 순서'],
    ['마지막갱신', '', 'API 호출 시 자동 기록'],
  ];
  sh.getRange(1, 1, info.length, 3).setValues(info);

  var r0 = info.length + 2;
  sh.getRange(r0, 1).setValue('■ 단지별 공부상 세대수 (분모 기준)').setFontWeight('bold');
  var danjiTbl = [['단지', '아파트세대수', '상가세대수']];
  DANJI.forEach(function (n) { danjiTbl.push([n, DANJI_MAP[n].세대수, '']); });
  sh.getRange(r0 + 1, 1, danjiTbl.length, 3).setValues(danjiTbl);

  var r1 = r0 + danjiTbl.length + 2;
  sh.getRange(r1, 1).setValue('■ 동별 구성 (층수·라인수 입력 후 [호생성] · 아파트만)').setFontWeight('bold');
  var head = ['단지', '동', '층수', '라인수(호/층)', '비고'];
  var body = [head];
  DANJI.forEach(function (n) { DANJI_MAP[n].동.forEach(function (d) { body.push([n, d, '', '', '']); }); });
  var start = r1 + 1;
  sh.getRange(start, 1, body.length, head.length).setValues(body);
  sh.getRange(r1, 5).setValue('CONFIG_START:' + start);

  sh.getRange(1, 1, 1, 3).setFontWeight('bold');
  sh.getRange(r0 + 1, 1, 1, 3).setFontWeight('bold');
  sh.getRange(start, 1, 1, head.length).setFontWeight('bold');
  sh.setColumnWidth(1, 90); sh.setColumnWidth(2, 90);
  sh.setColumnWidth(3, 70); sh.setColumnWidth(4, 120); sh.setColumnWidth(5, 300);
  sh.setFrozenRows(1);
}

function setup_단지시트(ss, name) {
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sh.getLastRow() > 0) return;
  sh.getRange(1, 1, 1, NCOL).setValues([HEADER_APT]).setFontWeight('bold');
  단지시트_서식(sh);
  setup_요약(sh, 세대수공식(name));
  applyCheckboxDropdownFilter(sh);
}

function setup_상가시트(ss) {
  var sh = ss.getSheetByName(SANGGA) || ss.insertSheet(SANGGA);
  if (sh.getLastRow() > 0) return;
  sh.getRange(1, 1, 1, NCOL).setValues([HEADER_SG]).setFontWeight('bold');
  sh.getRange('A1').setNote('상가: A열에 단지 이름(한양/삼성/두산) 입력. 드롭다운 사용');
  단지시트_서식(sh);
  // A열 단지 드롭다운
  sh.getRange('A2:A1000').setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(DANJI, true).setAllowInvalid(false).build());
  setup_요약(sh, 세대수공식(SANGGA));
  applyCheckboxDropdownFilter(sh);
}

function 단지시트_서식(sh) {
  sh.getRange('C1').setNote('동의: 체크박스 클릭(또는 스페이스바). 글자 입력 금지');
  sh.getRange('D1').setNote('통합/제자리 중 택1 (드롭다운)');
  sh.getRange('E1').setNote('신탁/조합 중 택1 (드롭다운)');
  sh.setColumnWidth(1, 75); sh.setColumnWidth(2, 80); sh.setColumnWidth(3, 55);
  sh.setColumnWidth(4, 100); sh.setColumnWidth(5, 90); sh.setColumnWidth(6, 110); sh.setColumnWidth(7, 160);
  sh.setFrozenRows(1);
}

/** H1:I3 요약(총세대수/동의수/동의율) */
function setup_요약(sh, 세대수Formula) {
  sh.getRange('H1').setValue('총 세대수').setFontWeight('bold');
  sh.getRange('H2').setValue('동의 수').setFontWeight('bold');
  sh.getRange('H3').setValue('동의율').setFontWeight('bold');
  sh.getRange('I1').setFormula(세대수Formula);
  sh.getRange('I2').setFormula('=COUNTIF(C2:C,TRUE)');
  sh.getRange('I3').setFormula('=IF(I1>0,I2/I1,"")').setNumberFormat('0.0%');
  sh.setColumnWidth(8, 90); sh.setColumnWidth(9, 120);
}

/** 시트별 '총세대수' 고정 분모 수식 */
function 세대수공식(name) {
  if (name === SANGGA)
    return '=IFERROR(VLOOKUP("한양",단지정보!A:C,3,FALSE),0)+IFERROR(VLOOKUP("삼성",단지정보!A:C,3,FALSE),0)+IFERROR(VLOOKUP("두산",단지정보!A:C,3,FALSE),0)';
  return '=IFERROR(VLOOKUP("' + name + '",단지정보!A:C,2,FALSE),0)+IFERROR(VLOOKUP("' + name + '",단지정보!A:C,3,FALSE),0)';
}

/** C열 체크박스 + D/E 드롭다운 + A1:G 기본필터 */
function applyCheckboxDropdownFilter(sh) {
  sh.getRange('C2:C1000').insertCheckboxes();
  sh.getRange('D2:D1000').setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(OPT1, true).setAllowInvalid(false).build());
  sh.getRange('E2:E1000').setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(OPT2, true).setAllowInvalid(false).build());
  var f = sh.getFilter();
  if (f) f.remove();
  sh.getRange('A1:G1000').createFilter();
}

function setup_현황파악(ss) {
  if (ss.getSheetByName('현황파악')) return;
  var sh = ss.insertSheet('현황파악');

  sh.getRange('A1').setValue('평촌 한가람 A-5구역 · 동의 현황 (자동 집계)').setFontWeight('bold').setFontSize(14);
  // 접수마감을 키로 조회(절대위치 B4 대신) → 단지정보 행 이동에도 안전
  sh.getRange('A2').setFormula('=LET(m,DATEVALUE(VLOOKUP("접수마감",단지정보!A:B,2,FALSE)),"마감 "&TEXT(m,"yyyy-mm-dd")&" · D-"&(m-TODAY())&" · 수식 실시간 집계")');

  /* ── ① 단지별 동의 현황 (행 4~9) ── */
  sh.getRange('A4').setValue('■ 단지별 동의 현황 (아파트+상가 합산)').setFontWeight('bold');
  sh.getRange(5, 1, 1, 4).setValues([['구분', '세대수', '동의수', '동의율']]).setFontWeight('bold');
  sh.getRange('A6').setValue('전체');
  sh.getRange('B6').setFormula('=SUM(B7:B9)');
  sh.getRange('C6').setFormula('=SUM(C7:C9)');
  sh.getRange('D6').setFormula('=IF(B6>0,C6/B6,"")').setNumberFormat('0.0%');
  DANJI.forEach(function (n, i) {
    var r = 7 + i;
    sh.getRange(r, 1).setValue(n);
    sh.getRange(r, 2).setFormula('=IFERROR(VLOOKUP("' + n + '",단지정보!A:C,2,FALSE),0)+IFERROR(VLOOKUP("' + n + '",단지정보!A:C,3,FALSE),0)');
    sh.getRange(r, 3).setFormula('=COUNTIF(' + n + '!C2:C,TRUE)+COUNTIFS(상가!A:A,"' + n + '",상가!C:C,TRUE)');
    sh.getRange(r, 4).setFormula('=IF(B' + r + '>0,C' + r + '/B' + r + ',"")').setNumberFormat('0.0%');
  });
  sh.getRange('A6:A9').setFontWeight('bold');

  /* ── ② 의향 집계 (통합/제자리, 신탁/조합) 행 11~16 ── */
  sh.getRange('A11').setValue('■ 의향 집계 (응답 세대 기준 · 통합/제자리 · 신탁/조합)').setFontWeight('bold');
  sh.getRange(12, 1, 1, 9).setValues([['단지', '통합', '제자리', '통합%', '제자리%', '신탁', '조합', '신탁%', '조합%']]).setFontWeight('bold');

  // 전체(행13) = 단지 합
  sh.getRange('A13').setValue('전체').setFontWeight('bold');
  sh.getRange('B13').setFormula('=SUM(B14:B16)');
  sh.getRange('C13').setFormula('=SUM(C14:C16)');
  sh.getRange('F13').setFormula('=SUM(F14:F16)');
  sh.getRange('G13').setFormula('=SUM(G14:G16)');
  의향비율수식(sh, 13);

  DANJI.forEach(function (n, i) {
    var r = 14 + i;
    sh.getRange(r, 1).setValue(n);
    sh.getRange(r, 2).setFormula('=COUNTIF(' + n + '!D2:D,"통합")+COUNTIFS(상가!A:A,"' + n + '",상가!D:D,"통합")');
    sh.getRange(r, 3).setFormula('=COUNTIF(' + n + '!D2:D,"제자리")+COUNTIFS(상가!A:A,"' + n + '",상가!D:D,"제자리")');
    sh.getRange(r, 6).setFormula('=COUNTIF(' + n + '!E2:E,"신탁")+COUNTIFS(상가!A:A,"' + n + '",상가!E:E,"신탁")');
    sh.getRange(r, 7).setFormula('=COUNTIF(' + n + '!E2:E,"조합")+COUNTIFS(상가!A:A,"' + n + '",상가!E:E,"조합")');
    의향비율수식(sh, r);
  });

  /* ── ③ 동별 상세 (행 18~) ── */
  var base = 18;
  sh.getRange(base, 1).setValue('■ 동별 상세').setFontWeight('bold');
  sh.getRange(base + 1, 1, 1, 6).setValues([['단지', '구분', '동', '세대수', '동의수', '동의율']]).setFontWeight('bold');

  var rows = [];
  DANJI.forEach(function (n) {
    DANJI_MAP[n].동.forEach(function (d) { rows.push([n, '아파트', d]); });
    rows.push([n, '상가', '상가']);
  });
  var r0 = base + 2;
  for (var i = 0; i < rows.length; i++) {
    var r = r0 + i;
    var isSangga = rows[i][1] === '상가';
    sh.getRange(r, 1, 1, 3).setValues([rows[i]]);
    if (isSangga) {
      sh.getRange(r, 4).setFormula('=IFERROR(VLOOKUP($A' + r + ',단지정보!A:C,3,FALSE),"")');
      sh.getRange(r, 5).setFormula('=COUNTIFS(상가!A:A,$A' + r + ',상가!C:C,TRUE)');
    } else {
      var 층 = 'SUMIFS(단지정보!C:C,단지정보!A:A,$A' + r + ',단지정보!B:B,$C' + r + ')';
      var 라인 = 'SUMIFS(단지정보!D:D,단지정보!A:A,$A' + r + ',단지정보!B:B,$C' + r + ')';
      sh.getRange(r, 4).setFormula('=IF(' + 층 + '*' + 라인 + '>0,' + 층 + '*' + 라인 + ',"")');
      sh.getRange(r, 5).setFormula('=COUNTIFS(INDIRECT($A' + r + '&"!A:A"),$C' + r + ',INDIRECT($A' + r + '&"!C:C"),TRUE)');
    }
    sh.getRange(r, 6).setFormula('=IF(N(D' + r + ')>0,E' + r + '/D' + r + ',"")').setNumberFormat('0.0%');
  }
  [70, 70, 70, 80, 80, 80, 60, 60, 60].forEach(function (w, i) { sh.setColumnWidth(i + 1, w); });
  sh.setFrozenRows(1);
}

/** 통합%/제자리%(D,E) · 신탁%/조합%(H,I) 비율 수식 */
function 의향비율수식(sh, r) {
  sh.getRange(r, 4).setFormula('=IF(B' + r + '+C' + r + '>0,B' + r + '/(B' + r + '+C' + r + '),"")').setNumberFormat('0.0%');
  sh.getRange(r, 5).setFormula('=IF(B' + r + '+C' + r + '>0,C' + r + '/(B' + r + '+C' + r + '),"")').setNumberFormat('0.0%');
  sh.getRange(r, 8).setFormula('=IF(F' + r + '+G' + r + '>0,F' + r + '/(F' + r + '+G' + r + '),"")').setNumberFormat('0.0%');
  sh.getRange(r, 9).setFormula('=IF(F' + r + '+G' + r + '>0,G' + r + '/(F' + r + '+G' + r + '),"")').setNumberFormat('0.0%');
}

/* ============== 호 자동생성 (아파트) ============== */
function 호생성() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var vals = ss.getSheetByName('단지정보').getDataRange().getValues();
  var startRow = -1;
  for (var i = 0; i < vals.length; i++)
    for (var j = 0; j < vals[i].length; j++)
      if (String(vals[i][j]).indexOf('CONFIG_START:') === 0) startRow = parseInt(String(vals[i][j]).split(':')[1], 10);
  if (startRow < 0) { ss.toast('구성표를 못 찾음. setup 먼저 실행', '⚠️', 6); return; }

  var byDanji = { '한양': [], '삼성': [], '두산': [] };
  for (var r = startRow; r <= vals.length; r++) {
    var row = vals[r - 1]; if (!row) continue;
    var 단지 = String(row[0]).trim(), 동 = row[1], 층 = Number(row[2]), 라인 = Number(row[3]);
    if (!byDanji[단지]) continue;
    if (!층 || !라인) continue;
    for (var f = 1; f <= 층; f++) for (var line = 1; line <= 라인; line++) byDanji[단지].push([동, f * 100 + line]);
  }

  var made = [];
  DANJI.forEach(function (name) {
    var list = byDanji[name]; if (!list.length) return;
    var sh = ss.getSheetByName(name);
    var last = lastHoRow(sh);
    if (last >= 2) sh.getRange(2, 1, last - 1, NCOL).clearContent();
    var out = list.map(function (x) { return [x[0], x[1], false, '', '', '', '']; });
    sh.getRange(2, 1, out.length, NCOL).setValues(out);
    made.push(name + ' ' + out.length + '세대');
  });
  ss.toast(made.length ? ('호생성 완료: ' + made.join(' · ')) : '입력된 층수·라인수 없음', '✅', 8);
}

/* ============== 유지보수 ============== */
function 동의칸수정() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  DANJI.concat([SANGGA]).forEach(function (name) {
    var sh = ss.getSheetByName(name);
    if (!sh) return;
    var header = (name === SANGGA) ? HEADER_SG : HEADER_APT;
    sh.getRange(1, 1, 1, NCOL).setValues([header]).setFontWeight('bold'); // 헤더 최신화
    단지시트_서식(sh);
    if (name === SANGGA) sh.getRange('A2:A1000').setDataValidation(
      SpreadsheetApp.newDataValidation().requireValueInList(DANJI, true).setAllowInvalid(false).build());
    applyCheckboxDropdownFilter(sh);
    setup_요약(sh, 세대수공식(name));
  });
  ss.toast('열·드롭다운·체크박스·필터·요약 갱신 완료', '✅', 6);
}

/** 한양/삼성/두산에 예시 1행씩(동의✔·통합·신탁). 비고=예시 */
function 예시입력() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ex = { '한양': [301, 101], '삼성': [201, 101], '두산': [101, 101] };
  DANJI.forEach(function (name) {
    var sh = ss.getSheetByName(name); if (!sh) return;
    var r = lastHoRow(sh) + 1;
    sh.getRange(r, 3).insertCheckboxes();
    sh.getRange(r, 1, 1, NCOL).setValues([[ex[name][0], ex[name][1], true, '통합', '신탁', new Date(), '예시(삭제 가능)']]);
  });
  ss.toast('예시 입력 완료(동의✔·통합·신탁). 필요시 삭제/호생성', '✅', 7);
}

/** 호(B열) 마지막 행. 체크박스 FALSE는 무시 */
function lastHoRow(sh) {
  var b = sh.getRange('B2:B1000').getValues();
  var last = 1;
  for (var i = 0; i < b.length; i++) if (b[i][0] !== '' && b[i][0] !== null) last = i + 2;
  return last;
}

/** 단지정보 구성표 → {'단지|동': 세대수(층×라인)} */
function readConfig(ss) {
  var vals = ss.getSheetByName('단지정보').getDataRange().getValues();
  var startRow = -1;
  for (var i = 0; i < vals.length; i++)
    for (var j = 0; j < vals[i].length; j++)
      if (String(vals[i][j]).indexOf('CONFIG_START:') === 0) startRow = parseInt(String(vals[i][j]).split(':')[1], 10);
  var map = {};
  if (startRow < 0) return map;
  for (var r = startRow; r <= vals.length; r++) {
    var row = vals[r - 1]; if (!row) continue;
    var 단지 = String(row[0]).trim(), 동 = row[1], 층 = Number(row[2]), 라인 = Number(row[3]);
    if (DANJI.indexOf(단지) < 0 || !층 || !라인) continue;
    map[단지 + '|' + String(동)] = 층 * 라인;
  }
  return map;
}

/* ========================= JSON API ========================= */
function doGet() {
  var cache = CacheService.getScriptCache();
  var cached = cache.get('payload_v4');
  if (cached) return json(JSON.parse(cached));

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var info = readInfo(ss);
  var config = readConfig(ss);
  var 상가세대수 = {};
  info.단지.forEach(function (d) { 상가세대수[d.단지] = d.상가세대수 || 0; });

  var 동목록 = [];
  var 의향 = { 전체: 의향0() };
  DANJI.forEach(function (n) { 의향[n] = 의향0(); });

  // 아파트
  DANJI.forEach(function (name) {
    var map = {};
    Object.keys(config).forEach(function (key) {
      var p = key.split('|');
      if (p[0] === name) map[p[1]] = { 단지: name, 구분: '아파트', 동: p[1], 세대수: config[key], 동의수: 0 };
    });
    var sh = ss.getSheetByName(name);
    var last = sh ? lastHoRow(sh) : 1;
    if (last >= 2) {
      sh.getRange(2, 1, last - 1, 5).getValues().forEach(function (r) { // 동,호,동의,통합제자리,신탁조합
        var 동 = r[0]; if (동 === '' || 동 == null) return;
        var key = String(동);
        if (!map[key]) map[key] = { 단지: name, 구분: '아파트', 동: key, 세대수: 0, 동의수: 0 };
        if (r[2] === true) map[key].동의수++;
        bumpIntent(의향, name, r[3], r[4]);
      });
    }
    Object.keys(map).forEach(function (k) { 동목록.push(map[k]); });
  });

  // 상가
  var smap = {};
  DANJI.forEach(function (n) { smap[n] = { 단지: n, 구분: '상가', 동: '상가', 세대수: 상가세대수[n] || 0, 동의수: 0 }; });
  var sg = ss.getSheetByName(SANGGA);
  if (sg) {
    var slast = lastHoRow(sg);
    if (slast >= 2) sg.getRange(2, 1, slast - 1, 5).getValues().forEach(function (r) { // 단지,호,동의,통합제자리,신탁조합
      var 단지 = String(r[0]).trim(); if (!smap[단지]) return;
      if (r[2] === true) smap[단지].동의수++;
      bumpIntent(의향, 단지, r[3], r[4]);
    });
  }
  DANJI.forEach(function (n) { if (smap[n].세대수 > 0 || smap[n].동의수 > 0) 동목록.push(smap[n]); });

  var payload = { 갱신시각: new Date().toISOString(), 설정: info.설정, 단지: info.단지, 동목록: 동목록, 의향: 의향 };
  cache.put('payload_v4', JSON.stringify(payload), 300);
  touchLastUpdated(ss);
  return json(payload);
}

function 의향0() { return { 통합: 0, 제자리: 0, 신탁: 0, 조합: 0 }; }
function bumpIntent(의향, 단지, v1, v2) {
  v1 = String(v1).trim(); v2 = String(v2).trim();
  if (v1 === '통합' || v1 === '제자리') { 의향[단지][v1]++; 의향.전체[v1]++; }
  if (v2 === '신탁' || v2 === '조합') { 의향[단지][v2]++; 의향.전체[v2]++; }
}

function readInfo(ss) {
  var vals = ss.getSheetByName('단지정보').getDataRange().getValues();
  var 설정 = {}, 단지 = [], seen = {};
  var settingKeys = ['구역명', '주체', '접수마감', '최소목표', '최종목표', '상가포함', '단지순서'];
  vals.forEach(function (row) {
    var a = String(row[0]).trim();
    if (settingKeys.indexOf(a) >= 0) 설정[a] = normalize(row[1]);
    if (DANJI.indexOf(a) >= 0 && !seen[a] && row[1] !== '' && !isNaN(Number(row[1]))) {
      seen[a] = true;
      단지.push({ 단지: a, 아파트세대수: Number(row[1]), 상가세대수: Number(row[2]) || 0 });
    }
  });
  if (typeof 설정['단지순서'] === 'string')
    설정['단지순서'] = 설정['단지순서'].split(',').map(function (s) { return s.trim(); }).filter(String);
  if (설정['접수마감'] instanceof Date)
    설정['접수마감'] = Utilities.formatDate(설정['접수마감'], Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return { 설정: 설정, 단지: 단지 };
}

function touchLastUpdated(ss) {
  var sh = ss.getSheetByName('단지정보');
  var vals = sh.getRange(1, 1, sh.getLastRow(), 1).getValues();
  for (var i = 0; i < vals.length; i++)
    if (String(vals[i][0]).trim() === '마지막갱신') { sh.getRange(i + 1, 2).setValue(new Date()); return; }
}

function normalize(v) {
  if (typeof v !== 'string') return v;
  var s = v.trim();
  if (s.toUpperCase() === 'TRUE') return true;
  if (s.toUpperCase() === 'FALSE') return false;
  if (s !== '' && !isNaN(Number(s))) return Number(s);
  return s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
