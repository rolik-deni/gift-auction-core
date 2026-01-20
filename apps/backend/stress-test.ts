import axios from 'axios'
import { BigNumber } from 'bignumber.js'

const API_URL = 'http://localhost:3000/api'
const AUCTION_ID = '32d6d181-3d71-46dc-920a-870eb275c916' // ЗАМЕНИ ПЕРЕД ЗАПУСКОМ
const NUM_USERS = 100 // Количество ботов
const BIDS_PER_USER = 10 // Сколько ставок сделает каждый бот
const DEPOSIT_AMOUNT = '1000000' // Даем ботам много денег

async function run() {
    console.log('🚀 Начинаем стресс-тест...')

    // 1. Создаем пользователей и делаем депозиты
    const users: string[] = []
    console.log(
        `👥 Регистрируем ${NUM_USERS} пользователей и пополняем баланс...`,
    )

    for (let i = 0; i < NUM_USERS; i++) {
        try {
            // Создаем юзера (пустой объект по твоему требованию)
            const userRes = await axios.post(`${API_URL}/users`, {})
            const userId = userRes.data.id
            users.push(userId)

            // Пополняем кошелек (walletId === userId)
            await axios.post(`${API_URL}/wallets/deposit`, {
                walletId: userId,
                amount: DEPOSIT_AMOUNT,
            })
        } catch (e) {
            console.error(`❌ Ошибка при подготовке юзера ${i}:`, e.message)
        }
    }

    console.log('✅ Подготовка завершена. Начинаем торги!')

    // 2. Имитируем "нахлынувшие" ставки
    // Используем Promise.all, чтобы запросы летели максимально параллельно
    const startBidding = async (userId: string) => {
        let currentBid = new BigNumber(100) // Стартовая ставка бота

        for (let j = 0; j < BIDS_PER_USER; j++) {
            // Увеличиваем ставку случайным образом
            currentBid = currentBid.plus(Math.floor(Math.random() * 100) + 10)

            try {
                await axios.post(`${API_URL}/auctions/${AUCTION_ID}/bid`, {
                    amount: currentBid.toFixed(),
                    userId,
                })
                console.log(
                    `[${userId}] 👍 Ставка принята: ${currentBid.toFixed()}`,
                )
            } catch (e) {
                // Ошибки здесь ожидаемы (например, кто-то другой уже перебил)
                console.log(
                    `[${userId}] 👎 Ставка ${currentBid.toFixed()} отклонена: ${e.response?.data?.message || e.message}`,
                )
            }

            // Небольшая задержка, чтобы имитировать "живое" поведение,
            // но можно убрать для максимального хайлоада
            await new Promise((resolve) => setTimeout(resolve, 50))
        }
    }

    // Запускаем всех ботов одновременно
    await Promise.all(users.map((id) => startBidding(id)))

    console.log('🏁 Стресс-тест окончен. Проверь лидерборд в Redis!')
}

run().catch(console.error)
