export function neverThrow(never : never, error : Error) : never {
    throw error
}
