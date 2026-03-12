import { useState } from 'react'
import { ACTIONS, COUNTER_ACTIONS, TURN_STATES, GAME_STATES, ROLES } from '../shared/constants'

function GameBoard({ gameState, socket, playerId }) {
    const { players, playerStates, currentTurnState, currentPlayerId, actionHistory, pendingAction } = gameState

    const me = playerStates[playerId]
    const isMyTurn = currentPlayerId === playerId

    const handleAction = (actionType, targetId = null) => {
        socket.emit('take_action', { actionType, targetId })
    }

    const handlePass = () => {
        socket.emit('pass')
    }

    const handleChallenge = () => {
        socket.emit('challenge')
    }

    const handleBlock = (blockRole) => {
        socket.emit('block', { blockRole })
    }

    // Helper to determine if we should show target selection
    // For simplicity, we can render target buttons immediately 
    // if an action requires a target (like Assassinate, Steal, Coup)

    const renderActionMenu = () => {
        if (gameState.gameState === GAME_STATES.GAME_OVER) {
            const winner = players.find(p => !playerStates[p.id].influence.every(c => c.isRevealed))
            return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <h3 style={{ color: 'var(--primary-color)', fontSize: '1.5rem' }}>
                        🏆 {winner ? `${winner.name} wins!` : 'Game Over!'}
                    </h3>
                    <button className="primary" onClick={() => socket.emit('restart_game')}>
                        Play Again
                    </button>
                </div>
            )
        }

        if (currentTurnState === TURN_STATES.WAITING_FOR_ACTION && isMyTurn) {
            return (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                    <button className="primary" onClick={() => handleAction(ACTIONS.INCOME)}>Income (+1)</button>
                    <button className="primary" onClick={() => handleAction(ACTIONS.FOREIGN_AID)}>Foreign Aid (+2)</button>
                    <button className="primary" onClick={() => handleAction(ACTIONS.TAX)}>Tax (+3, <span style={{ fontSize: '0.8em' }}>Duke</span>)</button>
                    <button className="primary" onClick={() => handleAction(ACTIONS.EXCHANGE)}>Exchange (<span style={{ fontSize: '0.8em' }}>Ambassador</span>)</button>

                    {players.filter(p => p.id !== playerId && !playerStates[p.id].influence.every(c => c.isRevealed)).map(opp => (
                        <div key={opp.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', padding: '0.5rem', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target: {opp.name}</span>
                            <button className="danger" onClick={() => handleAction(ACTIONS.COUP, opp.id)} disabled={me.coins < 7}>Coup (-7)</button>
                            <button className="danger" onClick={() => handleAction(ACTIONS.ASSASSINATE, opp.id)} disabled={me.coins < 3}>Assassinate (-3, <span style={{ fontSize: '0.8em' }}>Assassin</span>)</button>
                            <button className="secondary" onClick={() => handleAction(ACTIONS.STEAL, opp.id)}>Steal (+2, <span style={{ fontSize: '0.8em' }}>Captain</span>)</button>
                        </div>
                    ))}
                </div>
            )
        }

        if ((currentTurnState === TURN_STATES.WAITING_FOR_CHALLENGE_OR_BLOCK && !isMyTurn) ||
            (currentTurnState === TURN_STATES.WAITING_FOR_BLOCK_RESPONSE && pendingAction?.blocker !== playerId)) {

            // Current pending action can be challenged or blocked. Or a block was played and can be challenged.
            const isChallengingBlock = currentTurnState === TURN_STATES.WAITING_FOR_BLOCK_RESPONSE;
            const actionTakesTarget = pendingAction?.target === playerId;

            // Determine if I am eligible to respond
            let isEligible = false;
            if (isChallengingBlock) {
                isEligible = (playerId === pendingAction?.player);
            } else {
                if (pendingAction?.target) {
                    isEligible = (playerId === pendingAction?.target);
                } else {
                    isEligible = true; // Untargeted action => everyone except actor (who is excluded by !isMyTurn) can respond
                }
            }

            if (!isEligible || gameState.passVotes?.includes(playerId)) {
                // Show waiting text
                const waitingForName = isChallengingBlock
                    ? playerStates[pendingAction.player].name
                    : playerStates[pendingAction.target]?.name || 'others';

                const message = !isEligible
                    ? `Waiting for ${waitingForName} to respond...`
                    : `You passed. Waiting for others...`;

                return (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic', padding: '1rem' }}>
                        {isChallengingBlock
                            ? `${playerStates[pendingAction.blocker].name} blocked claiming ${pendingAction.blockRoleClaimed}!`
                            : 'An action is pending...'}
                        <br />
                        {message}
                    </div>
                )
            }

            return (
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                    <div style={{ color: 'var(--text-muted)' }}>
                        {isChallengingBlock
                            ? `${playerStates[pendingAction.blocker].name} blocked claiming ${pendingAction.blockRoleClaimed}!`
                            : 'An action is pending...'}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="primary" onClick={handlePass}>Pass (Do Nothing)</button>

                        {/* Challenge the action OR the block */}
                        {(pendingAction?.roleClaimed || isChallengingBlock) && (
                            <button className="danger" onClick={handleChallenge}>Challenge Claim!</button>
                        )}

                        {/* Only offer blocks on the initial action, not on a block itself */}
                        {!isChallengingBlock && pendingAction?.type === ACTIONS.FOREIGN_AID && <button className="secondary" onClick={() => handleBlock(ROLES.DUKE)}>Block (Claim Duke)</button>}
                        {!isChallengingBlock && pendingAction?.type === ACTIONS.ASSASSINATE && actionTakesTarget && <button className="secondary" onClick={() => handleBlock(ROLES.CONTESSA)}>Block (Claim Contessa)</button>}
                        {!isChallengingBlock && pendingAction?.type === ACTIONS.STEAL && actionTakesTarget && (
                            <>
                                <button className="secondary" onClick={() => handleBlock(ROLES.CAPTAIN)}>Block (Claim Captain)</button>
                                <button className="secondary" onClick={() => handleBlock(ROLES.AMBASSADOR)}>Block (Claim Ambassador)</button>
                            </>
                        )}
                    </div>
                </div>
            )
        }

        if (currentTurnState === TURN_STATES.WAITING_FOR_REVEAL && pendingAction?.playerToReveal === playerId) {
            return (
                <div>
                    <h3 style={{ color: 'var(--accent-color)' }}>You must reveal an influence!</h3>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        {me.influence.map((card, i) => !card.isRevealed && (
                            <button key={i} className="danger" onClick={() => socket.emit('reveal_card', { cardIndex: i })}>
                                Reveal {card.role}
                            </button>
                        ))}
                    </div>
                </div>
            )
        }

        return <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Waiting for other players...</p>
    }

    return (
        <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '1400px', flex: 1, minHeight: 0 }}>

            {/* Sidebar: Event Log — fixed width, full height */}
            <div className="glass-panel" style={{ width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '1rem' }}>
                <h3 style={{ marginBottom: '0.75rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', fontSize: '1rem', flexShrink: 0 }}>Event Log</h3>
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem' }}>
                    {actionHistory.map((log, i) => (
                        <div key={i} style={{ padding: '0.4rem 0.5rem', background: 'var(--glass-bg)', borderRadius: '6px' }}>{log}</div>
                    ))}
                    {actionHistory.length === 0 && <span style={{ color: 'var(--text-muted)' }}>No events yet...</span>}
                </div>
            </div>

            {/* Main Game Area — fills remaining width, splits into two fixed rows */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* Opponents Table — always exactly 35% of column height */}
                <div className="glass-panel" style={{
                    flex: '0 0 35%',
                    display: 'flex', flexWrap: 'wrap', gap: '0.75rem',
                    justifyContent: 'center', alignItems: 'center',
                    padding: '1rem', overflowY: 'auto'
                }}>
                    {players.filter(p => p.id !== playerId).map(opp => {
                        const state = playerStates[opp.id]
                        const isTurn = currentPlayerId === opp.id
                        const eliminated = state.influence.every(c => c.isRevealed)
                        return (
                            <div key={opp.id} style={{
                                padding: '0.75rem',
                                background: isTurn ? 'rgba(139, 92, 246, 0.2)' : 'var(--glass-bg)',
                                border: isTurn ? '1px solid var(--primary-color)' : '1px solid var(--glass-border)',
                                borderRadius: '12px',
                                width: '160px',
                                flexShrink: 0,
                                opacity: eliminated ? 0.5 : 1
                            }}>
                                <h4 style={{ color: isTurn ? 'var(--primary-color)' : 'white', marginBottom: '0.25rem', fontSize: '0.9rem' }}>{state.name}</h4>
                                <div style={{ marginBottom: '0.5rem', color: '#fbbf24', fontWeight: 'bold', fontSize: '0.85rem' }}>Coins: {state.coins}</div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {state.influence.map((card, i) => {
                                        const isUnknown = card.role === 'UNKNOWN';
                                        return (
                                            <div key={i} style={{
                                                flex: 1,
                                                aspectRatio: '398/616',
                                                background: isUnknown ? 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))' : `url('/assets/cards/${card.role}.png') center/cover no-repeat`,
                                                borderRadius: '6px',
                                                border: card.isRevealed ? '2px solid #fb7185' : '1px solid var(--glass-border)',
                                                position: 'relative', overflow: 'hidden',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                opacity: card.isRevealed ? 0.3 : 1,
                                                filter: card.isRevealed ? 'grayscale(100%)' : 'none'
                                            }}>
                                                {isUnknown && <div style={{ color: 'var(--text-muted)', fontSize: '1.5rem' }}>?</div>}
                                                {card.isRevealed && <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', background: '#fb7185', color: '#000', width: '100%', textAlign: 'center', fontWeight: 'bold', fontSize: '0.6rem', padding: '2px 0', zIndex: 10 }}>DEAD</div>}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* My Hand & Actions — horizontal: cards left, actions right */}
                <div className="glass-panel animate-in" style={{
                    flex: 1, minHeight: 0,
                    padding: '1rem', display: 'flex', flexDirection: 'row',
                    alignItems: 'stretch', gap: '1.5rem', overflow: 'hidden'
                }}>
                    {/* LEFT: Card info */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', gap: '1rem' }}>
                            <h2 style={{ fontSize: '1rem', whiteSpace: 'nowrap' }}>My Hand</h2>
                            <div style={{ color: '#fbbf24', fontSize: '1rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{me.coins} Coins</div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', flex: 1, alignItems: 'center' }}>
                            {me.influence.map((card, i) => (
                                <div key={i} style={{
                                    width: 'clamp(70px, 8vw, 130px)',
                                    aspectRatio: '398/616',
                                    background: `url('/assets/cards/${card.role}.png') center/cover no-repeat`,
                                    borderRadius: '8px',
                                    border: card.isRevealed ? '2px solid #fb7185' : '2px solid var(--primary-color)',
                                    boxShadow: card.isRevealed ? 'none' : '0 8px 20px -4px rgba(0,0,0,0.8)',
                                    position: 'relative', overflow: 'hidden',
                                    opacity: card.isRevealed ? 0.4 : 1,
                                    filter: card.isRevealed ? 'grayscale(100%)' : 'none',
                                    transition: 'transform 0.2s'
                                }}>
                                    {card.isRevealed && <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', background: '#fb7185', color: '#000', width: '100%', textAlign: 'center', fontWeight: 'bold', fontSize: '1rem', padding: '4px 0', zIndex: 10, letterSpacing: '2px' }}>DEAD</div>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Vertical divider */}
                    <div style={{ width: '1px', background: 'var(--glass-border)', flexShrink: 0 }} />

                    {/* RIGHT: Action buttons */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', paddingTop: '0.25rem' }}>
                        {renderActionMenu()}
                    </div>
                </div>

            </div>
        </div>
    )
}

export default GameBoard
