import { useEffect } from 'react'

import { useError } from '../shared/context'

export const ErrorToast = () => {
    const { error, setError } = useError()

    useEffect(() => {
        if (!error) {
            return
        }
        const timer = setTimeout(() => setError(null), 5000)
        return () => clearTimeout(timer)
    }, [error, setError])

    if (!error) {
        return null
    }

    return (
        <div className="toast">
            <div className="toast-title">Что-то пошло не так</div>
            <div className="toast-message">
                {error.message}
                {error.correlationId
                    ? ` (ID: ${error.correlationId})`
                    : ''}
            </div>
            <button className="toast-close" onClick={() => setError(null)}>
                Закрыть
            </button>
        </div>
    )
}
