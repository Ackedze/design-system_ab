// Execute the 19 frozen static regression assertions with one explicit module
// rebinding. No historical test/source file is changed or repinned.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const file=path.resolve(__dirname,'../../tests/static-content.test.cjs');
const suite=new Module(file,module);suite.filename=file;suite.paths=Module._nodeModulePaths(path.dirname(file));
const originalRequire=suite.require.bind(suite);
suite.require=id=>id==='../static-content/v1-draft/producer.cjs'?require('./producer.cjs'):originalRequire(id);
suite._compile(fs.readFileSync(file,'utf8'),file);
