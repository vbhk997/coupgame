import { useState } from 'react'

function Landing({ onCreateRoom, onJoinRoom, error }) {
    const [name, setName] = useState('')
    const [roomCode, setRoomCode] = useState('')
    const [isJoining, setIsJoining] = useState(false)

    const handleCreate = (e) => {
        e.preventDefault()
        if (name.trim()) onCreateRoom(name)
    }

    const handleJoin = (e) => {
        e.preventDefault()
        if (name.trim() && roomCode.trim()) onJoinRoom(roomCode.toUpperCase(), name)
    }

    return (
        <div className="glass-panel animate-in" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
            <h1 className="title" style={{ fontSize: '3rem', marginBottom: '1rem' }}>COUP</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>A game of deduction and deception.</p>

            {error && <div style={{ color: 'var(--accent-color)', marginBottom: '1rem' }}>{error}</div>}

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    className={!isJoining ? 'primary' : 'secondary'}
                    style={{ flex: 1 }}
                    onClick={() => setIsJoining(false)}
                >
                    Create Room
                </button>
                <button
                    className={isJoining ? 'primary' : 'secondary'}
                    style={{ flex: 1 }}
                    onClick={() => setIsJoining(true)}
                >
                    Join Room
                </button>
            </div>

            {!isJoining ? (
                <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Your Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        maxLength={15}
                    />
                    <button type="submit" className="primary" style={{ marginTop: '1rem' }}>Create</button>
                </form>
            ) : (
                <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Your Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        maxLength={15}
                    />
                    <input
                        type="text"
                        placeholder="Room Code"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        required
                        maxLength={6}
                    />
                    <button type="submit" className="primary" style={{ marginTop: '1rem' }}>Join</button>
                </form>
            )}
        </div>
    )
}

export default Landing
