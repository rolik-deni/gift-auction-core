import { inspect as utilInspect, InspectOptions } from 'util'

/**
 * Получить строковое представление объекта в виде строки.
 */
export const inspectInline = (
    object: unknown,
    options: InspectOptions = {},
): string =>
    utilInspect(object, {
        ...{ colors: false, compact: true, depth: null },
        ...options,
    }).replace(/\s*\n\s*/g, ' ')
