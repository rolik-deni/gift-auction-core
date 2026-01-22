import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { api } from '../shared/api'
import { useError, useSession } from '../shared/context'
import { formatStars, formatTimer } from '../shared/format'
import type {
    Auction,
    HistoryResponse,
    LeaderboardResponse,
} from '../shared/types'

const pollMs = Number(import.meta.env.VITE_POLL_MS ?? 3000)

export const AuctionRoomPage = () => {
    const { auctionId } = useParams()
    const { user, wallet, refreshWallet } = useSession()
    const { setError } = useError()
    const [auction, setAuction] = useState<Auction | null>(null)
    const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(
        null,
    )
    const [history, setHistory] = useState<HistoryResponse | null>(null)
    const [bidAmount, setBidAmount] = useState('')
    const [loading, setLoading] = useState(true)

    const loadAuction = useCallback(async () => {
        if (!auctionId) {
            return null
        }
        const data = await api.get<Auction>(`/auctions/${auctionId}`)
        setAuction(data)
        return data
    }, [auctionId])

    const loadLeaderboard = useCallback(async () => {
        if (!auctionId || !user?.id) {
            return
        }
        const data = await api.get<LeaderboardResponse>(
            `/auctions/${auctionId}/leaderboard?userId=${user.id}`,
        )
        setLeaderboard(data)
    }, [auctionId, user?.id])

    const loadHistory = useCallback(async () => {
        if (!auctionId) {
            return
        }
        const data = await api.get<HistoryResponse>(
            `/auctions/${auctionId}/history`,
        )
        setHistory(data)
    }, [auctionId])

    const refreshAll = useCallback(async () => {
        try {
            const freshAuction = await loadAuction()
            if (freshAuction?.status === 'ACTIVE') {
                await loadLeaderboard()
            }
            if (freshAuction?.status === 'COMPLETED') {
                await loadHistory()
            }
        } catch (error) {
            setError(error as { message: string; correlationId?: string })
        }
    }, [loadAuction, loadHistory, loadLeaderboard, setError])

    useEffect(() => {
        const init = async () => {
            setLoading(true)
            await refreshAll()
            setLoading(false)
        }
        void init()
    }, [refreshAll])

    useEffect(() => {
        if (auction?.status !== 'ACTIVE') {
            return
        }
        const interval = window.setInterval(() => {
            void refreshAll()
        }, Number.isFinite(pollMs) ? pollMs : 3000)

        return () => window.clearInterval(interval)
    }, [auction?.status, refreshAll])

    const submitBid = async () => {
        if (!auctionId || !user?.id) {
            return
        }
        try {
            await api.post(`/auctions/${auctionId}/bid`, {
                userId: user.id,
                amount: bidAmount,
            })
            setBidAmount('')
            await refreshWallet()
            await refreshAll()
        } catch (error) {
            setError(error as { message: string; correlationId?: string })
        }
    }

    const isActive = auction?.status === 'ACTIVE'
    const isCompleted = auction?.status === 'COMPLETED'

    const topEntries = leaderboard?.top ?? []
    const myEntry = leaderboard?.me ?? null

    const roundInfo = useMemo(() => {
        if (!auction) {
            return ''
        }
        return `${auction.currentRoundNumber}/${auction.roundsTotal}`
    }, [auction])

    return (
        <div className="page">
            <header className="header">
                <div className="header-title">Auction room</div>
                <div className="header-meta">
                    <Link to="/gift-auction/" className="button ghost">
                        Back to lobby
                    </Link>
                </div>
            </header>

            {loading && <div className="muted">Loading auction...</div>}

            {auction && (
                <section className="section">
                    <div className="card">
                        <div className="card-title">{auction.title}</div>
                        <div className="card-meta">
                            Gift: {auction.giftName}
                        </div>
                        <div className="card-meta">Status: {auction.status}</div>
                        <div className="card-meta">Round: {roundInfo}</div>
                        <div className="card-meta">
                            Remaining: {auction.remainingItems}
                        </div>
                        <div className="card-meta">
                            Time left: {formatTimer(auction.timeLeftSeconds)}
                        </div>
                        <div className="card-meta">
                            Entry price: {formatStars(auction.entryPriceAmount)}
                        </div>
                    </div>
                </section>
            )}

            {isActive && auction && (
                <section className="section grid">
                    <div className="card">
                        <h3>Place bid</h3>
                        <div className="card-meta">
                            Wallet: {wallet ? formatStars(wallet.balanceAmount) : '...'}
                        </div>
                        <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={bidAmount}
                            onChange={(event) => setBidAmount(event.target.value)}
                            placeholder={auction.entryPriceAmount}
                        />
                        <button
                            className="button"
                            onClick={() => submitBid()}
                            disabled={!bidAmount}
                        >
                            Place bid
                        </button>
                    </div>

                    <div className="card">
                        <h3>Leaderboard</h3>
                        {topEntries.length === 0 && (
                            <div className="muted">No bids yet.</div>
                        )}
                        {topEntries.map((entry) => (
                            <div key={entry.userId} className="leader-row">
                                <span>#{entry.rank}</span>
                                <span>{entry.userName}</span>
                                <span>{formatStars(entry.amount)}</span>
                            </div>
                        ))}
                        {myEntry && (
                            <div className="leader-me">
                                <div>
                                    You: #{myEntry.rank} •{' '}
                                    {formatStars(myEntry.amount)}
                                </div>
                                <div className="muted">
                                    {myEntry.isWinning
                                        ? 'In top winners'
                                        : 'Outside winners'}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {isCompleted && (
                <section className="section">
                    <h2>Round winners</h2>
                    {!history && <div className="muted">Loading history...</div>}
                    {history?.rounds.map((round) => (
                        <div key={round.roundNumber} className="card">
                            <div className="card-title">
                                Round {round.roundNumber}
                            </div>
                            {round.winners.length === 0 && (
                                <div className="muted">No winners.</div>
                            )}
                            {round.winners.map((winner) => (
                                <div
                                    key={`${round.roundNumber}-${winner.userId}`}
                                    className="leader-row"
                                >
                                    <span>#{winner.rank}</span>
                                    <span>{winner.userId.slice(0, 8)}</span>
                                    <span>{formatStars(winner.bidAmount)}</span>
                                </div>
                            ))}
                        </div>
                    ))}
                </section>
            )}
        </div>
    )
}
