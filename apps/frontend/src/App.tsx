import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { ErrorToast } from './components/ErrorToast'
import { AuctionRoomPage } from './routes/AuctionRoomPage'
import { CreateAuctionPage } from './routes/CreateAuctionPage'
import { LobbyPage } from './routes/LobbyPage'
import { ErrorProvider, SessionProvider } from './shared/context'

export const App = () => {
    return (
        <ErrorProvider>
            <SessionProvider>
                <BrowserRouter>
                    <Routes>
                        <Route
                            path="/"
                            element={<Navigate to="/gift-auction/" replace />}
                        />
                        <Route path="/gift-auction/" element={<LobbyPage />} />
                        <Route
                            path="/gift-auction/auctions/new"
                            element={<CreateAuctionPage />}
                        />
                        <Route
                            path="/gift-auction/auctions/:auctionId"
                            element={<AuctionRoomPage />}
                        />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
                <ErrorToast />
            </SessionProvider>
        </ErrorProvider>
    )
}
