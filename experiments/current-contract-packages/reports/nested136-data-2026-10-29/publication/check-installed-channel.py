import hashlib,json,os,pathlib,plistlib,subprocess,sys
base=pathlib.Path('/Users/alexkukhta/Library/Application Support/ApolloProxyControl')
app=pathlib.Path('/Users/alexkukhta/Desktop/workplace/services/apollo-proxy/macos-app/dist/ApolloProxyControl.app')
proxy=base/'proxy'
config={}
for raw in (proxy/'.env').read_text().splitlines():
 line=raw.strip()
 if line and not line.startswith('#') and '=' in line:
  k,v=line.split('=',1);v=v.strip()
  if len(v)>1 and v[0]==v[-1] and v[0] in ['\"',"'"]:v=v[1:-1]
  config[k.strip()]=v
plist=plistlib.loads((app/'Contents/Info.plist').read_bytes())
settings=json.loads((base/'portable-settings.json').read_text())
url=config.get('APOLLO_DATA_DESCRIPTOR_URL') or settings.get('dataDescriptorUrl') or plist['ApolloDataDescriptorURL']
assert '/runtimes/d058231402858ee32c6afd4d111b14020d68bd62bbba17adeca53675344cf1ad/' in url
runtime=json.loads((proxy/'runtime/apollo/portable-runtime.json').read_text())
assert runtime['id']=='d058231402858ee32c6afd4d111b14020d68bd62bbba17adeca53675344cf1ad'
env=dict(os.environ)
for k in ['HTTP_PROXY','HTTPS_PROXY','NO_PROXY','http_proxy','https_proxy','no_proxy','SSL_CERT_FILE','NODE_EXTRA_CA_CERTS','APOLLO_KNOWLEDGE_TOKEN','APOLLO_DATA_TOKEN']:
 if config.get(k):env[k]=config[k]
node=app/'Contents/Resources/runtime/bin/node';cli=proxy/'scripts/data-release-cli.js'
args=[str(node),str(cli),'check','--store',str(base/'data-releases'),'--seed',str(proxy/'runtime/seed'),'--runtime',str(proxy/'runtime/apollo'),'--descriptor',url]
state=base/'data-releases/state.json';before=state.read_bytes()
r=subprocess.run(args,env=env,cwd=proxy,text=True,capture_output=True,timeout=70)
after=state.read_bytes()
report={'command':'actual installed data-release-cli.js check','node':str(node),'cli':str(cli),'descriptor':url,'runtimeId':runtime['id'],'appBuild':plist['CFBundleVersion'],'exitCode':r.returncode,'status':json.loads(r.stdout),'stderr':r.stderr,'stateUnchanged':before==after,'installedStateSha256':hashlib.sha256(after).hexdigest()}
path=pathlib.Path(sys.argv[1]);path.write_text(json.dumps(report,ensure_ascii=False,separators=(',',':'))+'\n')
print(json.dumps({k:report[k] for k in ['exitCode','runtimeId','stateUnchanged']}|{'updateAvailable':report['status'].get('updateAvailable'),'descriptor':report['status'].get('descriptor'),'sourceCommit':report['status'].get('sourceCommit')}))
assert before==after
sys.exit(r.returncode)
