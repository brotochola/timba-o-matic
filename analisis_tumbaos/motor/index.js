// Carga el motor en Node. En el navegador, construir.js mete estos mismos archivos dentro de index.html.
const fs = require('fs'), path = require('path');
for (const f of fs.readdirSync(__dirname).filter(f => /^\d\d_.*\.js$/.test(f)).sort()) require(path.join(__dirname, f));
module.exports = globalThis.TumbaoMotor;
