create table public.expenses (
  id uuid primary key default gen_random_uuid(),

  user_id uuid
    not null
    references auth.users(id)
    on delete cascade,

  account_id uuid
    not null,

  envelope_id uuid,

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

  constraint expenses_account_user_fk
    foreign key (account_id, user_id)
    references public.accounts(id, user_id)
    on delete no action,

  constraint expenses_envelope_user_fk
    foreign key (envelope_id, user_id)
    references public.envelopes(id, user_id)
    on delete set null (envelope_id)
);


create index expenses_user_id_idx
on public.expenses(user_id);

create index expenses_account_id_idx
on public.expenses(account_id);

create index expenses_envelope_id_idx
on public.expenses(envelope_id);


alter table public.expenses
enable row level security;


create policy "Users can view their own expenses"
on public.expenses
for select
to authenticated
using (
  (select auth.uid()) = user_id
);


create policy "Users can create their own expenses"
on public.expenses
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
);


create policy "Users can update their own expenses"
on public.expenses
for update
to authenticated
using (
  (select auth.uid()) = user_id
)
with check (
  (select auth.uid()) = user_id
);


create policy "Users can delete their own expenses"
on public.expenses
for delete
to authenticated
using (
  (select auth.uid()) = user_id
);