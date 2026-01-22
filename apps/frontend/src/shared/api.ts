import type { ApiError } from './types'

const baseUrl = '/api'

const isJsonResponse = (response: Response): boolean => {
    const contentType = response.headers.get('content-type')
    return contentType ? contentType.includes('application/json') : false
}

const parseJson = async <T>(response: Response): Promise<T | null> => {
    if (!isJsonResponse(response)) {
        return null
    }
    try {
        return (await response.json()) as T
    } catch {
        return null
    }
}

const buildError = async (response: Response): Promise<ApiError> => {
    const payload = await parseJson<{ message?: string; correlationId?: string }>(
        response,
    )
    return {
        message: payload?.message ?? `Ошибка запроса (${response.status})`,
        correlationId: payload?.correlationId,
    }
}

const request = async <T>(
    path: string,
    options?: RequestInit,
): Promise<T> => {
    const response = await fetch(`${baseUrl}${path}`, {
        headers: {
            'Content-Type': 'application/json',
            ...(options?.headers ?? {}),
        },
        ...options,
    })

    if (!response.ok) {
        throw await buildError(response)
    }

    const payload = await parseJson<T>(response)
    return (payload ?? undefined) as T
}

export const api = {
    get: async <T>(path: string): Promise<T> => await request<T>(path),
    post: async <T>(path: string, body?: unknown): Promise<T> =>
        await request<T>(path, {
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        }),
    patch: async <T>(path: string, body?: unknown): Promise<T> =>
        await request<T>(path, {
            method: 'PATCH',
            body: body ? JSON.stringify(body) : undefined,
        }),
}
