// Checks the orange Solar Reflection levels embedded in index.html.
// Run: node scripts/validate-orange.js
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const html = fs.readFileSync(path.resolve(__dirname, "..", "index.html"), "utf8");
const match = html.match(/SOLAR ENGINE[^\n]*\n([\s\S]*?)\/\* ===== END SOLAR ENGINE/);
assert(match, "Solar engine block not found in index.html");

const sandbox = { globalThis: {} };
vm.runInNewContext(match[1], sandbox);
const { levels, solutions, trace } = sandbox.globalThis.SolarEngine;

assert(levels.length > 0, "No solar levels defined");
levels.forEach((level, i) => {
  const found = solutions(level);
  assert(found.length > 0, `Level ${i + 1} (${level.name}) has no solution`);
  const start = trace(level, level.mirrors.map((m) => m.initial));
  assert(!start.solved, `Level ${i + 1} (${level.name}) is already solved at the start`);
  console.log(`✓ Level ${i + 1} ${level.name}: ${found.length} solution(s), ${level.mirrors.length} mirror(s), ${level.receivers.length} crystal(s)`);
});

const orangeEntrances = (html.match(/s\.face==='L'/g) || []).length;
assert(orangeEntrances > 0, "Orange facelets are not registered as entrances");
console.log(`All ${levels.length} solar levels solvable; orange entrances registered.`);
