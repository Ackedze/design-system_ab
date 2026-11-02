// Explicit external QA tool: no implicit ancestor dependency or package install.
const fs = require('node:fs');
const path = require('node:path');
const validatorPath = process.argv[2];
if (!validatorPath || !path.isAbsolute(validatorPath)) throw new Error('Provide an absolute path to an existing Ajv package');
const Ajv = require(validatorPath);
const validator = new Ajv({allErrors: true});
const schema = JSON.parse(fs.readFileSync(path.join(__dirname, 'mapping-registry.schema.json'), 'utf8'));
const registry = require('./consumer.cjs').loadRegistry();
const check = validator.compile(schema);
if (!check(registry)) throw new Error(JSON.stringify(check.errors));
console.log(JSON.stringify({status: 'pass', schema: schema.$id, registryDigest: registry.registryDigest,
    validatorPath, validatorVersion: require(path.join(validatorPath, 'package.json')).version}));
