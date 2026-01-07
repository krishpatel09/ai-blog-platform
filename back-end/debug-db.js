require('dotenv').config();
const url = process.env.DATABASE_URL;
if (!url) {
  console.log('No DATABASE_URL found');
  process.exit(1);
}
console.log('DATABASE_URL found (length: ' + url.length + ')');

try {
    // postgres://user:pass@host.neondb.org/db
    const regex = /@([^:/]+)/;
    const match = url.match(regex);
    if (match) {
        const host = match[1];
        console.log('Host detected:', host);
        // Neon serverless driver connects to https://host/sql
        const endpoint = `https://${host}/sql`; 
        console.log(`Testing connection to ${endpoint}...`);
        
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        
        fetch(endpoint, {
            method: 'POST',
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: 'SELECT 1' }) // Invalid auth but should get 401/403 not timeout
        })
            .then(res => {
                console.log('Response status:', res.status);
                console.log('Connection SUCCESS (Reachability verified)');
            })
            .catch(err => {
                console.error('Connection FAILED:', err.name, err.message);
                if (err.cause) console.error('Cause:', err.cause);
            })
            .finally(() => clearTimeout(timeout));
            
    } else {
        console.log('Could not extract host from URL');
    }
} catch (e) {
    console.error('Error parsing URL', e);
}
