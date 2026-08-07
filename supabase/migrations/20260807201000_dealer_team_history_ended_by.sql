begin;

-- ============================================================
-- ALADDIN Super Platform
-- Dealer Team Relation History Audit Enhancement
--
-- Adds:
--   ended_by
--   ended_operator_email
--   ended_operator_name
--
-- Permission remains:
--   dealer.team.view
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

        'ended_by',
        relation.ended_by,

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

        'ended_operator_email',
        ended_auth_user.email,

        'ended_operator_name',
        case
          when relation.ended_by is null then
            null

          when nullif(
            trim(
              coalesce(
                ended_auth_user.raw_user_meta_data
                  ->> 'name',
                ended_auth_user.raw_user_meta_data
                  ->> 'full_name',
                ended_auth_user.raw_user_meta_data
                  ->> 'display_name',
                ''
              )
            ),
            ''
          ) is not null then
            coalesce(
              ended_auth_user.raw_user_meta_data
                ->> 'name',
              ended_auth_user.raw_user_meta_data
                ->> 'full_name',
              ended_auth_user.raw_user_meta_data
                ->> 'display_name'
            )

          when ended_auth_user.email is not null then
            ended_auth_user.email

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

  left join auth.users auth_user
    on auth_user.id =
      relation.created_by

  left join auth.users ended_auth_user
    on ended_auth_user.id =
      relation.ended_by;


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
-- RPC Execute Permission
-- ============================================================

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


commit;
