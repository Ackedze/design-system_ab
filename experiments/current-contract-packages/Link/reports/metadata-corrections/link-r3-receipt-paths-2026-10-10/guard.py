from pathlib import Path
import json,hashlib,copy
ROOT=Path(__file__).resolve().parent
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def pin_ok(pin):
 p=Path(pin['path']);assert p.is_absolute() and p.is_file(), 'RECEIPT_PATH_MISSING_OR_RELATIVE'
 assert digest(p)==pin['sha256'], 'RECEIPT_HASH_MISMATCH'
 assert p.stat().st_size==pin['bytes'], 'RECEIPT_BYTES_MISMATCH'
def verify(handoff,require_seal=False):
 assert handoff['writesClosed'] and handoff['correctionWritesClosed']
 assert handoff['receiptPathPolicy']=='absolute'
 assert len(handoff['buildAndValidate'])==4
 for row in handoff['buildAndValidate']:
  assert row['status']=='PASS'
  pin_ok({'path':row['receipt'],'sha256':row['receiptSha256'],'bytes':row['receiptBytes']})
 for p in handoff['supersedes'].values():
  if isinstance(p,dict):pin_ok(p)
 original=json.loads(Path(handoff['supersedes']['handoff']['path']).read_text())
 for key,value in original.items():
  if key not in ['buildAndValidate','supportingSourcePins','seal']:assert handoff[key]==value, 'NON_METADATA_CHANGE'
 for previous,current in zip(original['buildAndValidate'],handoff['buildAndValidate']):
  for key,value in previous.items():
   if key!='receipt':assert current[key]==value, 'VALIDATION_RESULT_CHANGE'
  assert Path(current['receipt'])==Path(handoff['supersedes']['handoff']['path']).parent/'technical'/previous['receipt'], 'INCORRECT_RECEIPT_REBASE'
 for previous,current in zip(original['supportingSourcePins'],handoff['supportingSourcePins']):
  assert previous['path']==current['path']
  if previous['path']!='docs/APOLLO_PROCESS_LESSONS.md':assert previous==current, 'SOURCE_PIN_CHANGE'
 pin_ok({'path':handoff['eval'],'sha256':digest(Path(handoff['eval'])),'bytes':Path(handoff['eval']).stat().st_size})
 for p in handoff['journalMetadataCorrection'].values():pin_ok(p)
 for p in handoff['sharedSourcePins']+handoff['supportingSourcePins']:
  pin_ok(dict(p,path=str(Path(handoff['sourcePinBase'])/p['path'])))
 if require_seal:
  seal_path=Path(handoff['seal']);assert seal_path.is_absolute() and seal_path.is_file()
  seal=json.loads(seal_path.read_text());assert seal['writesClosed'] and Path(seal['pinBase'])==ROOT
  for p in seal['pins']:pin_ok(dict(p,path=str(ROOT/p['path'])))
  for p in seal['externalPins']:pin_ok(p)
 return {'status':'PASS','receiptPaths':4,'sha256AndBytes':True,'originalClosedHandoffAndSealPreserved':True,'finalSeal':require_seal}
def regressions(handoff):
 verify(handoff)
 tested=[]
 for row_index in range(4):
  wrong=copy.deepcopy(handoff);row=wrong['buildAndValidate'][row_index];row['receipt']=str(Path(row['receipt']).parent.parent.parent/'checks'/Path(row['receipt']).name)
  try:verify(wrong)
  except (AssertionError,FileNotFoundError):tested.append('missing-old-base-'+row['name'])
  else:raise AssertionError('OLD_RELATIVE_BASE_WAS_ACCEPTED')
 for label,field,value in [('relative-path','receipt','checks/core-validate.final-after.log'),('wrong-hash','receiptSha256','0'*64),('wrong-bytes','receiptBytes',1)]:
  wrong=copy.deepcopy(handoff);wrong['buildAndValidate'][0][field]=value
  try:verify(wrong)
  except (AssertionError,FileNotFoundError):tested.append(label)
  else:raise AssertionError('BAD_RECEIPT_WAS_ACCEPTED: '+label)
 return {'positive':'PASS','rejected':tested,'negativeChecks':len(tested),'writesPerformed':0}
if __name__=='__main__':
 import sys
 handoff=json.loads((ROOT/'HANDOFF.corrected.json').read_text())
 print(json.dumps(regressions(handoff) if '--regressions' in sys.argv else verify(handoff,require_seal=True)))
