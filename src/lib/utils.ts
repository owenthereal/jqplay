import { ZodError } from "zod";

export const currentUnixTimestamp = (): number => Math.floor(new Date().getTime() / 1000);

export const generateMessageId = (): string => Math.random().toString(36).substring(2, 9);

export function normalizeLineBreaks(text: string | undefined | null): string {
    if (!text) {
        return '';
    }

    return text.replace(/\r\n|\r/g, '\n');
}

export function prettifyZodError(error: ZodError): string {
    return error.errors.map(e => `${e.path.join(', ')} ${e.message}`.toLowerCase()).join(', ');
}
