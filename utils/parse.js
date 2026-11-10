const HttpError = require('./httpError');

function parseId(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) throw new HttpError(400, 'ID inválido.');
  return n;
}

// Pega apenas as chaves informadas (ignora undefined), aplica trim e troca '' por null
function pick(obj, keys) {
  const out = {};
  const src = obj || {};
  for (const k of keys) {
    if (src[k] === undefined) continue;
    let v = src[k];
    if (typeof v === 'string') {
      v = v.trim();
      if (v === '') v = null;
    }
    out[k] = v;
  }
  return out;
}

module.exports = { parseId, pick };
