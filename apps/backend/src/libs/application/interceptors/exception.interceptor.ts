/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { ExceptionBase } from '@libs/exceptions'
import {
    BadRequestException,
    CallHandler,
    ExecutionContext,
    Logger,
    NestInterceptor,
} from '@nestjs/common'
import { ApiErrorResponse } from '@src/libs/api/api-error.response'
import { Observable, throwError } from 'rxjs'
import { catchError } from 'rxjs/operators'

import { RequestContextService } from '../context/app-request-context'

export class ExceptionInterceptor implements NestInterceptor {
    private readonly _logger: Logger = new Logger(ExceptionInterceptor.name)

    intercept(
        _context: ExecutionContext,
        next: CallHandler,
    ): Observable<ExceptionBase> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return next.handle().pipe(
            catchError((err: any) => {
                // Logging for debugging purposes
                if (err.status >= 400 && err.status < 500) {
                    this._logger.debug(
                        `[${RequestContextService.getRequestId()}] ${err.message}`,
                    )

                    const isClassValidatorError =
                        Array.isArray(err?.response?.message) &&
                        typeof err?.response?.error === 'string' &&
                        err.status === 400
                    // Transforming class-validator errors to a different format
                    if (isClassValidatorError) {
                        err = new BadRequestException(
                            new ApiErrorResponse({
                                statusCode: err.status,
                                message: 'Validation error',
                                error: err?.response?.error,
                                subErrors: err?.response?.message,
                                correlationId:
                                    RequestContextService.getRequestId(),
                            }),
                        )
                    }
                }

                // Adding request ID to error message
                if (!err.correlationId) {
                    err.correlationId = RequestContextService.getRequestId()
                }

                if (err.response) {
                    err.response.correlationId = err.correlationId
                }

                return throwError(err)
            }),
        )
    }
}
