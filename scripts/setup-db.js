const { Client } = require('pg');

async function main() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL, // Ensure your DATABASE_URL is set in your environment variables
    });

    await client.connect();

    try {
        await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
        console.log('Extension uuid-ossp created successfully');
    } catch (error) {
        console.error('Error creating extension:', error);
    } finally {
        await client.end();
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
