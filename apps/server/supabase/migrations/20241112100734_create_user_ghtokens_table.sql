create table user_ghtokens (
  user_id uuid primary key references auth.users(id) on delete cascade,
  access_token text not null,
  expires_in integer not null,
  refresh_token text not null,
  refresh_token_expires_in integer not null,
  token_type text not null,
  scope text not null,
  expires_at timestamptz not null,
  refresh_token_expires_at timestamptz not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table user_ghtokens enable row level security;

-- Create updated_at trigger
create extension if not exists moddatetime schema extensions;
create trigger handle_updated_at before update on user_ghtokens
  for each row execute procedure moddatetime('updated_at');
