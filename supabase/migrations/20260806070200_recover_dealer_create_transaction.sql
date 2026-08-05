begin;


-- =========================================
-- Member Number Sequence
-- =========================================

create sequence if not exists
  public.member_number_seq
  start with 100001
  increment by 1
  minvalue 100001
  no maxvalue
  cache 1;


do $$
declare
  v_max_number bigint;
  v_last_value bigint;
  v_is_called boolean;
begin

  select
    max(
      nullif(
        regexp_replace(
          member_code,
          '\D',
          '',
          'g'
        ),
        ''
      )::bigint
    )
  into v_max_number
  from public.members
  where member_code is not null;


  select
    last_value,
    is_called
  into
    v_last_value,
    v_is_called
  from public.member_number_seq;


  if v_max_number is not null then

    perform setval(
      'public.member_number_seq',
      greatest(
        v_max_number,
        case
          when v_is_called
            then v_last_value
          else 100000
        end
      ),
      true
    );

  end if;

end;
$$;


create or replace function
  public.generate_member_number()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_member_number text;
begin

  if nullif(
    trim(new.member_code),
    ''
  ) is null then

    v_member_number :=
      'ALD-' ||
      lpad(
        nextval(
          'public.member_number_seq'
        )::text,
        6,
        '0'
      );


    new.member_code :=
      v_member_number;

  else

    new.member_code :=
      upper(
        trim(
          new.member_code
        )
      );

  end if;


  return new;

end;
$$;


drop trigger if exists
  trg_members_generate_number
on public.members;


create trigger
  trg_members_generate_number
before insert
on public.members
for each row
execute function
  public.generate_member_number();


-- =========================================
-- Dealer Number Sequence
-- =========================================

create sequence if not exists
  public.dealer_number_seq
  start with 100001
  increment by 1
  minvalue 100001
  no maxvalue
  cache 1;


do $$
declare
  v_max_number bigint;
  v_last_value bigint;
  v_is_called boolean;
begin

  select
    max(
      nullif(
        regexp_replace(
          coalesce(
            dealer_no,
            dealer_code
          ),
          '\D',
          '',
          'g'
        ),
        ''
      )::bigint
    )
  into v_max_number
  from public.dealers
  where dealer_no is not null
    or dealer_code is not null;


  select
    last_value,
    is_called
  into
    v_last_value,
    v_is_called
  from public.dealer_number_seq;


  if v_max_number is not null then

    perform setval(
      'public.dealer_number_seq',
      greatest(
        v_max_number,
        case
          when v_is_called
            then v_last_value
          else 100000
        end
      ),
      true
    );

  end if;

end;
$$;


create or replace function
  public.generate_dealer_number()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_dealer_number text;
begin

  if
    nullif(
      trim(
        new.dealer_no
      ),
      ''
    ) is null
    and
    nullif(
      trim(
        new.dealer_code
      ),
      ''
    ) is null
  then

    v_dealer_number :=
      'DEA-' ||
      lpad(
        nextval(
          'public.dealer_number_seq'
        )::text,
        6,
        '0'
      );


    new.dealer_no :=
      v_dealer_number;


    new.dealer_code :=
      v_dealer_number;

  elsif
    nullif(
      trim(
        new.dealer_no
      ),
      ''
    ) is null
  then

    new.dealer_no :=
      upper(
        trim(
          new.dealer_code
        )
      );

  elsif
    nullif(
      trim(
        new.dealer_code
      ),
      ''
    ) is null
  then

    new.dealer_code :=
      upper(
        trim(
          new.dealer_no
        )
      );

  else

    new.dealer_no :=
      upper(
        trim(
          new.dealer_no
        )
      );


    new.dealer_code :=
      upper(
        trim(
          new.dealer_code
        )
      );

  end if;


  return new;

end;
$$;


drop trigger if exists
  trg_dealers_generate_number
on public.dealers;


create trigger
  trg_dealers_generate_number
before insert
on public.dealers
for each row
execute function
  public.generate_dealer_number();


-- =========================================
-- Dealer Unique Indexes
-- =========================================

create unique index if not exists
  idx_dealers_dealer_no
on public.dealers (
  dealer_no
)
where dealer_no is not null;


create unique index if not exists
  idx_dealers_member_id_unique
on public.dealers (
  member_id
)
where member_id is not null;


create unique index if not exists
  idx_dealers_email_unique_normalized
on public.dealers (
  lower(
    trim(
      email
    )
  )
)
where email is not null
  and trim(email) <> '';


create unique index if not exists
  idx_dealers_phone_unique_normalized
on public.dealers (
  trim(
    phone
  )
)
where phone is not null
  and trim(phone) <> '';


-- =========================================
-- Atomic Member + Dealer Creation RPC
-- =========================================

create or replace function
  public.create_dealer_with_new_member(
    p_name text,
    p_phone text default null,
    p_email text default null,
    p_market varchar default 'taiwan',
    p_level varchar default 'normal',
    p_status text default 'pending',
    p_region_id uuid default null,
    p_direct_count integer default 0,
    p_team_count integer default 0,
    p_team_sales numeric default 0,
    p_total_commission numeric default 0,
    p_remark text default null
  )
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_name text;
  v_phone text;
  v_email text;

  v_member public.members%rowtype;
  v_dealer public.dealers%rowtype;
begin

  v_name :=
    nullif(
      trim(
        p_name
      ),
      ''
    );


  v_phone :=
    nullif(
      trim(
        p_phone
      ),
      ''
    );


  v_email :=
    nullif(
      lower(
        trim(
          p_email
        )
      ),
      ''
    );


  if v_name is null then

    raise exception
      using
        errcode = '22023',
        message = '經銷商姓名不可空白。';

  end if;


  if
    v_email is not null
    and
    v_email !~*
      '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  then

    raise exception
      using
        errcode = '22023',
        message = '電子信箱格式不正確。';

  end if;


  if coalesce(
    p_direct_count,
    0
  ) < 0 then

    raise exception
      using
        errcode = '22023',
        message = '直推人數不可小於 0。';

  end if;


  if coalesce(
    p_team_count,
    0
  ) < 0 then

    raise exception
      using
        errcode = '22023',
        message = '團隊人數不可小於 0。';

  end if;


  if coalesce(
    p_team_sales,
    0
  ) < 0 then

    raise exception
      using
        errcode = '22023',
        message = '團隊業績不可小於 0。';

  end if;


  if coalesce(
    p_total_commission,
    0
  ) < 0 then

    raise exception
      using
        errcode = '22023',
        message = '累計佣金不可小於 0。';

  end if;


  insert into public.members (

    member_code,
    email,
    phone,
    name,
    level,
    status

  )
  values (

    null,
    v_email,
    v_phone,
    v_name,
    1,
    'active'

  )
  returning *
  into v_member;


  insert into public.dealers (

    dealer_code,
    dealer_no,
    member_id,
    name,
    phone,
    email,
    market,
    level,
    status,
    region_id,
    direct_count,
    team_count,
    team_sales,
    total_commission,
    remark

  )
  values (

    null,
    null,
    v_member.id,
    v_name,
    v_phone,
    v_email,
    coalesce(
      nullif(
        trim(
          p_market
        ),
        ''
      ),
      'taiwan'
    ),
    coalesce(
      nullif(
        trim(
          p_level
        ),
        ''
      ),
      'normal'
    ),
    coalesce(
      nullif(
        trim(
          p_status
        ),
        ''
      ),
      'pending'
    ),
    p_region_id,
    coalesce(
      p_direct_count,
      0
    ),
    coalesce(
      p_team_count,
      0
    ),
    coalesce(
      p_team_sales,
      0
    ),
    coalesce(
      p_total_commission,
      0
    ),
    nullif(
      trim(
        p_remark
      ),
      ''
    )

  )
  returning *
  into v_dealer;


  return jsonb_build_object(

    'success',
    true,

    'member',
    to_jsonb(
      v_member
    ),

    'dealer',
    to_jsonb(
      v_dealer
    )

  );

end;
$$;


-- =========================================
-- RPC Permission
-- =========================================

revoke all
on function
  public.create_dealer_with_new_member(
    text,
    text,
    text,
    varchar,
    varchar,
    text,
    uuid,
    integer,
    integer,
    numeric,
    numeric,
    text
  )
from public;


grant execute
on function
  public.create_dealer_with_new_member(
    text,
    text,
    text,
    varchar,
    varchar,
    text,
    uuid,
    integer,
    integer,
    numeric,
    numeric,
    text
  )
to authenticated;


-- =========================================
-- Sequence Permissions
-- =========================================

grant usage, select, update
on sequence public.member_number_seq
to authenticated;


grant usage, select, update
on sequence public.dealer_number_seq
to authenticated;


commit;
