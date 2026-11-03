# Rail Yatra

A realistic Indian railway life-sim that runs **in the browser** (phone friendly), built with Three.js.
Book tickets at the station counter **or** online on the in-game **RailYatra.in** website, board trains, build a career in the railways.

## Play / test

The game needs a web server (browsers block ES modules from `file://`).

**On GitHub Pages (phone friendly):** Settings → Pages → *Deploy from a branch* → `main` / `(root)` → Save.
Your game link will be `https://<username>.github.io/Rail-Yatra/`.

**On a computer:** `python3 -m http.server 8000`, then open `http://localhost:8000`.

Controls: WASD/arrows move · Shift run · Space jump · drag to look · wheel to zoom.
Touch: left half = joystick, right half = look, Run / Jump buttons.

Three.js is loaded from the jsDelivr CDN (see `index.html`), so an internet connection is needed.

## Roadmap

| Phase | Scope | Status |
|-------|-------|--------|
| P0 | Existing GitHub project audit | Done (repo was empty) |
| P1 | Player + Camera + Save | In this PR (web version) |
| P2 | Starting City + Station | |
| P3 | Ticket + Passenger + Train | |
| P4 | Railway Map + Data | |
| P5 | NPC + Station AI | |
| P6 | Home + Vehicle + Business | |
| P7 | Career + Missions | |
| P8 | Full India Expansion | |
| P9 | Optimization + APK | |

## Ticket booking (planned for P3/P4)

1. **Station counter**: queue, clerk NPC, form, cash/UPI payment, printed ticket with PNR.
2. **RailYatra.in** (in-game website opened from the phone/laptop): login + OTP, captcha, train search, class availability (SL/3A/2A/1A), RAC/WL, Tatkal window, PNR status, cancel and refund.

Both use one shared ticket database so a PNR is valid everywhere.

## Layout

```
index.html          page, HUD, menu, touch controls
css/style.css
js/main.js          boot, game loop, autosave
js/core/            clock.js, save.js (localStorage), input.js
js/game/            world.js, player.js, camera.js
```

Save data lives in `localStorage` (`railyatra_save_v1`), autosaved every 30 s and when the tab is hidden.
