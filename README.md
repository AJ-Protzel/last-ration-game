# Last Ration

An initial experiment: a portrait, top-down survival game set in a Fallout-style wasteland, built as plain HTML5 canvas and
JavaScript. No build step, no dependencies, no image files (every sprite is drawn in code). It was built in a few sessions with
Claude Code and is not being developed further.

Play it on a phone from Safari or Chrome and use Add to Home Screen, or run it locally.

## Run

```
python -m http.server 8123
```

Open http://localhost:8123. Keys: WASD move, Space roll, R reload, E use/search, Q swap weapon, I or Tab menu, 1/2/3 quick eat,
drink, med. Mouse: click = auto shot, hold = aim line, release = fire. On a phone: drag the left side to move, tap the right side to
auto-aim and fire, hold to aim by hand and release to fire.

## What is in it

- Procedural wasteland (city, town, forest, lakes), a new world per survivor, permadeath, day and night.
- Hunger, thirst, radiation, injuries and diseases, chems with addiction, S.P.E.C.I.A.L.-lite stats and perks.
- Fallout-style bestiary (ghouls, super mutants, deathclaws, mirelurks, radscorpions, and more), raiders, robots.
- Looting containers and corpses, weapon condition and repair, camp building, sleeping.
- Settlements, shopkeepers and wandering traders with bottle-cap barter. Every NPC can be killed and looted.
- Pip-Boy style green UI with stats, equipment, inventory, perks, a fog-of-war map and crafting.

## Files

- `sprites.js` pixel sprite engine, original sprites and ground tiles.
- `wasteland.js` creatures, people, props, camp structures, weapon and item icons.
- `world.js` data tables (items, weapons, enemies, loot) and seeded world generation.
- `game.js` survival, stats, perks, combat, enemy AI, looting, camp, NPCs, barter, save, input.
- `ui.js` world drawing, HUD, Pip-Boy menu, loot and trade windows, character creation.

Saves live in browser localStorage. Not affiliated with or endorsed by Bethesda or Fallout; this is a fan-style experiment.

## Not built

Sound, quests (on purpose), weather, offline mode, and a real balance pass.
