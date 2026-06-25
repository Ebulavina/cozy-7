const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');
const path = require('path');

const vc = new VirtualConsole();
vc.sendTo(console, { omitJSDOMErrors: false });

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/cozy-7/',
  runScripts: 'dangerously',
  resources: 'usable',
  virtualConsole: vc,
});

dom.window.addEventListener('error', (e) => {
  console.log('WINDOW ERROR EVENT:', e.message, e.error && e.error.stack);
});

vc.on('jsdomError', (err) => {
  console.log('JSDOM ERROR:', err.message);
  console.log(err.stack);
});

const code = fs.readFileSync(path.join(__dirname, 'dist/assets/index-Fr3L2E3a.js'), 'utf8');

const scriptEl = dom.window.document.createElement('script');
scriptEl.textContent = code;
try {
  dom.window.document.body.appendChild(scriptEl);
} catch (e) {
  console.log('SYNC THROW:', e.stack);
}

setTimeout(() => {
  console.log('done waiting');
}, 1000);
