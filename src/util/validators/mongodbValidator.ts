const MONGODB_ID_REGEXP = /^[a-f\d]{24}$/i;

export function IdIsValid(id: string): boolean {
    return MONGODB_ID_REGEXP.test(id);
}
