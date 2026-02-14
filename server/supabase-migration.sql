-- ================================================================
--  Supabase Migration: Call Sessions Table
--  Run this in Supabase SQL Editor → New Query
-- ================================================================

CREATE TABLE IF NOT EXISTS call_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_id       TEXT NOT NULL,
  callee_id       TEXT NOT NULL,
  channel_name    TEXT NOT NULL UNIQUE,
  caller_uid      INTEGER NOT NULL,
  callee_uid      INTEGER NOT NULL,
  duration_limit  INTEGER NOT NULL DEFAULT 30,         -- in minutes
  start_time      TIMESTAMPTZ,                          -- set when both users join
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','active','warning','ended','expired')),
  warning_sent    BOOLEAN DEFAULT FALSE,
  ended_at        TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_call_sessions_status ON call_sessions(status);
CREATE INDEX IF NOT EXISTS idx_call_sessions_caller ON call_sessions(caller_id);
CREATE INDEX IF NOT EXISTS idx_call_sessions_callee ON call_sessions(callee_id);
CREATE INDEX IF NOT EXISTS idx_call_sessions_channel ON call_sessions(channel_name);

-- Enable RLS (optional – use service key from backend)
ALTER TABLE call_sessions ENABLE ROW LEVEL SECURITY;

-- Allow backend service role full access
CREATE POLICY "Service role full access" ON call_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);
