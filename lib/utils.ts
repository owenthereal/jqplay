export const currentUnixTimestamp = () => Math.floor(new Date().getTime() / 1000);

export const generateErrorId = () => Math.random().toString(36).substring(2, 9);
