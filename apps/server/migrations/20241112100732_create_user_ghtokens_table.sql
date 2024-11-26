create table user_ghtokens (
  user_id uuid primary key references auth.users(id) on delete cascade,
  access_token text not null,
  expires_in integer not null,
  refresh_token text not null,
  refresh_token_expires_in integer not null,
  token_type text not null,
  scope text not null,
  expires_at timestamptz not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Add RLS policies
alter table user_ghtokens enable row level security;

-- Allow users to read only their own tokens
create policy "Users can read their own tokens"
  on user_ghtokens for select
  using (auth.uid() = user_id);

-- Allow users to insert their own tokens
create policy "Users can insert their own tokens"
  on user_ghtokens for insert
  with check (auth.uid() = user_id);

-- Allow users to update their own tokens
create policy "Users can update their own tokens"
  on user_ghtokens for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Allow users to delete their own tokens
create policy "Users can delete their own tokens"
  on user_ghtokens for delete
  using (auth.uid() = user_id);

-- Create updated_at trigger
create extension if not exists moddatetime schema extensions;
create trigger handle_updated_at before update on user_ghtokens
  for each row execute procedure moddatetime('updated_at');
