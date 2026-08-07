begin;

-- ============================================================
-- ALADDIN Super Platform
-- Dealer Team Audit Actor Hardening
-- 2026-08-07
--
-- Security rule:
-- p_created_by remains in RPC signatures for backward
-- compatibility, but caller-supplied UUID is NOT trusted.
--
-- Actual operator identity is always auth.uid().
-- ============================================================

create or replace function
public.assign_dealer_team_parent(
  p_dealer_id uuid,
  p_parent_dealer_id uuid,
  p_created_by uuid default null,
  p_remark text default null
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare

  v_dealer_exists boolean;
  v_parent_exists boolean;

  v_existing_relation
    public.dealer_team_relations%rowtype;

  v_relation
    public.dealer_team_relations%rowtype;

  v_cycle_exists boolean;

begin

  perform public.assert_current_user_permission(
    'dealer.team.manage'
  );


  if p_dealer_id is null then
    raise exception
      '經銷商 ID 不可為空。';
  end if;


  if p_parent_dealer_id is null then
    raise exception
      '上級經銷商 ID 不可為空。';
  end if;


  if p_dealer_id =
     p_parent_dealer_id then

    raise exception
      '經銷商不可指派自己為上級。';

  end if;


  select exists(
    select 1
    from public.dealers
    where id =
          p_dealer_id
  )
  into v_dealer_exists;


  if not v_dealer_exists then

    raise exception
      '找不到要指派的經銷商。';

  end if;


  select exists(
    select 1
    from public.dealers
    where id =
          p_parent_dealer_id
  )
  into v_parent_exists;


  if not v_parent_exists then

    raise exception
      '找不到上級經銷商。';

  end if;


  select *
  into v_existing_relation

  from public.dealer_team_relations

  where dealer_id =
        p_dealer_id

    and status =
        'active'

  limit 1;


  if found then

    raise exception
      '此經銷商目前已有有效上級。';

  end if;


  with recursive parent_chain as (

    select
      relation.dealer_id,
      relation.parent_dealer_id

    from public.dealer_team_relations
      relation

    where relation.dealer_id =
          p_parent_dealer_id

      and relation.status =
          'active'


    union all


    select
      relation.dealer_id,
      relation.parent_dealer_id

    from public.dealer_team_relations
      relation

    join parent_chain
      chain

      on relation.dealer_id =
         chain.parent_dealer_id

    where relation.status =
          'active'

  )

  select exists(

    select 1

    from parent_chain

    where parent_dealer_id =
          p_dealer_id

       or dealer_id =
          p_dealer_id

  )

  into
    v_cycle_exists;


  if v_cycle_exists then

    raise exception
      '此指派會形成循環團隊關係。';

  end if;


  insert into public.dealer_team_relations (
    dealer_id,
    parent_dealer_id,
    status,
    joined_at,
    ended_at,
    created_by,
    remark,
    created_at,
    updated_at
  )
  values (
    p_dealer_id,
    p_parent_dealer_id,
    'active',
    now(),
    null,
    auth.uid(),
    nullif(
      trim(p_remark),
      ''
    ),
    now(),
    now()
  )
  returning *
  into v_relation;


  update public.dealers

  set direct_count = (

    select
      count(*)::integer

    from public.dealer_team_relations

    where parent_dealer_id =
          p_parent_dealer_id

      and status =
          'active'

  )

  where id =
        p_parent_dealer_id;


  return jsonb_build_object(
    'success',
    true,

    'message',
    '經銷商上級指派成功。',

    'relation',
    to_jsonb(
      v_relation
    )
  );


exception

  when unique_violation then

    raise exception
      '此經銷商目前已有有效上級。';

end;
$function$;

create or replace function
public.reassign_dealer_team_parent(
  p_dealer_id uuid,
  p_new_parent_dealer_id uuid,
  p_created_by uuid default null,
  p_remark text default null
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare

  v_current_relation
    public.dealer_team_relations%rowtype;

  v_new_relation
    public.dealer_team_relations%rowtype;

  v_dealer_exists boolean;
  v_parent_exists boolean;
  v_cycle_exists boolean;

  v_old_parent_dealer_id uuid;

begin

  perform public.assert_current_user_permission(
    'dealer.team.manage'
  );


  if p_dealer_id is null then

    raise exception
      '經銷商 ID 不可為空。';

  end if;


  if p_new_parent_dealer_id
     is null then

    raise exception
      '新上級經銷商 ID 不可為空。';

  end if;


  if p_dealer_id =
     p_new_parent_dealer_id then

    raise exception
      '經銷商不可指派自己為上級。';

  end if;


  select exists(

    select 1

    from public.dealers

    where id =
          p_dealer_id

  )
  into
    v_dealer_exists;


  if not v_dealer_exists then

    raise exception
      '找不到要重新指派的經銷商。';

  end if;


  select exists(

    select 1

    from public.dealers

    where id =
          p_new_parent_dealer_id

  )
  into
    v_parent_exists;


  if not v_parent_exists then

    raise exception
      '找不到新的上級經銷商。';

  end if;


  select *
  into
    v_current_relation

  from public.dealer_team_relations

  where dealer_id =
        p_dealer_id

    and status =
        'active'

  order by
    joined_at desc

  limit 1

  for update;


  if not found then

    raise exception
      '此經銷商目前沒有有效上級，請使用首次指派功能。';

  end if;


  if v_current_relation.parent_dealer_id =
     p_new_parent_dealer_id then

    raise exception
      '新的上級經銷商與目前上級相同。';

  end if;


  v_old_parent_dealer_id :=
    v_current_relation.parent_dealer_id;


  with recursive parent_chain as (

    select
      relation.dealer_id,
      relation.parent_dealer_id

    from public.dealer_team_relations
      relation

    where relation.dealer_id =
          p_new_parent_dealer_id

      and relation.status =
          'active'


    union all


    select
      relation.dealer_id,
      relation.parent_dealer_id

    from public.dealer_team_relations
      relation

    join parent_chain
      chain

      on relation.dealer_id =
         chain.parent_dealer_id

    where relation.status =
          'active'

  )

  select exists(

    select 1

    from parent_chain

    where dealer_id =
          p_dealer_id

       or parent_dealer_id =
          p_dealer_id

  )

  into
    v_cycle_exists;


  if v_cycle_exists then

    raise exception
      '此重新指派會形成循環團隊關係。';

  end if;


  update public.dealer_team_relations

  set
    status =
      'terminated',

    ended_at =
      now(),

    updated_at =
      now(),

    remark =
      case

        when nullif(
          trim(p_remark),
          ''
        ) is null
          then remark

        when remark is null
          then
            '變更上級：'
            ||
            trim(p_remark)

        else
          remark
          ||
          E'\n變更上級：'
          ||
          trim(p_remark)

      end

  where id =
        v_current_relation.id;


  insert into public.dealer_team_relations (
    dealer_id,
    parent_dealer_id,
    status,
    joined_at,
    ended_at,
    created_by,
    remark,
    created_at,
    updated_at
  )
  values (
    p_dealer_id,
    p_new_parent_dealer_id,
    'active',
    now(),
    null,
    auth.uid(),
    nullif(
      trim(p_remark),
      ''
    ),
    now(),
    now()
  )
  returning *
  into
    v_new_relation;


  if v_old_parent_dealer_id
     is not null then

    update public.dealers

    set direct_count = (

      select
        count(*)::integer

      from public.dealer_team_relations

      where parent_dealer_id =
            v_old_parent_dealer_id

        and status =
            'active'

    )

    where id =
          v_old_parent_dealer_id;

  end if;


  update public.dealers

  set direct_count = (

    select
      count(*)::integer

    from public.dealer_team_relations

    where parent_dealer_id =
          p_new_parent_dealer_id

      and status =
          'active'

  )

  where id =
        p_new_parent_dealer_id;


  return jsonb_build_object(
    'success',
    true,

    'message',
    '經銷商上級變更成功。',

    'previous_relation',
    to_jsonb(
      v_current_relation
    ),

    'relation',
    to_jsonb(
      v_new_relation
    )
  );


exception

  when unique_violation then

    raise exception
      '此經銷商目前已有其他有效上級。';

end;
$function$;

create or replace function
public.unassign_dealer_team_parent(
  p_dealer_id uuid,
  p_created_by uuid default null,
  p_remark text default null
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare

  v_current_relation
    public.dealer_team_relations%rowtype;

  v_parent_dealer_id uuid;

begin

  perform public.assert_current_user_permission(
    'dealer.team.manage'
  );


  if p_dealer_id is null then

    raise exception
      '經銷商 ID 不可為空。';

  end if;


  select *
  into
    v_current_relation

  from public.dealer_team_relations

  where dealer_id =
        p_dealer_id

    and status =
        'active'

  order by
    joined_at desc

  limit 1

  for update;


  if not found then

    raise exception
      '此經銷商目前沒有有效上級。';

  end if;


  v_parent_dealer_id :=
    v_current_relation.parent_dealer_id;


  update public.dealer_team_relations

  set
    status =
      'terminated',

    ended_at =
      now(),

    updated_at =
      now(),

    remark =
      case

        when nullif(
          trim(p_remark),
          ''
        ) is null
          then remark

        when remark is null
          then
            '解除上級：'
            ||
            trim(p_remark)

        else
          remark
          ||
          E'\n解除上級：'
          ||
          trim(p_remark)

      end

  where id =
        v_current_relation.id;


  if v_parent_dealer_id
     is not null then

    update public.dealers

    set direct_count = (

      select
        count(*)::integer

      from public.dealer_team_relations

      where parent_dealer_id =
            v_parent_dealer_id

        and status =
            'active'

    )

    where id =
          v_parent_dealer_id;

  end if;


  return jsonb_build_object(
    'success',
    true,

    'message',
    '經銷商上級解除成功。',

    'relation_id',
    v_current_relation.id,

    'dealer_id',
    p_dealer_id,

    'previous_parent_dealer_id',
    v_parent_dealer_id,

    'ended_at',
    now(),

    'created_by',
    auth.uid()
  );

end;
$function$;

-- ============================================================
-- Reassert RPC execute permissions
-- ============================================================

revoke all
on function
public.assign_dealer_team_parent(
  uuid,
  uuid,
  uuid,
  text
)
from public;

grant execute
on function
public.assign_dealer_team_parent(
  uuid,
  uuid,
  uuid,
  text
)
to authenticated;


revoke all
on function
public.reassign_dealer_team_parent(
  uuid,
  uuid,
  uuid,
  text
)
from public;

grant execute
on function
public.reassign_dealer_team_parent(
  uuid,
  uuid,
  uuid,
  text
)
to authenticated;


revoke all
on function
public.unassign_dealer_team_parent(
  uuid,
  uuid,
  text
)
from public;

grant execute
on function
public.unassign_dealer_team_parent(
  uuid,
  uuid,
  text
)
to authenticated;


commit;
