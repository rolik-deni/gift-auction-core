import {
    ARGUMENT_INVALID,
    ARGUMENT_NOT_PROVIDED,
    ARGUMENT_OUT_OF_RANGE,
    CONFLICT,
    ExceptionBase,
    INTERNAL_SERVER_ERROR,
    NOT_FOUND,
} from '@libs/exceptions'
import {
    CallHandler,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Logger,
    NestInterceptor,
} from '@nestjs/common'
import { ApiErrorResponse } from '@src/libs/api/api-error.response'
import { STATUS_CODES } from 'http'
import { Observable, throwError } from 'rxjs'
import { catchError } from 'rxjs/operators'

import { getLogContext } from '../../utils'
import { RequestContextService } from '../context/app-request-context'

export class ExceptionInterceptor implements NestInterceptor {
    private readonly _logger: Logger = new Logger()

    intercept(
        _context: ExecutionContext,
        next: CallHandler,
    ): Observable<unknown> {
        return next.handle().pipe(
            catchError((err: Error) => {
                const correlationId = getCorrelationId(err)
                const httpError = normalizeError(err, correlationId)

                this._logger.error(
                    err.message,
                    err.stack,
                    getLogContext(ExceptionInterceptor.name),
                )

                return throwError(httpError)
            }),
        )
    }
}

const normalizeError = (err: unknown, correlationId: string): HttpException => {
    if (err instanceof ExceptionBase) {
        const statusCode = mapExceptionToStatus(err)
        return new HttpException(
            new ApiErrorResponse({
                statusCode,
                message: err.message,
                error: STATUS_CODES[statusCode] ?? 'Error',
                correlationId,
            }),
            statusCode,
        )
    }

    if (err instanceof HttpException) {
        const statusCode = err.getStatus()
        const response = err.getResponse()
        const responseObj =
            typeof response === 'object' && response !== null
                ? (response as {
                      message?: string | string[]
                      error?: string
                      statusCode?: number
                      subErrors?: string[]
                  })
                : undefined

        if (isValidationError(responseObj, statusCode)) {
            return new HttpException(
                new ApiErrorResponse({
                    statusCode,
                    message: 'Validation error',
                    error: responseObj.error,
                    subErrors: responseObj.message,
                    correlationId,
                }),
                statusCode,
            )
        }

        if (isApiErrorResponse(responseObj)) {
            return new HttpException(
                new ApiErrorResponse({
                    statusCode: responseObj.statusCode,
                    message: responseObj.message,
                    error: responseObj.error,
                    subErrors: responseObj.subErrors,
                    correlationId,
                }),
                statusCode,
            )
        }

        const message =
            typeof response === 'string'
                ? response
                : typeof responseObj?.message === 'string'
                  ? responseObj.message
                  : err.message
        const error =
            typeof responseObj?.error === 'string'
                ? responseObj.error
                : (STATUS_CODES[statusCode] ?? 'Error')

        return new HttpException(
            new ApiErrorResponse({
                statusCode,
                message,
                error,
                correlationId,
            }),
            statusCode,
        )
    }

    const statusCode = HttpStatus.INTERNAL_SERVER_ERROR
    return new HttpException(
        new ApiErrorResponse({
            statusCode,
            message: 'Internal server error',
            error: STATUS_CODES[statusCode] ?? 'Error',
            correlationId,
        }),
        statusCode,
    )
}

const mapExceptionToStatus = (error: ExceptionBase): number => {
    switch (error.code) {
        case ARGUMENT_INVALID:
        case ARGUMENT_NOT_PROVIDED:
        case ARGUMENT_OUT_OF_RANGE:
            return HttpStatus.BAD_REQUEST
        case NOT_FOUND:
            return HttpStatus.NOT_FOUND
        case CONFLICT:
            return HttpStatus.CONFLICT
        case INTERNAL_SERVER_ERROR:
        default:
            return HttpStatus.INTERNAL_SERVER_ERROR
    }
}

const isApiErrorResponse = (
    response: unknown,
): response is ApiErrorResponse => {
    return (
        typeof response === 'object' &&
        response !== null &&
        typeof (response as ApiErrorResponse).statusCode === 'number' &&
        typeof (response as ApiErrorResponse).message === 'string' &&
        typeof (response as ApiErrorResponse).error === 'string'
    )
}

const isValidationError = (
    response: unknown,
    statusCode: number,
): response is { message: string[]; error: string } => {
    const badRequestStatus = HttpStatus.BAD_REQUEST as number
    if (
        statusCode !== badRequestStatus ||
        typeof response !== 'object' ||
        response === null
    ) {
        return false
    }
    return (
        Array.isArray((response as { message?: unknown }).message) &&
        typeof (response as { error?: unknown }).error === 'string'
    )
}

const getCorrelationId = (err: unknown): string => {
    if (
        err &&
        typeof err === 'object' &&
        typeof (err as { correlationId?: string }).correlationId === 'string'
    ) {
        return (err as { correlationId: string }).correlationId
    }
    return RequestContextService.getRequestId()
}
