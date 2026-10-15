create table public.accounts (
  id uuid primary key default gen_random_uuid(),

  user_id uuid
    not null
    references auth.users(id)
    on delete cascade,

  name text not null,

  type text
    not null
    constraint accounts_type_check
    check (
      type in (
        'Chequing',
        'Savings',
        'Credit Card',
        'Cash',
        'Other'
      )
    ),

  archived boolean
    not null
    default false,

  created_at timestamptz
    not null
    default now(),

  unique (id, user_id)
);

create index accounts_user_id_idx
on public.accounts(user_id);

alter table public.accounts
enable row level security;


create policy "Users can view their own accounts"
on public.accounts
for select
to authenticated
using (
  (select auth.uid()) = user_id
);


create policy "Users can create their own accounts"
on public.accounts
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
);


create policy "Users can update their own accounts"
on public.accounts
for update
to authenticated
using (
  (select auth.uid()) = user_id
)
with check (
  (select auth.uid()) = user_id
);


create policy "Users can delete their own accounts"
on public.accounts
for delete
to authenticated
using (
  (select auth.uid()) = user_id
);