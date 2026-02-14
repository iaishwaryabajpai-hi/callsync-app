/**
 * Migration script – creates the call_sessions table in Supabase PostgreSQL.
 * 
 * Usage:  node run-migration.js <database-password>
 * Example: node run-migration.js mySecretPass123
 */
const { Client } = require('pg');

const DB_PASSWORD = process.argv[2];

if (!DB_PASSWORD) {
    console.error('\n❌ Please provide your Supabase database password:');
    console.error('   node run-migration.js <your-database-password>\n');
    console.error('   Find it in: Supabase Dashboard → Settings → Database → Database password');
    console.error('   If you forgot it, click "Reset database password" to set a new one.\n');
    process.exit(1);
}

const connectionString = `postgresql://postgres:${DB_PASSWORD}@db.fezgpfhchxaphufziyhd.supabase.co:5432/postgres`;

const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS call_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_id       TEXT NOT NULL,
  callee_id       TEXT NOT NULL,
  channel_name    TEXT NOT NULL UNIQUE,
  caller_uid      INTEGER NOT NULL,
  callee_uid      INTEGER NOT NULL,
  duration_limit  INTEGER NOT NULL DEFAULT 30,
  start_time      TIMESTAMPTZ,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','active','warning','ended','expired')),
  warning_sent    BOOLEAN DEFAULT FALSE,
  ended_at        TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_call_sessions_status ON call_sessions(status);
CREATE INDEX IF NOT EXISTS idx_call_sessions_caller ON call_sessions(caller_id);
CREATE INDEX IF NOT EXISTS idx_call_sessions_callee ON call_sessions(callee_id);
CREATE INDEX IF NOT EXISTS idx_call_sessions_channel ON call_sessions(channel_name);

ALTER TABLE call_sessions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access' AND tablename = 'call_sessions'
  ) THEN
    CREATE POLICY "Service role full access" ON call_sessions
      FOR ALL USING (true) WITH CHECK (true);
  END IF;
END
$$;
`;

async function runMigration() {
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

    try {
        console.log('🔌 Connecting to Supabase PostgreSQL...');
        await client.connect();
        console.log('✅ Connected!\n');

        console.log('🚀 Running migration...');
        await client.query(MIGRATION_SQL);
        console.log('✅ Migration complete! Table "call_sessions" created successfully.\n');

        // Verify
        const res = await client.query(
            `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'call_sessions' ORDER BY ordinal_position`
        );
        console.log('📋 Table columns:');
        res.rows.forEach(r => console.log(`   • ${r.column_name} (${r.data_type})`));
        console.log('');

    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    } finally {
        await client.end();
        console.log('🔴 Connection closed.');
    }
}

runMigration();
