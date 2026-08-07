begin;

-- ============================================================
-- ALADDIN Super Platform
-- Dealer Team + Permission Matrix
-- Production Baseline Migration
-- 2026-08-07
-- ============================================================

create extension if not exists "uuid-ossp";


-- ============================================================
-- Prerequisite Check
-- ============================================================

do $$
begin

  if to_regclass('public.dealers') is null then
    raise exception
      'Migration prerequisite missing: public.dealers';
  end if;

  if to_regclass('public.roles') is null then
    raise exception
      'Migration prerequisite missing: public.roles';
  end if;

  if to_regclass('public.permissions') is null then
    raise exception
      'Migration prerequisite missing: public.permissions';
  end if;

  if to_regclass('public.role_permissions') is null then
    raise exception
      'Migration prerequisite missing: public.role_permissions';
  end if;

  if to_regclass('public.user_roles') is null then
    raise exception
      'Migration prerequisite missing: public.user_roles';
  end if;

end;
$$;


-- ============================================================
-- Dealer Team Permissions
-- ============================================================

insert into public.permissions (
  id,
  code,
  name,
  module
)
values
(
  'f3022e65-51e7-4a77-8d1c-d00e08c5e194',
  'dealer.view',
  '查看經銷商',
  'dealer'
),
(
  'f47dcbd8-e4e3-4262-baef-7ec9c660b899',
  'dealer.team.view',
  '查看經銷商業績與團隊資料',
  'dealer'
),
(
  '81c13aab-1fe4-4299-8ba6-f642e2b9ea0b',
  'dealer.team.manage',
  '管理經銷商上下級與團隊關係',
  'dealer'
)
on conflict (code)
do update
set
  name = excluded.name,
  module = excluded.module;


create unique index if not exists
  idx_role_permissions_role_permission_unique
on public.role_permissions (
  role_id,
  permission_id
);


-- ============================================================
-- Permission Helper
-- ============================================================

create or replace function
public.is_current_user_super_admin()
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $function$

  select exists (

    select 1

    from public.user_roles user_role

    join public.roles role_data
      on role_data.id =
         user_role.role_id

    where user_role.user_id =
          auth.uid()

      and role_data.code =
          'super_admin'

  );

$function$;


create or replace function
public.has_current_user_permission(
  p_permission_code text
)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $function$

  select
    auth.uid() is not null

    and exists (

      select 1

      from public.user_roles ur

      join public.roles r
        on r.id =
           ur.role_id

      left join public.role_permissions rp
        on rp.role_id =
           r.id

      left join public.permissions p
        on p.id =
           rp.permission_id

      where ur.user_id =
            auth.uid()

        and (
          r.code =
          'super_admin'

          or

          p.code =
          p_permission_code
        )

    );

$function$;


create or replace function
public.assert_current_user_permission(
  p_permission_code text
)
returns void
language plpgsql
stable
security definer
set search_path to 'public'
as $function$
begin

  if auth.uid() is null then

    raise exception
      '尚未登入，無法執行此操作。'
      using errcode = '42501';

  end if;


  if not public.has_current_user_permission(
    p_permission_code
  ) then

    raise exception
      '目前帳號沒有權限：%',
      p_permission_code
      using errcode = '42501';

  end if;

end;
$function$;


-- ============================================================
-- Permission Matrix Read RPC
-- ============================================================

create or replace function
public.get_role_permission_matrix()
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
begin

  if not public.is_current_user_super_admin() then

    raise exception
      '只有超級管理員可以查看角色權限矩陣。'
      using errcode = '42501';

  end if;


  return jsonb_build_object(

    'success',
    true,

    'roles',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id',
            role_data.id,

            'code',
            role_data.code,

            'name',
            role_data.name,

            'description',
            role_data.description,

            'locked',
            role_data.code =
            'super_admin'
          )
          order by
            case role_data.code
              when 'super_admin'
                then 1
              when 'system_admin'
                then 2
              when 'operation_admin'
                then 3
              when 'finance_admin'
                then 4
              when 'customer_service'
                then 5
              when 'merchant_admin'
                then 6
              when 'dealer_admin'
                then 7
              when 'member'
                then 8
              else 99
            end,
            role_data.name
        )
        from public.roles role_data
      ),
      '[]'::jsonb
    ),

    'permissions',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id',
            permission_data.id,

            'code',
            permission_data.code,

            'name',
            permission_data.name,

            'module',
            permission_data.module
          )
          order by
            permission_data.module,
            permission_data.code
        )
        from public.permissions
        permission_data
      ),
      '[]'::jsonb
    ),

    'assignments',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'roleId',
            role_permission.role_id,

            'permissionId',
            role_permission.permission_id
          )
          order by
            role_permission.role_id,
            role_permission.permission_id
        )
        from public.role_permissions
        role_permission
      ),
      '[]'::jsonb
    )

  );

end;
$function$;


-- ============================================================
-- Permission Matrix Update RPC
-- ============================================================

create or replace function
public.update_role_permissions(
  p_role_id uuid,
  p_permission_ids uuid[]
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare

  v_role_code text;

  v_role_name text;

  v_permission_ids uuid[];

  v_assigned_count integer := 0;

begin

  if not public.is_current_user_super_admin() then

    raise exception
      '只有超級管理員可以修改角色權限。'
      using errcode = '42501';

  end if;


  select
    role_data.code,
    role_data.name

  into
    v_role_code,
    v_role_name

  from public.roles role_data

  where role_data.id =
        p_role_id;


  if not found then

    raise exception
      '找不到指定角色：%',
      p_role_id
      using errcode = 'P0002';

  end if;


  if v_role_code =
     'super_admin' then

    raise exception
      '超級管理員權限為系統保護項目，不可取消或修改。'
      using errcode = '42501';

  end if;


  v_permission_ids :=
    coalesce(
      p_permission_ids,
      '{}'::uuid[]
    );


  if exists (

    select 1

    from unnest(
      v_permission_ids
    ) selected_permission_id

    left join public.permissions
      permission_data
      on permission_data.id =
         selected_permission_id

    where permission_data.id
          is null

  ) then

    raise exception
      '送出的權限清單包含不存在的權限。'
      using errcode = 'P0002';

  end if;


  if exists (

    select 1

    from public.permissions
    permission_data

    where permission_data.id =
          any(v_permission_ids)

      and permission_data.code =
          'dealer.team.manage'

  ) then

    v_permission_ids :=
      v_permission_ids
      ||
      array(

        select permission_data.id

        from public.permissions
        permission_data

        where permission_data.code in (
          'dealer.team.view',
          'dealer.view'
        )

      );

  end if;


  if exists (

    select 1

    from public.permissions
    permission_data

    where permission_data.id =
          any(v_permission_ids)

      and permission_data.code =
          'dealer.team.view'

  ) then

    v_permission_ids :=
      v_permission_ids
      ||
      array(

        select permission_data.id

        from public.permissions
        permission_data

        where permission_data.code =
              'dealer.view'

      );

  end if;


  select
    coalesce(
      array_agg(
        distinct permission_id
      ),
      '{}'::uuid[]
    )

  into
    v_permission_ids

  from unnest(
    v_permission_ids
  ) permission_id;


  delete from public.role_permissions
  where role_id =
        p_role_id;


  insert into public.role_permissions (
    role_id,
    permission_id
  )

  select
    p_role_id,
    permission_id

  from unnest(
    v_permission_ids
  ) permission_id;


  get diagnostics
    v_assigned_count =
    row_count;


  return jsonb_build_object(

    'success',
    true,

    'message',
    format(
      '%s權限更新成功。',
      v_role_name
    ),

    'roleId',
    p_role_id,

    'roleCode',
    v_role_code,

    'assignedCount',
    v_assigned_count

  );

end;
$function$;


-- ============================================================
-- Dealer Team Relation Table
-- ============================================================

create table if not exists
public.dealer_team_relations (

  id uuid
    not null
    default uuid_generate_v4(),

  dealer_id uuid
    not null,

  parent_dealer_id uuid,

  status text
    not null
    default 'active',

  joined_at timestamptz
    not null
    default now(),

  ended_at timestamptz,

  created_by uuid,

  remark text,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint dealer_team_relations_pkey
    primary key (id),

  constraint dealer_team_relations_dealer_fk
    foreign key (dealer_id)
    references public.dealers(id)
    on delete cascade,

  constraint dealer_team_relations_parent_dealer_fk
    foreign key (parent_dealer_id)
    references public.dealers(id)
    on delete set null,

  constraint dealer_team_relations_created_by_fk
    foreign key (created_by)
    references auth.users(id)
    on delete set null,

  constraint dealer_team_relations_not_self_check
    check (
      parent_dealer_id is null
      or dealer_id <> parent_dealer_id
    ),

  constraint dealer_team_relations_status_check
    check (
      status = any(
        array[
          'active'::text,
          'inactive'::text,
          'terminated'::text
        ]
      )
    )

);


-- ============================================================
-- Ensure Constraints For Existing Table
-- ============================================================

do $$
begin

  if not exists (
    select 1
    from pg_constraint
    where conname =
      'dealer_team_relations_dealer_fk'
  ) then

    alter table
      public.dealer_team_relations
    add constraint
      dealer_team_relations_dealer_fk
    foreign key (dealer_id)
    references public.dealers(id)
    on delete cascade;

  end if;


  if not exists (
    select 1
    from pg_constraint
    where conname =
      'dealer_team_relations_parent_dealer_fk'
  ) then

    alter table
      public.dealer_team_relations
    add constraint
      dealer_team_relations_parent_dealer_fk
    foreign key (parent_dealer_id)
    references public.dealers(id)
    on delete set null;

  end if;


  if not exists (
    select 1
    from pg_constraint
    where conname =
      'dealer_team_relations_created_by_fk'
  ) then

    alter table
      public.dealer_team_relations
    add constraint
      dealer_team_relations_created_by_fk
    foreign key (created_by)
    references auth.users(id)
    on delete set null;

  end if;


  if not exists (
    select 1
    from pg_constraint
    where conname =
      'dealer_team_relations_not_self_check'
  ) then

    alter table
      public.dealer_team_relations
    add constraint
      dealer_team_relations_not_self_check
    check (
      parent_dealer_id is null
      or dealer_id <> parent_dealer_id
    );

  end if;


  if not exists (
    select 1
    from pg_constraint
    where conname =
      'dealer_team_relations_status_check'
  ) then

    alter table
      public.dealer_team_relations
    add constraint
      dealer_team_relations_status_check
    check (
      status = any(
        array[
          'active'::text,
          'inactive'::text,
          'terminated'::text
        ]
      )
    );

  end if;

end;
$$;


-- ============================================================
-- Dealer Team Indexes
-- ============================================================

create unique index if not exists
idx_dealer_team_relations_dealer_active_unique
on public.dealer_team_relations (
  dealer_id
)
where status = 'active';


create index if not exists
idx_dealer_team_relations_created_at
on public.dealer_team_relations (
  created_at desc
);


create index if not exists
idx_dealer_team_relations_parent
on public.dealer_team_relations (
  parent_dealer_id
);


create index if not exists
idx_dealer_team_relations_status
on public.dealer_team_relations (
  status
);


-- ============================================================
-- updated_at Trigger Helper
-- ============================================================

create or replace function
public.set_dealer_team_relation_updated_at()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
begin

  new.updated_at :=
    now();

  return new;

end;
$function$;


-- ============================================================
-- Full Team Count Refresh
-- ============================================================

create or replace function
public.refresh_dealer_team_counts()
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare

  v_updated_count integer :=
    0;

begin

  with recursive team_tree as (

    select
      relation.parent_dealer_id
        as root_dealer_id,

      relation.dealer_id
        as descendant_dealer_id,

      1 as depth,

      array[
        relation.parent_dealer_id,
        relation.dealer_id
      ]::uuid[]
        as visited_ids

    from public.dealer_team_relations
      relation

    where relation.status =
          'active'

      and relation.parent_dealer_id
          is not null


    union all


    select
      tree.root_dealer_id,

      relation.dealer_id,

      tree.depth + 1,

      tree.visited_ids
      ||
      relation.dealer_id

    from team_tree tree

    join public.dealer_team_relations
      relation

      on relation.parent_dealer_id =
         tree.descendant_dealer_id

    where relation.status =
          'active'

      and relation.parent_dealer_id
          is not null

      and not (
        relation.dealer_id =
        any(tree.visited_ids)
      )

  ),

  calculated_counts as (

    select
      dealer.id
        as dealer_id,

      (
        select
          count(*)::integer

        from public.dealer_team_relations
          direct_relation

        where direct_relation.parent_dealer_id =
              dealer.id

          and direct_relation.status =
              'active'

      ) as direct_count,

      (
        select
          count(
            distinct
            tree.descendant_dealer_id
          )::integer

        from team_tree tree

        where tree.root_dealer_id =
              dealer.id

      ) as team_count

    from public.dealers dealer

  ),

  updated_dealers as (

    update public.dealers dealer

    set
      direct_count =
        calculated.direct_count,

      team_count =
        calculated.team_count,

      updated_at =
        now()

    from calculated_counts
      calculated

    where dealer.id =
          calculated.dealer_id

    returning dealer.id

  )

  select
    count(*)::integer

  into
    v_updated_count

  from updated_dealers;


  return jsonb_build_object(
    'success',
    true,

    'message',
    '經銷商團隊人數已重新計算。',

    'updated_count',
    v_updated_count
  );

end;
$function$;


create or replace function
public.refresh_dealer_team_counts_trigger()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin

  perform
    public.refresh_dealer_team_counts();

  return coalesce(
    new,
    old
  );

end;
$function$;


-- ============================================================
-- Dealer Team Triggers
-- ============================================================

drop trigger if exists
trg_dealer_team_relations_updated_at
on public.dealer_team_relations;


create trigger
trg_dealer_team_relations_updated_at

before update
on public.dealer_team_relations

for each row

execute function
public.set_dealer_team_relation_updated_at();


drop trigger if exists
trg_refresh_dealer_team_counts
on public.dealer_team_relations;


create trigger
trg_refresh_dealer_team_counts

after insert
or delete
or update

on public.dealer_team_relations

for each statement

execute function
public.refresh_dealer_team_counts_trigger();


-- ============================================================
-- Part B continues below.
-- DO NOT add COMMIT here.
-- ============================================================

-- ============================================================
-- Dealer Team Read RPC
-- Permission: dealer.team.view
-- ============================================================

create or replace function
public.get_dealer_team_performance(
  p_dealer_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_dealer public.dealers%rowtype;

  v_parent_dealer_id uuid;

  v_parent jsonb :=
    null;

  v_direct_dealers jsonb :=
    '[]'::jsonb;

  v_direct_count integer :=
    0;

  v_team_count integer :=
    0;

  v_team_sales numeric :=
    0;

  v_total_commission numeric :=
    0;

begin

  perform public.assert_current_user_permission(
    'dealer.team.view'
  );


  select *
  into v_dealer
  from public.dealers
  where id =
        p_dealer_id;


  if not found then

    raise exception
      '找不到經銷商資料：%',
      p_dealer_id;

  end if;


  -- ----------------------------------------------------------
  -- Current Parent Dealer
  -- ----------------------------------------------------------

  select
    relation.parent_dealer_id

  into
    v_parent_dealer_id

  from public.dealer_team_relations
    relation

  where relation.dealer_id =
        p_dealer_id

    and relation.status =
        'active'

    and relation.parent_dealer_id
        is not null

  order by
    relation.joined_at desc

  limit 1;


  if v_parent_dealer_id
     is not null then

    select jsonb_build_object(

      'id',
      parent.id,

      'dealer_no',
      parent.dealer_no,

      'name',
      parent.name,

      'phone',
      parent.phone,

      'email',
      parent.email,

      'market',
      parent.market,

      'level',
      parent.level,

      'status',
      parent.status,

      'direct_count',
      coalesce(
        parent.direct_count,
        0
      ),

      'team_count',
      coalesce(
        parent.team_count,
        0
      ),

      'team_sales',
      coalesce(
        parent.team_sales,
        0
      )

    )

    into
      v_parent

    from public.dealers
      parent

    where parent.id =
          v_parent_dealer_id;

  end if;


  -- ----------------------------------------------------------
  -- Direct Dealers
  -- ----------------------------------------------------------

  select coalesce(

    jsonb_agg(

      jsonb_build_object(

        'id',
        child.id,

        'dealer_no',
        child.dealer_no,

        'name',
        child.name,

        'phone',
        child.phone,

        'email',
        child.email,

        'market',
        child.market,

        'level',
        child.level,

        'status',
        child.status,

        'direct_count',
        coalesce(
          child.direct_count,
          0
        ),

        'team_count',
        coalesce(
          child.team_count,
          0
        ),

        'team_sales',
        coalesce(
          child.team_sales,
          0
        ),

        'joined_at',
        relation.joined_at

      )

      order by
        relation.joined_at desc

    ),

    '[]'::jsonb

  )

  into
    v_direct_dealers

  from public.dealer_team_relations
    relation

  join public.dealers
    child

    on child.id =
       relation.dealer_id

  where relation.parent_dealer_id =
        p_dealer_id

    and relation.status =
        'active';


  v_direct_count :=
    coalesce(
      v_dealer.direct_count,
      0
    );


  v_team_count :=
    coalesce(
      v_dealer.team_count,
      0
    );


  v_team_sales :=
    coalesce(
      v_dealer.team_sales,
      0
    );


  v_total_commission :=
    coalesce(
      v_dealer.total_commission,
      0
    );


  return jsonb_build_object(

    'dealer',
    jsonb_build_object(

      'id',
      v_dealer.id,

      'dealer_no',
      v_dealer.dealer_no,

      'member_id',
      v_dealer.member_id,

      'name',
      v_dealer.name,

      'phone',
      v_dealer.phone,

      'email',
      v_dealer.email,

      'market',
      v_dealer.market,

      'level',
      v_dealer.level,

      'status',
      v_dealer.status,

      'region_id',
      v_dealer.region_id,

      'region_name',
      v_dealer.region_name,

      'direct_count',
      v_direct_count,

      'team_count',
      v_team_count,

      'team_sales',
      v_team_sales,

      'total_commission',
      v_total_commission,

      'approved_by',
      v_dealer.approved_by,

      'approved_at',
      v_dealer.approved_at,

      'remark',
      v_dealer.remark,

      'created_at',
      v_dealer.created_at,

      'updated_at',
      v_dealer.updated_at

    ),

    'parent_dealer',
    v_parent,

    'direct_dealers',
    v_direct_dealers,

    'statistics',
    jsonb_build_object(

      'direct_count',
      v_direct_count,

      'team_count',
      v_team_count,

      'team_sales',
      v_team_sales,

      'total_commission',
      v_total_commission

    )

  );

end;
$function$;


-- ============================================================
-- Dealer Team Relation History
-- Permission: dealer.team.view
-- ============================================================

create or replace function
public.get_dealer_team_relation_history(
  p_dealer_id uuid,
  p_limit integer default 50
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare

  v_dealer_exists boolean;

  v_safe_limit integer;

  v_history jsonb :=
    '[]'::jsonb;

begin

  perform public.assert_current_user_permission(
    'dealer.team.view'
  );


  if p_dealer_id
     is null then

    raise exception
      '經銷商 ID 不可為空。';

  end if;


  select exists(

    select 1

    from public.dealers
      dealer

    where dealer.id =
          p_dealer_id

  )

  into
    v_dealer_exists;


  if not v_dealer_exists then

    raise exception
      '找不到經銷商資料：%',
      p_dealer_id;

  end if;


  v_safe_limit :=
    least(

      greatest(

        coalesce(
          p_limit,
          50
        ),

        1

      ),

      200

    );


  select coalesce(

    jsonb_agg(

      jsonb_build_object(

        'id',
        relation.id,

        'dealer_id',
        relation.dealer_id,

        'dealer_no',
        dealer.dealer_no,

        'dealer_name',
        dealer.name,

        'parent_dealer_id',
        relation.parent_dealer_id,

        'parent_dealer_no',
        parent.dealer_no,

        'parent_dealer_name',
        parent.name,

        'status',
        relation.status,

        'joined_at',
        relation.joined_at,

        'ended_at',
        relation.ended_at,

        'created_by',
        relation.created_by,

        'operator_email',
        auth_user.email,

        'operator_name',
        case

          when relation.created_by
               is null then

            '系統／歷史資料'


          when nullif(

            trim(

              coalesce(

                auth_user.raw_user_meta_data
                  ->> 'name',

                auth_user.raw_user_meta_data
                  ->> 'full_name',

                auth_user.raw_user_meta_data
                  ->> 'display_name',

                ''

              )

            ),

            ''

          ) is not null then

            coalesce(

              auth_user.raw_user_meta_data
                ->> 'name',

              auth_user.raw_user_meta_data
                ->> 'full_name',

              auth_user.raw_user_meta_data
                ->> 'display_name'

            )


          when auth_user.email
               is not null then

            auth_user.email


          else

            '未知操作人'

        end,

        'remark',
        relation.remark,

        'created_at',
        relation.created_at,

        'updated_at',
        relation.updated_at

      )

      order by
        relation.created_at desc,
        relation.id desc

    ),

    '[]'::jsonb

  )

  into
    v_history

  from (

    select *

    from public.dealer_team_relations

    where dealer_id =
          p_dealer_id

    order by
      created_at desc,
      id desc

    limit v_safe_limit

  ) relation

  join public.dealers
    dealer

    on dealer.id =
       relation.dealer_id

  left join public.dealers
    parent

    on parent.id =
       relation.parent_dealer_id

  left join auth.users
    auth_user

    on auth_user.id =
       relation.created_by;


  return jsonb_build_object(

    'success',
    true,

    'dealer_id',
    p_dealer_id,

    'total',
    jsonb_array_length(
      v_history
    ),

    'history',
    v_history,

    'message',
    '經銷商團隊關係歷史載入成功。'

  );

end;
$function$;


-- ============================================================
-- Part B2 continues below.
-- ============================================================


-- ============================================================
-- Dealer Team Assign Parent
-- Permission: dealer.team.manage
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
    p_created_by,
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


-- ============================================================
-- Dealer Team Reassign Parent
-- Permission: dealer.team.manage
-- ============================================================

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
    p_created_by,
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


-- ============================================================
-- Dealer Team Unassign Parent
-- Permission: dealer.team.manage
-- ============================================================

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
    p_created_by
  );

end;
$function$;


-- ============================================================
-- RPC Security / Execute Permissions
-- ============================================================

-- Permission Matrix internal helpers
revoke all
on function
public.is_current_user_super_admin()
from public;

revoke all
on function
public.assert_current_user_permission(text)
from public;


-- has_current_user_permission is safe for authenticated checks
revoke all
on function
public.has_current_user_permission(text)
from public;

grant execute
on function
public.has_current_user_permission(text)
to authenticated;


-- Permission Matrix UI RPC
revoke all
on function
public.get_role_permission_matrix()
from public;

grant execute
on function
public.get_role_permission_matrix()
to authenticated;


revoke all
on function
public.update_role_permissions(
  uuid,
  uuid[]
)
from public;

grant execute
on function
public.update_role_permissions(
  uuid,
  uuid[]
)
to authenticated;


-- Dealer Team Read RPC
revoke all
on function
public.get_dealer_team_performance(uuid)
from public;

grant execute
on function
public.get_dealer_team_performance(uuid)
to authenticated;


revoke all
on function
public.get_dealer_team_relation_history(
  uuid,
  integer
)
from public;

grant execute
on function
public.get_dealer_team_relation_history(
  uuid,
  integer
)
to authenticated;


-- Dealer Team Mutation RPC
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


-- Internal maintenance functions must not be callable by clients
revoke all
on function
public.refresh_dealer_team_counts()
from public;

revoke all
on function
public.refresh_dealer_team_counts()
from authenticated;


revoke all
on function
public.refresh_dealer_team_counts_trigger()
from public;

revoke all
on function
public.refresh_dealer_team_counts_trigger()
from authenticated;


revoke all
on function
public.set_dealer_team_relation_updated_at()
from public;

revoke all
on function
public.set_dealer_team_relation_updated_at()
from authenticated;


-- ============================================================
-- Initial Count Consistency
-- ============================================================

select
  public.refresh_dealer_team_counts();


commit;
