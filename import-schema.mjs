import pg from './src/node_modules/pg/lib/index.js';
import fs from 'fs';

const { Client } = pg;

const DB_URL = 'postgresql://neondb_owner:npg_ypCB9UfVdRr8@ep-orange-term-am31vswj.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require';

const client = new Client({ connectionString: DB_URL });

async function run() {
  await client.connect();
  console.log('Connected to Neon successfully');

  const sql = fs.readFileSync('database-schema-only.sql', 'utf8');

  // Remove psql meta-commands (lines starting with backslash)
  const backslash = String.fromCharCode(92);
  const cleaned = sql
    .split('\n')
    .filter(line => {
      const t = line.trim();
      return t.length === 0 || t[0] !== backslash;
    })
    .join('\n');

  const statements = cleaned
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 10);

  let ok = 0, skipped = 0;
  for (const stmt of statements) {
    try {
      await client.query(stmt);
      ok++;
    } catch (e) {
      if (e.message.includes('already exists')) {
        skipped++;
      } else {
        console.log('WARN:', e.message.slice(0, 100));
      }
    }
  }

  console.log('Schema import done:', ok, 'executed,', skipped, 'already existed');
  await client.end();
}

run().catch(e => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
