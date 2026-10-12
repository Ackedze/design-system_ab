const assert=require('node:assert/strict');
function check(request,grid){
 const u=request.updateCells,r=u?.range;
 assert(r&&u.fields==='userEnteredValue');
 for(const k of ['sheetId','startRowIndex','endRowIndex','startColumnIndex','endColumnIndex'])assert(Number.isSafeInteger(r[k])&&r[k]>=0,`Invalid ${k}`);
 assert(r.sheetId===grid.sheetId&&r.endRowIndex<=grid.rowCount&&r.endColumnIndex<=grid.columnCount);
 assert(r.startRowIndex<r.endRowIndex&&r.startColumnIndex<r.endColumnIndex);
 assert(Array.isArray(u.rows)&&u.rows.length===r.endRowIndex-r.startRowIndex);
 assert(u.rows.every(row=>Array.isArray(row.values)&&row.values.length===r.endColumnIndex-r.startColumnIndex));
 return request;
}
const grid={sheetId:846381902,rowCount:503,columnCount:15};
const request={updateCells:{range:{sheetId:grid.sheetId,startRowIndex:499,endRowIndex:500,startColumnIndex:12,endColumnIndex:15},rows:[{values:[{},{},{}]}],fields:'userEnteredValue'}};
check(request,grid);
for(const invalid of [undefined,NaN,null,'499',-1]){const r=structuredClone(request);r.updateCells.range.startRowIndex=invalid;assert.throws(()=>check(r,grid));}
const wide=structuredClone(request);wide.updateCells.range.endRowIndex=503;assert.throws(()=>check(wide,grid));
const beyond=structuredClone(request);beyond.updateCells.range.endColumnIndex=16;assert.throws(()=>check(beyond,grid));
const actual={updateCells:{range:{sheetId:grid.sheetId,startRowIndex:0,endRowIndex:503,startColumnIndex:12,endColumnIndex:15},rows:require('../../reports/ledger-range-recovery.r2.json').restoredExpected,fields:'userEnteredValue'}};
check(actual,grid);
console.log(JSON.stringify({validRequest:'PASS',undefinedNaNNullStringNegativeRejected:'PASS',rectangleMismatchRejected:'PASS',gridOverflowRejected:'PASS',actualRecoveryRectangle:'PASS',writesPerformed:0}));
