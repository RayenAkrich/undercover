-- Undercover / Hidden Failures Intelligence — canonical schema
-- Source: doc/02_SUPABASE_DATABASE.md (P0 demo mode: single workspace, FastAPI is trusted writer)
-- Conventions: UUID PKs, timestamptz, no browser service-role use (see doc/05_RLS_AND_PERMISSIONS.md)

-- datasets (§3)
create table if not exists datasets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  source_type text not null check (source_type in ('JSON','JSONL','SYNTHETIC')),
  session_count integer not null default 0,
  has_ground_truth boolean not null default false,
  storage_path text,
  created_at timestamptz not null default now()
);

-- sessions (§4)
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  dataset_id uuid not null references datasets(id) on delete cascade,
  external_session_id text not null,
  agent_version text,
  model_name text,
  started_at timestamptz,
  ended_at timestamptz,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  unique (dataset_id, external_session_id)
);

-- session_events (§5)
create table if not exists session_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  sequence_no integer not null,
  event_type text not null check (event_type in ('USER_MESSAGE','ASSISTANT_MESSAGE','TOOL_CALL','TOOL_RESULT','ASSISTANT_FINAL')),
  tool_name text,
  content text,
  payload jsonb not null default '{}',
  status text,
  occurred_at timestamptz,
  created_at timestamptz not null default now(),
  unique (session_id, sequence_no)
);
create index if not exists idx_session_events_session_seq on session_events(session_id, sequence_no);
create index if not exists idx_session_events_type on session_events(event_type);
create index if not exists idx_session_events_tool on session_events(tool_name);

-- analysis_runs (§6)
create table if not exists analysis_runs (
  id uuid primary key default gen_random_uuid(),
  dataset_id uuid not null references datasets(id) on delete cascade,
  status text not null check (status in ('QUEUED','RUNNING','COMPLETED','FAILED')),
  config jsonb not null default '{}',
  sessions_total integer not null default 0,
  sessions_processed integer not null default 0,
  failure_events_count integer not null default 0,
  clusters_count integer not null default 0,
  started_at timestamptz,
  completed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);

-- detection_signals (§7)
create table if not exists detection_signals (
  id uuid primary key default gen_random_uuid(),
  analysis_run_id uuid not null references analysis_runs(id) on delete cascade,
  session_id uuid not null references sessions(id) on delete cascade,
  signal_type text not null,
  source text not null check (source in ('RULE','STATISTICAL','JUDGE')),
  severity_hint integer,
  confidence numeric(5,4) not null default 0,
  details jsonb not null default '{}',
  evidence_event_ids uuid[],
  created_at timestamptz not null default now()
);
create index if not exists idx_signals_run on detection_signals(analysis_run_id);
create index if not exists idx_signals_session on detection_signals(session_id);

-- judge_outputs (§8)
create table if not exists judge_outputs (
  id uuid primary key default gen_random_uuid(),
  analysis_run_id uuid not null references analysis_runs(id) on delete cascade,
  session_id uuid not null references sessions(id) on delete cascade,
  prompt_version text not null,
  model_name text not null,
  input_hash text not null,
  intent jsonb not null default '{}',
  expected_action jsonb,
  observed_action jsonb,
  observed_outcome jsonb,
  is_failure boolean not null,
  deviation_type text,
  reason text,
  confidence numeric(5,4) not null default 0,
  raw_output jsonb,
  created_at timestamptz not null default now(),
  unique (input_hash, prompt_version, model_name)
);

-- failure_events (§9)
create table if not exists failure_events (
  id uuid primary key default gen_random_uuid(),
  analysis_run_id uuid not null references analysis_runs(id) on delete cascade,
  session_id uuid not null references sessions(id) on delete cascade,
  failure_type text not null,
  workflow text,
  tool_name text,
  parameter_name text,
  expected_value jsonb,
  observed_value jsonb,
  impact_category text,
  severity_score integer not null default 0 check (severity_score between 0 and 100),
  confidence numeric(5,4) not null default 0,
  semantic_summary text not null default '',
  evidence_tier integer not null default 4 check (evidence_tier between 1 and 4),
  created_at timestamptz not null default now()
);
create index if not exists idx_failures_run on failure_events(analysis_run_id);
create index if not exists idx_failures_session on failure_events(session_id);
create index if not exists idx_failures_type on failure_events(failure_type);

-- failure_evidence (§10)
create table if not exists failure_evidence (
  id uuid primary key default gen_random_uuid(),
  failure_event_id uuid not null references failure_events(id) on delete cascade,
  event_id uuid references session_events(id) on delete set null,
  evidence_type text not null,
  evidence_tier integer not null check (evidence_tier between 1 and 4),
  label text not null,
  excerpt text,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists idx_evidence_failure on failure_evidence(failure_event_id);

-- failure_fingerprints (§11, pgvector optional — embedding kept in Python if disabled)
create table if not exists failure_fingerprints (
  failure_event_id uuid primary key references failure_events(id) on delete cascade,
  workflow text,
  failure_type text not null,
  tool_name text,
  parameter_name text,
  outcome_category text,
  agent_version text,
  fingerprint_hash text not null,
  created_at timestamptz not null default now()
);
-- If pgvector enabled: alter table failure_fingerprints add column embedding vector(1536);

-- failure_clusters (§12)
create table if not exists failure_clusters (
  id uuid primary key default gen_random_uuid(),
  analysis_run_id uuid not null references analysis_runs(id) on delete cascade,
  cluster_key text not null,
  generated_title text not null default '',
  generated_summary text not null default '',
  likely_contributing_factor text,
  occurrence_count integer not null default 0,
  affected_sessions integer not null default 0,
  first_seen timestamptz,
  last_seen timestamptz,
  impact_score integer not null default 0,
  frequency_score integer not null default 0,
  severity_score integer not null default 0,
  reach_score integer not null default 0,
  confidence_score integer not null default 0,
  priority_score integer not null default 0,
  priority_label text not null default 'P3' check (priority_label in ('P0','P1','P2','P3')),
  created_at timestamptz not null default now()
);
create index if not exists idx_clusters_run on failure_clusters(analysis_run_id);

-- cluster_members (§13)
create table if not exists cluster_members (
  cluster_id uuid not null references failure_clusters(id) on delete cascade,
  failure_event_id uuid not null references failure_events(id) on delete cascade,
  distance numeric,
  is_representative boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (cluster_id, failure_event_id)
);

-- ground_truth_labels (§14, benchmark only — never read by discovery pipeline)
create table if not exists ground_truth_labels (
  id uuid primary key default gen_random_uuid(),
  dataset_id uuid not null references datasets(id) on delete cascade,
  session_id uuid not null references sessions(id) on delete cascade,
  is_failure boolean not null,
  failure_type text,
  cluster_label text,
  notes text
);

-- evaluation_results (§15)
create table if not exists evaluation_results (
  id uuid primary key default gen_random_uuid(),
  analysis_run_id uuid not null references analysis_runs(id) on delete cascade,
  precision numeric,
  recall numeric,
  f1 numeric,
  ari numeric,
  nmi numeric,
  false_positives integer not null default 0,
  false_negatives integer not null default 0,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);
