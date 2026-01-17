import { RequestContextService } from '@libs/application/context'

export const getLogContext = (service: string, method?: string): string => {
    const requestId = RequestContextService.getRequestId()
    return method
        ? `${service}::${method}-${requestId}`
        : `${service}-${requestId}`
}
