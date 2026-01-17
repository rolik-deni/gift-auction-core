import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common'
import { Request } from 'express'
import { Observable, tap } from 'rxjs'

import { RequestContextService } from './app-request-context'

@Injectable()
export class ContextInterceptor implements NestInterceptor {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<unknown> {
        const request = context.switchToHttp().getRequest<Request>()

        /**
         * Setting an ID in the global context for each request.
         * This ID can be used as correlation id shown in logs
         */

        // 2. Теперь доступ к body безопасен (если используются типы Express)

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const bodyRequestId = request.body?.requestId

        const requestId =
            typeof bodyRequestId === 'string'
                ? bodyRequestId
                : crypto.randomUUID()

        RequestContextService.setRequestId(requestId)

        return next.handle().pipe(
            tap(() => {
                // Perform cleaning if needed
            }),
        )
    }
}
