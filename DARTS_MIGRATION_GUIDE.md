# Darts Game Logic Migration Guide

## Overview

The darts game logic has been moved from the frontend (React Context) to the backend (Node.js server). This provides several benefits:

- **Centralized State**: Game state is managed on the server, preventing desync issues
- **Direct Mobile Communication**: Mobile apps can communicate directly with the server without routing through the frontend
- **Better Performance**: Reduced data transfer and processing on client devices
- **Security**: Game logic validation happens server-side
- **Scalability**: Multiple clients can watch the same game in real-time

## Architecture Changes

### Before (Frontend-based)

```
Mobile App → Frontend (DartsGameContext) → Socket.IO → Backend (just storage)
                      ↓
                Game Logic & State
```

### After (Backend-based)

```
Mobile App ────────────────────┐
                                ↓
Frontend (UI only) ──→ Socket.IO → Backend (DartsGameManager) → Database
                                           ↓
                                    Game Logic & State
```

## Backend Implementation

### 1. Game Manager (`backend/services/dartsGameManager.js`)

- **DartsGameManager class**: Manages individual game state and logic
- **Methods**:
  - `handleThrow(value, action)`: Process player throws
  - `handleBack()`: Undo last action
  - `handleGameEnd()`: End game and update statistics
  - `updateGameState()`: Save to database and broadcast to clients

### 2. Socket.IO Listeners (`backend/socket.io/listeners.js`)

New socket events:

- `game:throw` - Client sends throw data
- `game:back` - Client requests undo
- `game:end` - Game cleanup
- `updateLiveGamePreviewClient` - Server broadcasts game state updates
- `gameEndClient` - Server broadcasts game end
- `userOverthrowClient` - Server broadcasts overthrow events

### 3. WLED Service (`backend/services/wledService.js`)

Handles LED effects server-side:

- `wled:effect-solid`
- `wled:game-end`
- `wled:throw-doors`
- `wled:throw-t20`
- `wled:throw-d25`
- `wled:throw-180`
- `wled:overthrow`

## Frontend Migration

### New Socket Adapter (`frontend/src/lib/dartsGameSocket.js`)

Replace `DartsGameContext` usage with socket adapter functions:

#### Old Way (Context):

```javascript
import { DartsGameContext } from "@/context/Home/DartsGameContext";

const { handleRound, game, setGame } = useContext(DartsGameContext);

// Throw a dart
handleRound(20, handleShow);
```

#### New Way (Socket):

```javascript
import {
  sendThrow,
  subscribeToGameUpdates,
  joinGameRoom,
} from "@/lib/dartsGameSocket";

// Join game room
useEffect(() => {
  joinGameRoom(game.gameCode);
}, [game.gameCode]);

// Subscribe to game updates
useEffect(() => {
  const unsubscribe = subscribeToGameUpdates(game.gameCode, (updatedGame) => {
    setGame(updatedGame);
  });
  return unsubscribe;
}, [game.gameCode]);

// Throw a dart
const handleThrow = async (value) => {
  try {
    const result = await sendThrow(game.gameCode, value);
    if (result.gameEnd) {
      // Handle game end
    }
  } catch (error) {
    console.error("Throw error:", error);
  }
};
```

### Migration Steps

1. **Remove DartsGameContext logic** (keep the context but simplify it to just store game state)
2. **Update Game component** to use socket adapter
3. **Update mobile app** to send throws directly to backend
4. **Test with multiple clients** to ensure sync

### Example Component Migration

#### Before:

```javascript
// Game.jsx
const { handleRound, game } = useContext(DartsGameContext);

const handleButtonClick = (value) => {
  handleRound(value, handleShow);
};
```

#### After:

```javascript
// Game.jsx
import { sendThrow, subscribeToGameUpdates } from "@/lib/dartsGameSocket";

const [game, setGame] = useState(null);

useEffect(() => {
  const unsubscribe = subscribeToGameUpdates(game.gameCode, setGame);
  return unsubscribe;
}, [game.gameCode]);

const handleButtonClick = async (value) => {
  try {
    await sendThrow(game.gameCode, value);
    // Game state will be updated via subscription
  } catch (error) {
    console.error("Error:", error);
  }
};
```

## Mobile App Integration

Mobile apps should connect directly to the backend:

```javascript
// Mobile app
import io from "socket.io-client";

const socket = io("https://your-backend-domain.com");

// Send throw
const throwDart = (gameCode, value) => {
  socket.emit(
    "game:throw",
    JSON.stringify({
      gameCode,
      value,
      action: null,
    }),
  );
};

// Listen for updates
socket.on("updateLiveGamePreviewClient", (data) => {
  const game = JSON.parse(data);
  updateGameUI(game);
});
```

## API Functions Available

### Socket Adapter Functions

1. **sendThrow(gameCode, value, action)**
   - Send a dart throw to the server
   - `action`: null, 'DOUBLE', or 'TRIPLE'
   - Returns: Promise with game state

2. **sendBack(gameCode)**
   - Undo last action
   - Returns: Promise with game state

3. **endGame(gameCode)**
   - Clean up game resources
   - Returns: Promise

4. **subscribeToGameUpdates(gameCode, callback)**
   - Listen for game state changes
   - Returns: Unsubscribe function

5. **subscribeToOverthrows(callback)**
   - Listen for overthrow events
   - Returns: Unsubscribe function

6. **subscribeToGameEnd(callback)**
   - Listen for game end events
   - Returns: Unsubscribe function

7. **joinGameRoom(gameCode)**
   - Join socket room for game updates

8. **leaveGameRoom(gameCode)**
   - Leave socket room

9. **sendExternalKeyboardInput(gameCode, input)**
   - Send input from external keyboard (mobile)
   - **Note:** External keyboard now communicates directly with backend. The backend processes inputs through the game manager and updates all clients via normal game update events (updateLiveGamePreviewClient, etc.)

## Testing Checklist

- [*] Single player game works
- [ ] Multiplayer game syncs across clients
- [ ] Mobile app can control game
- [ ] Overthrows are detected correctly
- [ ] Game end and statistics save properly
- [ ] WLED effects trigger correctly
- [ ] Back button restores state properly
- [*] Reconnection after disconnect works
- [ ] Multiple games can run simultaneously

## Benefits Achieved

1. ✅ **No more frontend-backend-frontend routing** for mobile inputs
2. ✅ **Centralized game state** prevents desync issues
3. ✅ **Better mobile performance** - direct communication
4. ✅ **Server-side validation** of all game actions
5. ✅ **Real-time spectator support** - anyone can watch any game
6. ✅ **Easier debugging** - all logic in one place
7. ✅ **Better scalability** - server manages all game instances

## Rollback Plan

If issues arise, the old frontend logic is preserved in:

- `frontend/src/context/Home/DartsGameContext.jsx` (backup)
- `frontend/src/components/Home/Darts/game logic/` (all files)

Simply revert socket.io changes and re-enable the context provider.
