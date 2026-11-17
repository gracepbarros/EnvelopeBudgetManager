-- =========================================================
-- BUDGET CYCLES
-- =========================================================

create table public.budget_cycles (
  id uuid primary key default gen_random_uuid(),

  user_id uuid
    not null
    references auth.users(id)
    on delete cascade,

  start_date date
    not null
    default current_date,

  end_date date,

  carryover_amount numeric(12, 2)
    not null
    default 0
    check (carryover_amount >= 0),

  status text
    not null
    default 'active'
    constraint budget_cycles_status_check
    check (
      status in ('active', 'closed', 'paused')
    ),

  created_at timestamptz
    not null
    default now(),

  unique (id, user_id),

  constraint budget_cycles_dates_check
    check (
      end_date is null
      or end_date >= start_date
    ),

  constraint budget_cycles_status_dates_check
    check (
      (
        status = 'closed'
        and end_date is not null
      )
      or
      (
        status = 'paused'
        and end_date is null
      )
      or
      (
        status = 'active'
      )
    )
);


-- A user can only have one active cycle.
create unique index budget_cycles_one_active_per_user_idx
on public.budget_cycles(user_id)
where status = 'active';


-- A user can only have one temporarily paused cycle.
create unique index budget_cycles_one_paused_per_user_idx
on public.budget_cycles(user_id)
where status = 'paused';


create index budget_cycles_user_id_idx
on public.budget_cycles(user_id);


-- =========================================================
-- ENVELOPE ALLOCATIONS
-- =========================================================

create table public.envelope_allocations (
  id uuid primary key default gen_random_uuid(),

  user_id uuid
    not null
    references auth.users(id)
    on delete cascade,

  cycle_id uuid
    not null,

  envelope_id uuid
    not null,

  allocated numeric(12, 2)
    not null
    default 0
    check (allocated >= 0),

  created_at timestamptz
    not null
    default now(),

  constraint envelope_allocations_cycle_user_fk
    foreign key (cycle_id, user_id)
    references public.budget_cycles(id, user_id)
    on delete cascade,

  constraint envelope_allocations_envelope_user_fk
    foreign key (envelope_id, user_id)
    references public.envelopes(id, user_id)
    on delete cascade,

  unique (cycle_id, envelope_id)
);


create index envelope_allocations_user_id_idx
on public.envelope_allocations(user_id);

create index envelope_allocations_cycle_id_idx
on public.envelope_allocations(cycle_id);

create index envelope_allocations_envelope_id_idx
on public.envelope_allocations(envelope_id);


-- =========================================================
-- CREATE INITIAL ACTIVE CYCLE FOR EXISTING USERS
-- =========================================================

insert into public.budget_cycles (
  user_id,
  start_date,
  status
)
select
  users.id,

  coalesce(
    least(
      (
        select min(expenses.date)
        from public.expenses
        where expenses.user_id = users.id
      ),
      (
        select min(incomes.date)
        from public.incomes
        where incomes.user_id = users.id
      )
    ),
    current_date
  ),

  'active'
from auth.users as users;


-- =========================================================
-- MIGRATE EXISTING ENVELOPE ALLOCATIONS
-- =========================================================

insert into public.envelope_allocations (
  user_id,
  cycle_id,
  envelope_id,
  allocated
)
select
  envelopes.user_id,
  budget_cycles.id,
  envelopes.id,
  envelopes.allocated
from public.envelopes
join public.budget_cycles
  on budget_cycles.user_id = envelopes.user_id
  and budget_cycles.status = 'active';


-- =========================================================
-- ADD CYCLE TO EXPENSES
-- =========================================================

alter table public.expenses
add column cycle_id uuid;


update public.expenses
set cycle_id = budget_cycles.id
from public.budget_cycles
where budget_cycles.user_id = expenses.user_id
  and budget_cycles.status = 'active';


alter table public.expenses
alter column cycle_id
set not null;


alter table public.expenses
add constraint expenses_cycle_user_fk
foreign key (cycle_id, user_id)
references public.budget_cycles(id, user_id)
on delete no action;


create index expenses_cycle_id_idx
on public.expenses(cycle_id);


-- =========================================================
-- ADD CYCLE TO INCOMES
-- =========================================================

alter table public.incomes
add column cycle_id uuid;


update public.incomes
set cycle_id = budget_cycles.id
from public.budget_cycles
where budget_cycles.user_id = incomes.user_id
  and budget_cycles.status = 'active';


alter table public.incomes
alter column cycle_id
set not null;


alter table public.incomes
add constraint incomes_cycle_user_fk
foreign key (cycle_id, user_id)
references public.budget_cycles(id, user_id)
on delete no action;


create index incomes_cycle_id_idx
on public.incomes(cycle_id);


-- =========================================================
-- VALIDATE FINANCIAL ENTRY DATES
-- =========================================================

create or replace function public.validate_cycle_entry_date()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  cycle_start_date date;
  cycle_end_date date;
begin
  select
    start_date,
    end_date
  into
    cycle_start_date,
    cycle_end_date
  from public.budget_cycles
  where id = new.cycle_id
    and user_id = new.user_id;


  if cycle_start_date is null then
    raise exception
      'Budget cycle not found';
  end if;


  if new.date < cycle_start_date then
    raise exception
      'Entry date cannot be before the budget cycle start date';
  end if;


  if cycle_end_date is not null
    and new.date > cycle_end_date then
    raise exception
      'Entry date cannot be after the budget cycle end date';
  end if;


  if cycle_end_date is null
    and new.date > current_date then
    raise exception
      'Entry date cannot be in the future';
  end if;


  return new;
end;
$$;


create trigger validate_expense_cycle_date
before insert or update of date, cycle_id, user_id
on public.expenses
for each row
execute function public.validate_cycle_entry_date();


create trigger validate_income_cycle_date
before insert or update of date, cycle_id, user_id
on public.incomes
for each row
execute function public.validate_cycle_entry_date();


-- =========================================================
-- ALLOCATION NOW BELONGS TO A CYCLE
-- =========================================================

alter table public.envelopes
drop column allocated;


-- =========================================================
-- ROW LEVEL SECURITY: BUDGET CYCLES
-- =========================================================

alter table public.budget_cycles
enable row level security;


create policy "Users can view their own budget cycles"
on public.budget_cycles
for select
to authenticated
using (
  (select auth.uid()) = user_id
);


create policy "Users can create their own budget cycles"
on public.budget_cycles
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
);


create policy "Users can update their own budget cycles"
on public.budget_cycles
for update
to authenticated
using (
  (select auth.uid()) = user_id
)
with check (
  (select auth.uid()) = user_id
);


create policy "Users can delete their own budget cycles"
on public.budget_cycles
for delete
to authenticated
using (
  (select auth.uid()) = user_id
);


-- =========================================================
-- ROW LEVEL SECURITY: ENVELOPE ALLOCATIONS
-- =========================================================

alter table public.envelope_allocations
enable row level security;


create policy "Users can view their own envelope allocations"
on public.envelope_allocations
for select
to authenticated
using (
  (select auth.uid()) = user_id
);


create policy "Users can create their own envelope allocations"
on public.envelope_allocations
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
);


create policy "Users can update their own envelope allocations"
on public.envelope_allocations
for update
to authenticated
using (
  (select auth.uid()) = user_id
)
with check (
  (select auth.uid()) = user_id
);


create policy "Users can delete their own envelope allocations"
on public.envelope_allocations
for delete
to authenticated
using (
  (select auth.uid()) = user_id
);


-- =========================================================
-- CLOSE CURRENT CYCLE
-- =========================================================

create or replace function public.close_current_budget_cycle()
returns public.budget_cycles
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();

  current_cycle public.budget_cycles;
  paused_cycle public.budget_cycles;
  next_cycle public.budget_cycles;

  total_income numeric := 0;
  total_allocated numeric := 0;
  amount_to_carry numeric := 0;
begin
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;


  select *
  into current_cycle
  from public.budget_cycles
  where user_id = current_user_id
    and status = 'active'
  for update;


  if current_cycle.id is null then
    raise exception
      'No active budget cycle found';
  end if;


  select coalesce(sum(amount), 0)
  into total_income
  from public.incomes
  where user_id = current_user_id
    and cycle_id = current_cycle.id;


  select coalesce(sum(allocated), 0)
  into total_allocated
  from public.envelope_allocations
  where user_id = current_user_id
    and cycle_id = current_cycle.id;


  amount_to_carry := greatest(
    current_cycle.carryover_amount
      + total_income
      - total_allocated,
    0
  );


  select *
  into paused_cycle
  from public.budget_cycles
  where user_id = current_user_id
    and status = 'paused'
  limit 1
  for update;


  update public.budget_cycles
  set
    status = 'closed',
    end_date = coalesce(
      current_cycle.end_date,
      current_date
    )
  where id = current_cycle.id
    and user_id = current_user_id;


  -- If a previous cycle was reopened,
  -- resume the paused current cycle.
  if paused_cycle.id is not null then

    update public.budget_cycles
    set
      status = 'active',
      carryover_amount = amount_to_carry
    where id = paused_cycle.id
      and user_id = current_user_id
    returning *
    into next_cycle;


    return next_cycle;
  end if;


  -- Normal close:
  -- create a new active cycle.
  insert into public.budget_cycles (
    user_id,
    start_date,
    status,
    carryover_amount
  )
  values (
    current_user_id,
    current_date,
    'active',
    amount_to_carry
  )
  returning *
  into next_cycle;


  -- Envelopes remain,
  -- but allocations start at zero.
  insert into public.envelope_allocations (
    user_id,
    cycle_id,
    envelope_id,
    allocated
  )
  select
    current_user_id,
    next_cycle.id,
    envelopes.id,
    0
  from public.envelopes
  where envelopes.user_id =
        current_user_id;


  return next_cycle;
end;
$$;


revoke execute
on function public.close_current_budget_cycle()
from public;

grant execute
on function public.close_current_budget_cycle()
to authenticated;


-- =========================================================
-- REOPEN PREVIOUS CYCLE
-- =========================================================

create or replace function public.reopen_previous_budget_cycle()
returns public.budget_cycles
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();

  current_cycle public.budget_cycles;
  previous_cycle public.budget_cycles;
  reopened_cycle public.budget_cycles;
begin
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;


  if exists (
    select 1
    from public.budget_cycles
    where user_id = current_user_id
      and status = 'paused'
  ) then
    raise exception
      'A previous cycle is already reopened';
  end if;


  select *
  into current_cycle
  from public.budget_cycles
  where user_id = current_user_id
    and status = 'active'
  for update;


  if current_cycle.id is null then
    raise exception
      'No active budget cycle found';
  end if;


  if current_cycle.end_date is not null then
    raise exception
      'The active cycle is already a reopened historical cycle';
  end if;


  select *
  into previous_cycle
  from public.budget_cycles
  where user_id = current_user_id
    and status = 'closed'
  order by
    end_date desc,
    created_at desc
  limit 1
  for update;


  if previous_cycle.id is null then
    raise exception
      'No previous cycle found';
  end if;


  -- Preserve the current cycle and its data.
  update public.budget_cycles
  set status = 'paused'
  where id = current_cycle.id
    and user_id = current_user_id;


  -- Reopen the immediately previous cycle.
  update public.budget_cycles
  set status = 'active'
  where id = previous_cycle.id
    and user_id = current_user_id
  returning *
  into reopened_cycle;


  return reopened_cycle;
end;
$$;


revoke execute
on function public.reopen_previous_budget_cycle()
from public;

grant execute
on function public.reopen_previous_budget_cycle()
to authenticated;


-- =========================================================
-- UPDATE REOPENED CYCLE DATES
-- =========================================================

create or replace function public.update_reopened_budget_cycle_end_date(
  new_end_date date
)
returns public.budget_cycles
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();

  reopened_cycle public.budget_cycles;
  paused_cycle public.budget_cycles;

  new_current_start_date date;
begin
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;


  select *
  into reopened_cycle
  from public.budget_cycles
  where user_id = current_user_id
    and status = 'active'
    and end_date is not null
  for update;


  if reopened_cycle.id is null then
    raise exception
      'No reopened budget cycle found';
  end if;


  select *
  into paused_cycle
  from public.budget_cycles
  where user_id = current_user_id
    and status = 'paused'
  for update;


  if paused_cycle.id is null then
    raise exception
      'No paused current cycle found';
  end if;


  if new_end_date < reopened_cycle.start_date then
    raise exception
      'Cycle end date cannot be before its start date';
  end if;


  if new_end_date >= current_date then
    raise exception
      'Previous cycle must end before today';
  end if;


  new_current_start_date :=
    new_end_date + 1;


  -- Previous-cycle expenses must remain
  -- inside the corrected period.
  if exists (
    select 1
    from public.expenses
    where user_id = current_user_id
      and cycle_id = reopened_cycle.id
      and date > new_end_date
  ) then
    raise exception
      'An expense exists after the selected cycle end date';
  end if;


  -- Previous-cycle income must remain
  -- inside the corrected period.
  if exists (
    select 1
    from public.incomes
    where user_id = current_user_id
      and cycle_id = reopened_cycle.id
      and date > new_end_date
  ) then
    raise exception
      'An income entry exists after the selected cycle end date';
  end if;


  -- Moving the current cycle forward cannot
  -- leave an expense before its new start date.
  if exists (
    select 1
    from public.expenses
    where user_id = current_user_id
      and cycle_id = paused_cycle.id
      and date < new_current_start_date
  ) then
    raise exception
      'A current-cycle expense exists before the new cycle start date';
  end if;


  -- Same protection for current-cycle income.
  if exists (
    select 1
    from public.incomes
    where user_id = current_user_id
      and cycle_id = paused_cycle.id
      and date < new_current_start_date
  ) then
    raise exception
      'A current-cycle income entry exists before the new cycle start date';
  end if;


  update public.budget_cycles
  set end_date = new_end_date
  where id = reopened_cycle.id
    and user_id = current_user_id
  returning *
  into reopened_cycle;


  update public.budget_cycles
  set start_date = new_current_start_date
  where id = paused_cycle.id
    and user_id = current_user_id;


  return reopened_cycle;
end;
$$;


revoke execute
on function public.update_reopened_budget_cycle_end_date(date)
from public;

grant execute
on function public.update_reopened_budget_cycle_end_date(date)
to authenticated;