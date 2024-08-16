export const currentUnixTimestamp = () => Math.floor(new Date().getTime() / 1000);

export const generateMessageId = () => Math.random().toString(36).substring(2, 9);

export function normalizeLineBreaks(text: string | undefined | null) {
    if (!text) {
        return '';
    }

    return text.replace(/\r\n|\r/g, '\n');
}
