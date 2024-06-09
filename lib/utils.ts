import crypto from 'crypto';

export const currentUnixTimestamp = () => Math.floor(new Date().getTime() / 1000);

export const generateErrorId = () => Math.random().toString(36).substring(2, 9);

interface Snippet {
    json: string;
    query: string;
    options: string[];
}

export function generateSlug(s: Snippet, hashLen: number = 15): string {
    // Create a SHA-1 hash instance
    const hash = crypto.createHash('sha1');

    // Update the hash with the JSON, query, and options strings
    hash.update(s.json);
    hash.update(s.query);
    // Join options array into a single string before hashing
    hash.update(s.options.sort().join(''));

    // Generate the hash digest and encode it to a URL-safe base64 string
    const sum = hash.digest();
    const base64Encoded = sum.toString('base64url'); // base64url is URL-safe by default

    // Ensure the substring does not end with an underscore
    while (hashLen <= base64Encoded.length && base64Encoded[hashLen - 1] === '_') {
        hashLen++;
    }

    return base64Encoded.substring(0, hashLen);
}
