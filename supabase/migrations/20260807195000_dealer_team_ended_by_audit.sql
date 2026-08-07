begin;

-- ============================================================
-- ALADDIN Super Platform
-- Dealer Team Audit Log Enhancement
--
-- created_by:
--   relation creator / assignment operator
--
-- ended_by:
--   operator who terminated the relation
--   including reassign / unassign
-- ============================================================


-- ============================================================
-- Add ended_by
-- ============================================================

alter table
  public.dealer_team_relations

add column if not exists
  ended_by uuid;


-- ============================================================
-- ended_by -> auth.users
-- ============================================================

do $$
begin

  if not exists (

    select 1

    from pg_constraint

    where conname =
      'dealer_team_relations_ended_by_fk'

      and conrelid =
        'public.dealer_team_relations'::regclass

  ) then

    alter table
      public.dealer_team_relations

    add constraint
      dealer_team_relations_ended_by_fk

    foreign key (
      ended_by
    )

    references auth.users(id)

    on delete set null;

  end if;

end;
$$;


-- ============================================================
-- Index
-- ============================================================

create index if not exists
idx_dealer_team_relations_ended_by

on public.dealer_team_relations (
  ended_by
);


commit;
