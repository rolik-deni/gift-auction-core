type Task<T> = () => Promise<T>

export class SimpleRateLimiter {
    private _tokens: number
    private readonly _queue: (() => void)[] = []
    private readonly _refillTimer: NodeJS.Timeout

    constructor(private readonly _maxRps: number) {
        const normalized = Math.max(1, Math.floor(_maxRps))
        this._tokens = normalized
        this._refillTimer = setInterval(() => {
            this._tokens = normalized
            this._drain()
        }, 1000)
        this._refillTimer.unref?.()
    }

    schedule<T>(task: Task<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const run = () => {
                this._tokens -= 1
                task().then(resolve).catch(reject)
            }
            if (this._tokens > 0) {
                run()
                return
            }
            this._queue.push(run)
        })
    }

    shutdown(): void {
        clearInterval(this._refillTimer)
        this._queue.splice(0, this._queue.length)
    }

    private _drain(): void {
        while (this._tokens > 0 && this._queue.length > 0) {
            const run = this._queue.shift()
            if (!run) {
                break
            }
            run()
        }
    }
}
