create table public.incomes (
  id uuid primary key default gen_random_uuid(),

  user_id uuid
    not null
    references auth.users(id)
    on delete cascade,

  account_id uuid
    not null,

  description text
    not null,

  amount numeric(12, 2)
    not null
    check (amount > 0),

  date date
    not null,

  created_at timestamptz
    not null
    default now(),

  constraint incomes_account_user_fk
    foreign key (account_id, user_id)
    references public.accounts(id, user_id)
    on delete no action
);


create index incomes_user_id_idx
on public.incomes(user_id);

create index incomes_account_id_idx
on public.incomes(account_id);


alter table public.incomes
enable row level security;


create policy "Users can view their own incomes"
on public.incomes
for select
to authenticated
using (
  (select auth.uid()) = user_id
);


create policy "Users can create their own incomes"
on public.incomes
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
);


create policy "Users can update their own incomes"
on public.incomes
for update
to authenticated
using (
  (select auth.uid()) = user_id
)
with check (
  (select auth.uid()) = user_id
);


create policy "Users can delete their own incomes"
on public.incomes
for delete
to authenticated
using (
  (select auth.uid()) = user_id
);