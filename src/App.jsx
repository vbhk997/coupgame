import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { GAME_STATES } from './shared/constants'
import Landing from './components/Landing'
import Lobby from './components/Lobby'
import GameBoard from './components/GameBoard'

import './index.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'
const socket = io(BACKEND_URL)

function App() {
  const [gameState, setGameState] = useState(null)
  const [roomCode, setRoomCode] = useState(null)
  const [playerName, setPlayerName] = useState('')
  const [playerId, setPlayerId] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    socket.on('connect', () => {
      setPlayerId(socket.id)
    })

    socket.on('game_state_update', (newState) => {
      setGameState(newState)
      setError(null)
    })

    socket.on('error', (msg) => {
      setError(msg)
    })

    return () => {
      socket.off('connect')
      socket.off('game_state_update')
      socket.off('error')
    }
  }, [])

  const handleCreateRoom = (name) => {
    setPlayerName(name)
    socket.emit('create_room', { playerName: name })
  }

  const handleJoinRoom = (code, name) => {
    setPlayerName(name)
    setRoomCode(code)
    socket.emit('join_room', { roomCode: code, playerName: name })
  }

  const handleStartGame = () => {
    socket.emit('start_game')
  }

  // Determine what to render based on game state
  // We infer if the user is in a room if gameState exists
  let content = <Landing onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} error={error} />

  if (gameState) {
    if (gameState.gameState === GAME_STATES.LOBBY) {
      content = <Lobby gameState={gameState} onStartGame={handleStartGame} isHost={gameState.players[0]?.id === playerId} roomCode={gameState.roomCode} />
    } else if (gameState.gameState === GAME_STATES.PLAYING || gameState.gameState === GAME_STATES.GAME_OVER) {
      content = <GameBoard gameState={gameState} socket={socket} playerId={playerId} />
    }
  }

  return (
    <div className="app-container">
      {content}
    </div>
  )
}

export default App
