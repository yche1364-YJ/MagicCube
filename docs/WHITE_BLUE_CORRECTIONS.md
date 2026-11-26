# White / Blue Vertical Slice — Corrections Before Continuing

Status: paused for review. The current implementation is a first-pass experiment, not approved gameplay.

## Problems observed

1. **Sudoku was changed into a popup.**
   - This was an implementation choice made to keep the 6×6 grid legible.
   - It does not match the intended interaction: the Sudoku should remain a physical puzzle on the cube face, then transition spatially into the interior floor.
   - Replace the modal-style presentation with an integrated face/playfield treatment.

2. **The first Sudoku blocks progression.**
   - It currently introduces an externally locked number before the player can reach or verify the relevant 3D content.
   - The player must never be trapped inside the Sudoku screen while the required number exists elsewhere.
   - The first white/blue teaching sequence needs an immediately understandable exit and explicit route to the required number.
   - Testing access must allow sky and water rooms to be verified independently of unfinished white progression.

3. **Water alignment is visually promising, but its implementation is not yet correct.**
   - Preserve the useful visual direction.
   - The current solution is presented vertically. This reverses the intended spatial reading.
   - The player should arrive at and float on the water surface, then look **down through the water** to align the submerged pieces into the target shape.
   - The water plane cannot be merely visual: the character needs a convincing landing/contact transition and a distinct floating state.
   - Revisit the actual movement, camera, alignment target, success condition, and reward flow before calling it complete.

4. **Sky alignment could not be verified.**
   - The current Sudoku progression lock prevented access.
   - Add a review/test path that does not alter the intended player progression in the deployed game.
   - Confirm that the sky puzzle uses the opposite spatial orientation from water: the grounded character looks **up into the sky** and changes position/view angle until the stars form the target shape.

5. **Controls and vertical navigation are too confusing.**
   - The prototype currently asks the player to interpret too many control modes: cube traversal, face puzzle input, room movement, camera alignment, entering rooms, and going back up.
   - Explore a cleaner shared interaction language instead of exposing frequent mode switching.
   - Entering and leaving levels should be spatially clear and consistently named; avoid ambiguous controls such as generic “Up” when it can mean camera movement, vertical travel, or exiting a room.
   - The next pass should define the complete control model before implementation, including desktop and touch behavior.

6. **Entrances were incorrectly added outside the white/blue scope.**
   - This contributor owns only the **nine white facelets** and **nine blue facelets**.
   - Do not add entrances, room markers, placeholder pits, sealed-room messages, or future-room assumptions to green, red, orange, or yellow facelets.
   - Green facelets are currently traversal/go blocks with no entrance point unless their contributor decides otherwise.
   - Other contributors will choose whether their colours contain entrances and how those entrances behave.
   - The shared entrance count and completion logic must derive from implemented/registered entrances rather than assuming all 54 facelets are entrances.
   - Preserve all unrelated colour behavior and art when implementing white and blue work.

## Required next step

Before adding more rooms, revise the tutorial flow as a complete sequence:

`physical 2D Sudoku face -> leave/search without obstruction -> accessible blue lesson -> collect required value -> return to the same marked white face -> solve -> physical transformation into the 3D floor`

Do not continue from the assumption that the current popup or progression gating is accepted.

Before coding the next pass, finalize these three connected specifications:

1. The physical transition between cube face, interior room, and return to the surface.
2. The common movement/camera/control language across Sudoku, sky, water, and floor traversal.
3. The opposite alignment orientations: **look up for sky; float and look down for water**.
4. The ownership boundary: modify and register entrances only on white and blue facelets.

## Sudoku content must be authored backward from traversal

The solved Sudoku, the exploration requirements, and the 3D exit route are not separate puzzles. They are three states of one authored board.

1. **Start with a valid solved 6×6 Sudoku.**
2. **Verify or author a traversable exit route across that solved grid.** The route must obey the intended movement rule and reach the door. Do not accept a Sudoku board unless at least one valid exit route exists.
3. **Derive the playable 2D puzzle from that approved solved board.** Remove the normal Sudoku clues required for the chosen difficulty.
4. **Designate an additional progression-controlled set of removed values.** These cannot be entered through Sudoku deduction alone; the player restores them by exploring:
   - blue sky/water rooms, and
   - deliberate pickups or discoveries on the outer cube maze.
5. **Render one shared board state everywhere.** The physical face, any close camera view, and the later 3D floor must use the same solved grid, clue mask, restored values, and player entries.
6. **Transform the completed board rather than replacing it.** Once every missing value is restored and the Sudoku is solved, those same numbered tiles become the traversable 3D floor and retain the verified route to the exit.

Each white level therefore needs a content definition containing at minimum:

- the complete valid solution grid;
- the verified traversal route or accepted route set;
- the ordinary Sudoku clue/blank mask;
- the exploration-controlled missing slots;
- the required number/value for each controlled slot;
- the source assigned to each value (specific blue reward or outer-maze discovery);
- the number of exploration-controlled values required at that difficulty.

The exact number and distribution of exploration-controlled values remains a progression-design decision. The generator/validator must support changing that amount without changing the underlying solved board or breaking its exit route.
