// Checks every white Sudoku level in index.html: valid 6x6 solution (2x3 boxes),
// clues agree with it, exactly one solution once the blue-room number is restored,
// and the authored floor route walks from the entry (row 3, col 1) to the door
// in adjacent pairs that add up to pairTotal.
// Run: node scripts/validate-white-levels.js
const fs = require("fs");
const path = require("path");

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const html = fs.readFileSync(path.resolve(__dirname, "..", "index.html"), "utf8");
const match = html.match(/const WHITE_LEVELS=(\[[\s\S]*?\n\}\]);/);
assert(match, "WHITE_LEVELS not found in index.html");
const levels = Function(`return ${match[1]}`)();

const validGrid = (g) => {
  for (let i = 0; i < 6; i++) {
    if (new Set(g[i]).size !== 6 || new Set(g.map((r) => r[i])).size !== 6) return false;
  }
  for (let br = 0; br < 6; br += 2)
    for (let bc = 0; bc < 6; bc += 3) {
      const box = new Set();
      for (let r = br; r < br + 2; r++) for (let c = bc; c < bc + 3; c++) box.add(g[r][c]);
      if (box.size !== 6) return false;
    }
  return true;
};

const countSolutions = (grid, limit = 2) => {
  const g = grid.map((r) => r.slice());
  let count = 0;
  const ok = (r, c, v) => {
    for (let i = 0; i < 6; i++) if (g[r][i] === v || g[i][c] === v) return false;
    const br = Math.floor(r / 2) * 2, bc = Math.floor(c / 3) * 3;
    for (let i = br; i < br + 2; i++) for (let j = bc; j < bc + 3; j++) if (g[i][j] === v) return false;
    return true;
  };
  const rec = () => {
    for (let r = 0; r < 6; r++)
      for (let c = 0; c < 6; c++)
        if (!g[r][c]) {
          for (let v = 1; v <= 6 && count < limit; v++)
            if (ok(r, c, v)) { g[r][c] = v; rec(); g[r][c] = 0; }
          return;
        }
    count++;
  };
  rec();
  return count;
};

levels.forEach((L, i) => {
  const name = `${L.id || "white-" + (i + 1)}`;
  assert(validGrid(L.solution), `${name}: solution is not a valid 6x6 Sudoku`);
  L.clues.forEach((row, r) => row.forEach((v, c) => assert(!v || v === L.solution[r][c], `${name}: clue (${r},${c}) disagrees`)));
  const ctrl = L.controlled[0];
  assert(L.clues[ctrl.r][ctrl.c] === 0 && L.solution[ctrl.r][ctrl.c] === ctrl.value, `${name}: controlled slot mismatch`);
  const withCtrl = L.clues.map((r) => r.slice());
  withCtrl[ctrl.r][ctrl.c] = ctrl.value;
  assert(countSolutions(withCtrl) === 1, `${name}: puzzle does not have exactly one solution`);
  const route = L.route;
  assert(route[0][0] === 2 && route[0][1] === 0, `${name}: route must start beside the entry`);
  assert(route.length % 2 === 0 && route[route.length - 1][1] === 5, `${name}: route must end at the door column in a full pair`);
  route.forEach((p, k) => {
    if (k) assert(Math.abs(p[0] - route[k - 1][0]) + Math.abs(p[1] - route[k - 1][1]) === 1, `${name}: route step ${k} is not adjacent`);
    if (k % 2) assert(L.solution[route[k - 1][0]][route[k - 1][1]] + L.solution[p[0]][p[1]] === L.pairTotal, `${name}: pair ${k} does not total ${L.pairTotal}`);
  });
  const blanks = L.clues.flat().filter((v) => !v).length - 1;
  console.log(`✓ ${name}: ${blanks} blank(s) to fill + 1 blue number, route ${route.length} tiles`);
});
console.log(`All ${levels.length} white levels valid.`);
