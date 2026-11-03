# Rail Yatra

A realistic Indian railway life-sim for Android/PC, built in Unity.
Book tickets at the station counter **or** online on the in-game **RailYatra.in** website, board real-feeling trains, build a career in the railways.

## Roadmap

| Phase | Scope | Status |
|-------|-------|--------|
| P0 | Existing GitHub project audit | Done (repo was empty) |
| P1 | Player + Camera + Save | Code ready |
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
2. **RailYatra.in** (in-game website on phone/laptop): login + OTP, captcha, train search, class availability, Tatkal at 10:00/11:00, PNR status, cancel and refund.

Both use one shared ticket database so a PNR is valid everywhere.

## Setup

See [SETUP.md](SETUP.md).

## Project layout

```
Assets/
  Scripts/
    Core/    GameClock
    Player/  PlayerController, CameraFollow, VirtualJoystick
    Save/    SaveData, SaveSystem, SaveManager
```
