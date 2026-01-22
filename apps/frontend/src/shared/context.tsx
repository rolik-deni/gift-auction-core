import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react'
import type { ReactNode } from 'react'

import { api } from './api'
import type { ApiError, IdResponse, User, Wallet } from './types'

const buildUserName = (id: string): string => `User-${id.slice(0, 6)}`

type ErrorContextValue = {
    error: ApiError | null
    setError: (error: ApiError | null) => void
}

const ErrorContext = createContext<ErrorContextValue | null>(null)

export const ErrorProvider = ({ children }: { children: ReactNode }) => {
    const [error, setError] = useState<ApiError | null>(null)
    const value = useMemo(() => ({ error, setError }), [error])
    return <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>
}

export const useError = (): ErrorContextValue => {
    const context = useContext(ErrorContext)
    if (!context) {
        throw new Error('ErrorContext is not available')
    }
    return context
}

type SessionContextValue = {
    user: User | null
    wallet: Wallet | null
    loading: boolean
    refreshWallet: () => Promise<void>
}

const SessionContext = createContext<SessionContextValue | null>(null)

export const SessionProvider = ({ children }: { children: ReactNode }) => {
    const { setError } = useError()
    const [user, setUser] = useState<User | null>(null)
    const [wallet, setWallet] = useState<Wallet | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchWallet = useCallback(async (userId: string) => {
        const response = await api.get<Wallet>(`/wallets/${userId}`)
        setWallet(response)
    }, [])

    const refreshWallet = useCallback(async () => {
        if (!user) {
            return
        }
        try {
            await fetchWallet(user.id)
        } catch (error) {
            setError(error as ApiError)
        }
    }, [fetchWallet, setError, user])

    useEffect(() => {
        const bootstrap = async () => {
            setLoading(true)
            try {
                const created = await api.post<IdResponse>('/users', {})
                const userId = created.id
                const nextUser: User = {
                    id: userId,
                    name: buildUserName(userId),
                }
                setUser(nextUser)

                await api.post('/wallets/deposit', {
                    walletId: userId,
                    amount: '10000',
                })

                await fetchWallet(userId)
            } catch (error) {
                setError(error as ApiError)
            } finally {
                setLoading(false)
            }
        }

        bootstrap()
    }, [fetchWallet, setError])

    const value = useMemo(
        () => ({
            user,
            wallet,
            loading,
            refreshWallet,
        }),
        [user, wallet, loading, refreshWallet],
    )

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    )
}

export const useSession = (): SessionContextValue => {
    const context = useContext(SessionContext)
    if (!context) {
        throw new Error('SessionContext is not available')
    }
    return context
}
