import { useCallback, useEffect, useMemo, useState } from 'react'
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
    const pollMs = Number(import.meta.env.VITE_POLL_MS ?? 3000)
    const pollIntervalMs =
        Number.isFinite(pollMs) && pollMs > 0 ? pollMs : 3000

    const activeAuctions = useMemo(
        () => auctions.filter((auction) => auction.status === 'ACTIVE'),
        [auctions],
    )
    const completedAuctions = useMemo(
        () => auctions.filter((auction) => auction.status === 'COMPLETED'),
        [auctions],
    )

    const loadAuctions = useCallback(
        async (silent = false) => {
            if (!silent) {
                setLoadingAuctions(true)
            }
        try {
            const response = await api.get<Auction[]>('/auctions')
            setAuctions(response)
        } catch (error) {
            setError(error as { message: string; correlationId?: string })
        } finally {
            if (!silent) {
                setLoadingAuctions(false)
            }
        }
        },
        [setError],
    )

    useEffect(() => {
        void loadAuctions()
        const timer = setInterval(() => {
            void loadAuctions(true)
        }, pollIntervalMs)
        return () => clearInterval(timer)
    }, [loadAuctions, pollIntervalMs])

    useEffect(() => {
        if (!user) {
            return
        }
        void refreshWallet()
    }, [refreshWallet, user])

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
                                ({formatStars(wallet.lockedAmount)} locked)
                            </span>
                        )}
                    </div>
                </div>
            </header>

            <div className="toolbar">
                <Link to="/gift-auction/auctions/new" className="button">
                    Create auction
                </Link>
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
                            <div className="card-title">
                                {auction.giftName}
                            </div>
                            <div className="card-meta">
                                {auction.remainingItems} gifts left
                            </div>
                            <div className="card-meta">
                                Round {auction.currentRoundNumber} of{' '}
                                {auction.roundsTotal}
                            </div>
                            <div className="card-meta">
                                Ends in {formatTimer(auction.timeLeftSeconds)}
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
                            <div className="card-title">
                                {auction.giftName}
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
