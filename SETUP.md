# P1 Setup (Unity)

Recommended: Unity 6 (6000.x) LTS, template **3D (Built-in / URP)**.

## 1. Project
1. Unity Hub > New project > 3D > name it `Rail-Yatra`.
2. Close Unity. Copy `Assets/Scripts` from this repo into the new project's `Assets/` folder (or copy the new project's `ProjectSettings` + `Packages` into this repo folder and open it).
3. Open the project. **Edit > Project Settings > Player > Other Settings > Active Input Handling = "Both"** (scripts use the classic Input API). Unity will restart.

## 2. Test scene
1. New scene `City_Start`. Add a **Plane** (scale 10,1,10) as the ground.
2. **Player**: create a Capsule named `Player`, position (0,1,0). Remove its Capsule Collider, add **Character Controller**, then add `PlayerController`.
3. **Camera**: select Main Camera, add `CameraFollow`, drag `Player` into **Target**.
4. In `PlayerController`, drag the Main Camera into **Camera Transform**.
5. Empty GameObject `Systems`: add `GameClock`, `SaveManager`. In SaveManager assign **Player** and **Clock**.
6. Press Play: WASD move, Shift run, Space jump, right mouse drag = look, scroll = zoom.

## 3. Mobile joystick (optional)
1. GameObject > UI > Canvas (also creates EventSystem).
2. Under Canvas: Image `Joystick` (bottom-left, 200x200, semi-transparent) with a child Image `Handle` (80x80).
3. Add `VirtualJoystick` to `Joystick`, assign **Handle**. Drag `Joystick` into PlayerController's **Joystick** field.
4. Dragging on the right half of the screen rotates the camera.

## 4. Check save
Play, walk somewhere, stop Play, Play again: the player should reappear where it was. Save file path is printed in the Console ("Saved to ...").

## 5. Android build
File > Build Profiles > Android > Switch Platform > Player Settings: Company/Product name, Min API 24+, Scripting Backend IL2CPP, ARM64 on. Build the APK later (P9).
