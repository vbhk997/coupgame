function Lobby({ gameState, onStartGame, isHost, roomCode }) {
    const { players } = gameState

    return (
        <div className="glass-panel animate-in" style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '1rem', fontSize: '2rem' }}>Room Code: <span style={{ color: 'var(--primary-color)', letterSpacing: '2px' }}>{roomCode}</span></h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Share this code with your friends to let them join.</p>

            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '1rem', marginBottom: '2rem', minHeight: '150px' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Players ({players.length}/6)</h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {players.map((p, idx) => (
                        <li key={p.id} style={{
                            padding: '0.75rem',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.1rem'
                        }}>
                            {p.name} {idx === 0 && <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: 'var(--primary-color)' }}>(Host)</span>}
                        </li>
                    ))}
                    {players.length === 0 && <li style={{ color: 'var(--text-muted)' }}>Waiting for players...</li>}
                </ul>
            </div>

            {isHost ? (
                <button
                    className="primary"
                    onClick={onStartGame}
                    disabled={players.length < 2}
                    style={{ width: '100%', opacity: players.length < 2 ? 0.5 : 1, cursor: players.length < 2 ? 'not-allowed' : 'pointer' }}
                >
                    {players.length >= 2 ? 'Start Game' : 'Waiting for more players...'}
                </button>
            ) : (
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Waiting for host to start the game...</p>
            )}
        </div>
    )
}

export default Lobby
