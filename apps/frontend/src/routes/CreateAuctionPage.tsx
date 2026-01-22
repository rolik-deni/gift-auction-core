import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { api } from '../shared/api'
import { useError } from '../shared/context'
import type { IdResponse } from '../shared/types'

const initialForm = {
    giftName: '',
    totalItems: 100,
    roundsTotal: 1,
    roundDurationSeconds: 60,
    entryPriceAmount: '10',
}

export const CreateAuctionPage = () => {
    const navigate = useNavigate()
    const { setError } = useError()
    const [form, setForm] = useState(initialForm)
    const [submitting, setSubmitting] = useState(false)
    const [validationError, setValidationError] = useState<string | null>(null)

    const isValid = useMemo(() => {
        const hasGiftName = form.giftName.trim().length > 0
        const totalItemsValid = form.totalItems >= 1 && form.totalItems <= 1000
        const roundsTotalValid = form.roundsTotal >= 1 && form.roundsTotal <= 5
        const roundDurationValid =
            form.roundDurationSeconds >= 30 &&
            form.roundDurationSeconds <= 600
        const entryValid = Number(form.entryPriceAmount) > 0
        const divisible = form.totalItems % form.roundsTotal === 0
        return (
            hasGiftName &&
            totalItemsValid &&
            roundsTotalValid &&
            roundDurationValid &&
            entryValid &&
            divisible
        )
    }, [form])

    const onSubmit = async () => {
        setValidationError(null)
        if (form.totalItems % form.roundsTotal !== 0) {
            setValidationError('totalItems должно делиться на roundsTotal')
            return
        }
        if (!isValid) {
            setValidationError('Проверьте поля формы')
            return
        }

        setSubmitting(true)
        try {
            const created = await api.post<IdResponse>('/auctions', {
                giftName: form.giftName,
                totalItems: form.totalItems,
                roundsTotal: form.roundsTotal,
                roundDurationSeconds: form.roundDurationSeconds,
                entryPriceAmount: form.entryPriceAmount,
                entryPriceCurrency: 'XTR',
            })

            await api.patch(`/auctions/${created.id}/start`)
            navigate(`/gift-auction/auctions/${created.id}`)
        } catch (error) {
            setError(error as { message: string; correlationId?: string })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="page">
            <header className="header">
                <div className="header-title">Create auction</div>
            </header>

            <div className="card form-card">
                <label className="field">
                    <span>Gift name</span>
                    <input
                        value={form.giftName}
                        onChange={(event) =>
                            setForm({ ...form, giftName: event.target.value })
                        }
                        placeholder="Gift name"
                    />
                </label>
                <label className="field">
                    <span>Total items (1..1000)</span>
                    <input
                        type="number"
                        min={1}
                        max={1000}
                        value={form.totalItems}
                        onChange={(event) =>
                            setForm({
                                ...form,
                                totalItems: Number(event.target.value),
                            })
                        }
                    />
                </label>
                <label className="field">
                    <span>Rounds total (1..5)</span>
                    <input
                        type="number"
                        min={1}
                        max={5}
                        value={form.roundsTotal}
                        onChange={(event) =>
                            setForm({
                                ...form,
                                roundsTotal: Number(event.target.value),
                            })
                        }
                    />
                </label>
                <label className="field">
                    <span>Round duration (30..600 sec)</span>
                    <input
                        type="number"
                        min={30}
                        max={600}
                        value={form.roundDurationSeconds}
                        onChange={(event) =>
                            setForm({
                                ...form,
                                roundDurationSeconds: Number(
                                    event.target.value,
                                ),
                            })
                        }
                    />
                </label>
                <label className="field">
                    <span>Entry price amount</span>
                    <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={form.entryPriceAmount}
                        onChange={(event) =>
                            setForm({
                                ...form,
                                entryPriceAmount: event.target.value,
                            })
                        }
                    />
                </label>
                <div className="muted">
                    Total gifts must be divisible by number of rounds.
                </div>

                {validationError && (
                    <div className="error-text">{validationError}</div>
                )}

                <button
                    className="button"
                    onClick={() => onSubmit()}
                    disabled={!isValid || submitting}
                >
                    {submitting ? 'Creating...' : 'Create & Start'}
                </button>
            </div>
        </div>
    )
}
