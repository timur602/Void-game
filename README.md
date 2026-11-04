# VOID — Animated Sprite Integration

## Run
Open `index.html` using VS Code Live Server or a local web server. All game logic stays in separate JavaScript files.

## Controls
A/D or Left/Right: move; W/Up/Space: jump; Shift: sprint; Q: dash; J: fire/attack; K: lightning; L: explosion; Esc: pause.
Press **1 Alex**, **2 Mia**, **3 Kai**, or **4 Void** while playing to change the animated character.

## Files changed
- `sprites.js` (new) loads the transparent sheet and stores crop coordinates for players/enemies.
- `player.js` now draws the selected animated character, including idle/run/jump/fall/dash/attack/hurt.
- `enemy.js` now draws Hunter/Guardian characters using their own frame strips, including AI movement and attack animations.
- `game.js` adds character selection and attack animation triggers.
- `index.html` loads sprites.js before other gameplay scripts.
- The existing map, power, collision, health, and level logic are preserved.

## Important atlas limitations
This AI-generated transparent atlas is *not* a precisely gridded production sprite sheet. Some drawings overlap their neighboring slots, and visual frames are not spaced evenly; crops are approximate and can show parts of adjacent frames or inconsistent poses. Adjust `PLAYER_CENTERS`, `PLAYER_ROWS`, `ENEMY_CENTERS`, `ENEMY_ROWS` in `sprites.js` to refine them. For perfect frame isolation, export each animation as evenly sized individual PNGs with padding, then change the mapping. The game uses only the Hunter and Guardian types in the supplied levels; Sniper, Drone, and Boss mappings are illustrative and not automatically added to levels.

## Image
`assets/void-sprite-sheet.png` is 1672 x 941 RGBA with transparency.

## Fixes
- VOID (purple hooded hero) is the default playable character.
- Fixed missing player animation: `row.count` was undefined; it now uses `row.frames`.
- Removed blink-based sprite disappearance during temporary invulnerability.
- Character selection: 1 VOID, 2 Alex, 3 Mia, 4 Kai.


## Animation and enemy collision fixes
- Player and enemies now use a frozen standing frame for idle, instead of cycling while stationary.
- Run animation plays only when the character has meaningful movement.
- Enemy AI stops before reaching the player's center.
- Enemy-vs-enemy collision uses hitboxes and maintains a 12-pixel gap for enemies at the same height, preventing overlapping characters.
- Tune positions/individual frames in sprites.js (atlas is irregular and may still need manual cropping for clean action frames).


## Latest frame-crop fixes
- Switched sprite rendering from rough row cropping to exact per-frame rectangles.
- Fixed Void idle / run crop errors.
- Removed visible feet/body parts leaking from the row above.
- Fixed mirrored / cut enemy frames by improving crop boxes and flip anchoring.


## Visibility restoration (critical fix)
- Restored the `PLAYER_ROWS` and `ENEMY_ROWS` animation timing metadata required by `player.js` and `enemy.js`. Their absence caused a ReferenceError on the first game frame and stopped player/enemy drawing.
- Kept the corrected per-frame crop rectangles and the collision/separation system.
- All player/enemy animations now use the existing timing configuration again.


CHARACTER FEATURES
- VOID: balanced stats and mobility.
- Alex: rapid fire.
- Mia: lightning recharges faster.
- Kai: 130 max health, slower movement, and wider explosion radius.
- Switch characters with keys 1–4. Health bar scales to the selected character.
- Fire, lightning, and explosion damage remain 15 HP per hit.


### VOID unique ability
- Select VOID and press **E** to release a Void Pulse.
- The pulse affects enemies within 220 pixels, deals 15 damage, and stuns survivors for 1.5 seconds.
- Cooldown: 8 seconds. Other characters cannot use this ability.


## VOID custom abilities
- **E — Robot Restraint:** calls three delivery drones that deploy restraint robots on the nearest enemy within range. The enemy remains held until VOID hits it again. Cooldown: 12 seconds.
- **R — Void Combo:** rushes the nearest enemy and lands 15–20 hits, each dealing 3 damage. Farther targets trigger more strikes. Cooldown: 10 seconds.
- **T — Void Crush:** hits a nearby enemy for half of its current HP (for example, 80 HP becomes 40 damage; 35 HP becomes 17.5). Cooldown: 15 seconds.
- **U — Counter Arm:** activate before an enemy attack. If an enemy hits VOID during the 2.5-second window, VOID counters with a stylized mechanical arm strike and stuns the enemy. Cooldown: 9 seconds.
- These are stylized sci-fi effects without graphic detail. Other characters cannot use VOID's custom abilities.


## Act 4 — The Abandoned Factory
Reach the far exit after defeating four guards and the Factory Overlord boss. The boss has 320 HP, a visible health bar, and a heavy close-range attack. The original first three acts remain unchanged.
