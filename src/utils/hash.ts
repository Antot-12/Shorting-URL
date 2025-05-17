export function generateHash(text: string): string {
    return btoa(unescape(encodeURIComponent(text))).slice(0, 8);
}
