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

// Entrance plan: 26 dots, one per outer piece, 5 orange.
const planMatch = html.match(/const ENTRANCE_PLAN=(\[[^\]]*\])/);
assert(planMatch, "ENTRANCE_PLAN not found");
const plan = JSON.parse(planMatch[1].replace(/'/g, '"'));
const FACE = { U: [[0,1,0],[1,0,0],[0,0,-1]], D: [[0,-1,0],[1,0,0],[0,0,1]], F: [[0,0,1],[1,0,0],[0,1,0]],
  B: [[0,0,-1],[-1,0,0],[0,1,0]], R: [[1,0,0],[0,0,-1],[0,1,0]], L: [[-1,0,0],[0,0,1],[0,1,0]] };
const pieces = new Set(), count = {};
plan.forEach((key) => {
  const f = key[0], [u, v] = key.slice(1).split(",").map(Number), [n, U, V] = FACE[f];
  pieces.add([0,1,2].map((i) => n[i] + u * U[i] + v * V[i]).join(","));
  count[f] = (count[f] || 0) + 1;
});
assert(plan.length === 26 && pieces.size === 26, "Entrance plan must place exactly one dot on each of the 26 outer pieces");
assert(count.L === 5, "Orange should have 5 entrances");
console.log(`All ${levels.length} solar levels solvable; entrance plan = one dot per piece`, JSON.stringify(count));
