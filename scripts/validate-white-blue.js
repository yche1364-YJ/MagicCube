const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const solution = [
  [1, 2, 3, 4, 5, 6],
  [4, 5, 6, 1, 2, 3],
  [2, 3, 4, 5, 6, 1],
  [5, 6, 1, 2, 3, 4],
  [3, 4, 5, 6, 1, 2],
  [6, 1, 2, 3, 4, 5],
];

const puzzle = [
  [1, 0, 0, 4, 0, 6],
  [0, 5, 6, 0, 2, 0],
  [0, 0, 4, 0, 6, 1],
  [0, 6, 0, 2, 0, 4],
  [3, 0, 5, 0, 1, 0],
  [6, 1, 0, 3, 0, 5],
];

const route = [
  [2, 0], [3, 0],
  [3, 1], [3, 2],
  [3, 3], [2, 3],
  [2, 4], [2, 5],
];

const controlled = [
  { row: 2, column: 0, value: 2, source: "blue-tutorial" },
];
const registeredSources = new Set(["blue-tutorial", "sky", "water", "outer-maze"]);

const expected = "123456";
for (let row = 0; row < 6; row += 1) {
  assert([...solution[row]].sort().join("") === expected, `Invalid row ${row + 1}`);
}

for (const slot of controlled) {
  assert(slot.row >= 0 && slot.row < 6 && slot.column >= 0 && slot.column < 6, "Controlled slot is outside the grid");
  assert(puzzle[slot.row][slot.column] === 0, `Controlled slot ${slot.row + 1},${slot.column + 1} must begin blank`);
  assert(solution[slot.row][slot.column] === slot.value, `Controlled value mismatch at ${slot.row + 1},${slot.column + 1}`);
  assert(registeredSources.has(slot.source), `Unknown exploration source: ${slot.source}`);
}
for (let column = 0; column < 6; column += 1) {
  assert(solution.map((row) => row[column]).sort().join("") === expected, `Invalid column ${column + 1}`);
}
for (let boxRow = 0; boxRow < 3; boxRow += 1) {
  for (let boxColumn = 0; boxColumn < 2; boxColumn += 1) {
    const values = [];
    for (let row = boxRow * 2; row < boxRow * 2 + 2; row += 1) {
      for (let column = boxColumn * 3; column < boxColumn * 3 + 3; column += 1) {
        values.push(solution[row][column]);
      }
    }
    assert(values.sort().join("") === expected, `Invalid 2x3 region ${boxRow + 1},${boxColumn + 1}`);
  }
}

for (let row = 0; row < 6; row += 1) {
  for (let column = 0; column < 6; column += 1) {
    assert(!puzzle[row][column] || puzzle[row][column] === solution[row][column], `Clue mismatch at ${row + 1},${column + 1}`);
  }
}

const grid = puzzle.map((row) => [...row]);
let solutionCount = 0;
const allowed = (row, column, value) => {
  if (grid[row].includes(value)) return false;
  if (grid.some((candidate) => candidate[column] === value)) return false;
  const rowStart = Math.floor(row / 2) * 2;
  const columnStart = Math.floor(column / 3) * 3;
  for (let r = rowStart; r < rowStart + 2; r += 1) {
    for (let c = columnStart; c < columnStart + 3; c += 1) {
      if (grid[r][c] === value) return false;
    }
  }
  return true;
};
const solve = () => {
  let empty = null;
  for (let row = 0; row < 6 && !empty; row += 1) {
    for (let column = 0; column < 6; column += 1) {
      if (!grid[row][column]) {
        empty = [row, column];
        break;
      }
    }
  }
  if (!empty) {
    solutionCount += 1;
    return;
  }
  const [row, column] = empty;
  for (let value = 1; value <= 6 && solutionCount < 2; value += 1) {
    if (!allowed(row, column, value)) continue;
    grid[row][column] = value;
    solve();
    grid[row][column] = 0;
  }
};
solve();
assert(solutionCount === 1, `Expected one Sudoku solution, found ${solutionCount}`);

assert(route[0][1] === 0, "Route must begin on the left edge");
assert(route.at(-1)[1] === 5, "Route must end on the right edge");
for (let index = 1; index < route.length; index += 1) {
  const [previousRow, previousColumn] = route[index - 1];
  const [row, column] = route[index];
  assert(Math.abs(previousRow - row) + Math.abs(previousColumn - column) === 1, `Route step ${index + 1} is not adjacent`);
}
for (let index = 0; index < route.length; index += 2) {
  const [firstRow, firstColumn] = route[index];
  const [secondRow, secondColumn] = route[index + 1];
  assert(solution[firstRow][firstColumn] + solution[secondRow][secondColumn] === 7, `Route pair ${index / 2 + 1} does not total seven`);
}

console.log(JSON.stringify({
  sudoku: "valid 6x6",
  uniqueSolutions: solutionCount,
  routeValues: route.map(([row, column]) => solution[row][column]),
  routePairs: route.length / 2,
  controlledSlots: controlled,
}, null, 2));
