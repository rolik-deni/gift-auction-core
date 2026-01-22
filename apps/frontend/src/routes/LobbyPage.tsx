import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { api } from '../shared/api'
import { useError, useSession } from '../shared/context'
import { formatStars, formatTimer } from '../shared/format'
import type { Auction } from '../shared/types'

export const LobbyPage = () => {
    const { user, wallet, loading, refreshWallet } = useSession()
    const { setError } = useError()
    const [auctions, setAuctions] = useState<Auction[]>([])
    const [loadingAuctions, setLoadingAuctions] = useState(false)

    const activeAuctions = useMemo(
        () => auctions.filter((auction) => auction.status === 'ACTIVE'),
        [auctions],
    )
    const completedAuctions = useMemo(
        () => auctions.filter((auction) => auction.status === 'COMPLETED'),
        [auctions],
    )

    const loadAuctions = async () => {
        setLoadingAuctions(true)
        try {
            const response = await api.get<Auction[]>('/auctions')
            setAuctions(response)
        } catch (error) {
            setError(error as { message: string; correlationId?: string })
        } finally {
            setLoadingAuctions(false)
        }
    }

    useEffect(() => {
        void loadAuctions()
    }, [])

    return (
        <div className="page">
            <header className="header">
                <div className="header-title">Gift Auction Lobby</div>
                <div className="header-meta">
                    <div>
                        User: <strong>{user?.name ?? 'Loading...'}</strong>
                    </div>
                    <div>
                        Wallet:{' '}
                        <strong>
                            {wallet
                                ? formatStars(wallet.balanceAmount)
                                : '...'}
                        </strong>
                        {wallet && wallet.lockedAmount !== '0' && (
                            <span className="muted">
                                {' '}
                                (Locked {formatStars(wallet.lockedAmount)})
                            </span>
                        )}
                    </div>
                    <button
                        className="button secondary"
                        onClick={() => refreshWallet()}
                        disabled={loading}
                    >
                        Refresh wallet
                    </button>
                </div>
            </header>

            <div className="toolbar">
                <Link to="/gift-auction/auctions/new" className="button">
                    Create auction
                </Link>
                <button
                    className="button ghost"
                    onClick={() => loadAuctions()}
                    disabled={loadingAuctions}
                >
                    Refresh list
                </button>
            </div>

            <section className="section">
                <h2>Active auctions</h2>
                {loadingAuctions && <div className="muted">Loading...</div>}
                {!loadingAuctions && activeAuctions.length === 0 && (
                    <div className="muted">No active auctions yet.</div>
                )}
                <div className="cards">
                    {activeAuctions.map((auction) => (
                        <article key={auction.id} className="card">
                            <div className="card-title">{auction.title}</div>
                            <div className="card-meta">
                                Gift: {auction.giftName}
                            </div>
                            <div className="card-meta">Status: ACTIVE</div>
                            <div className="card-meta">
                                Round: {auction.currentRoundNumber}/
                                {auction.roundsTotal}
                            </div>
                            <div className="card-meta">
                                Remaining: {auction.remainingItems}
                            </div>
                            <div className="card-meta">
                                Time left: {formatTimer(auction.timeLeftSeconds)}
                            </div>
                            <Link
                                to={`/gift-auction/auctions/${auction.id}`}
                                className="button"
                            >
                                Join
                            </Link>
                        </article>
                    ))}
                </div>
            </section>

            <section className="section">
                <h2>Completed auctions</h2>
                {!loadingAuctions && completedAuctions.length === 0 && (
                    <div className="muted">No completed auctions yet.</div>
                )}
                <div className="cards">
                    {completedAuctions.map((auction) => (
                        <article key={auction.id} className="card">
                            <div className="card-title">{auction.title}</div>
                            <div className="card-meta">
                                Gift: {auction.giftName}
                            </div>
                            <div className="card-meta">Status: COMPLETED</div>
                            <div className="card-meta">
                                Rounds: {auction.roundsTotal}
                            </div>
                            <Link
                                to={`/gift-auction/auctions/${auction.id}`}
                                className="button secondary"
                            >
                                Open results
                            </Link>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    )
}
