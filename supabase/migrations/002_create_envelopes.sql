create table public.envelopes (
  id uuid primary key default gen_random_uuid(),

  user_id uuid
    not null
    references auth.users(id)
    on delete cascade,

  name text not null,

  allocated numeric(12, 2)
    not null
    default 0
    check (allocated >= 0),

  created_at timestamptz
    not null
    default now(),

  unique (id, user_id)
);

create index envelopes_user_id_idx
on public.envelopes(user_id);

alter table public.envelopes
enable row level security;


create policy "Users can view their own envelopes"
on public.envelopes
for select
to authenticated
using (
  (select auth.uid()) = user_id
);


create policy "Users can create their own envelopes"
on public.envelopes
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
);


create policy "Users can update their own envelopes"
on public.envelopes
for update
to authenticated
using (
  (select auth.uid()) = user_id
)
with check (
  (select auth.uid()) = user_id
);


create policy "Users can delete their own envelopes"
on public.envelopes
for delete
to authenticated
using (
  (select auth.uid()) = user_id
);