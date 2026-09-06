import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const source = fs.readFileSync(path.join(root, 'src/services/filesApi.js'), 'utf8');

assert.match(source, /uploadFile\(\{ file, title, category, subject, semester, onProgress \}\)/);
assert.match(source, /uploadToB2\(authorization\.upload_url, file/);
assert.match(source, /request\.send\(file\)/);
assert.match(source, /request\.open\('PUT', uploadUrl\)/);
assert.doesNotMatch(source, /B2_APPLICATION_KEY_ID|B2_APPLICATION_KEY/);
assert.doesNotMatch(source, /FormData/);

const dist = path.join(root, 'dist');
if (fs.existsSync(dist)) {
  const bundleText = fs.readdirSync(path.join(dist, 'assets'))
    .filter((entry) => entry.endsWith('.js'))
    .map((entry) => fs.readFileSync(path.join(dist, 'assets', entry), 'utf8'))
    .join('\n');
  assert.doesNotMatch(bundleText, /B2_APPLICATION_KEY_ID|B2_APPLICATION_KEY/);
}

console.log('frontend B2 upload flow checks passed');