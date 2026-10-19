-- NEW / PENDING. Not applied to production. Requires existing safe foundation.

begin;

CREATE OR REPLACE FUNCTION public.nexa_staff_hub_v2(p_token text, p_state_number integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions', 'pg_temp'
AS $function$
declare
  v_actor uuid; v_actor_game text; v_owner boolean:=false;
  v_identity uuid; v_user uuid; v_active_player uuid; v_session_state integer;
  v_game text; v_name text; v_context_staff uuid;
  v_tw uuid; v_mw uuid;
  v_transfer boolean:=false; v_ministry boolean:=false; v_wos boolean:=false; v_home boolean:=false;
  v_event_access boolean:=false; v_event_admin boolean:=false; v_manage_transfer boolean:=false; v_manage_ministry boolean:=false; v_manage_wos boolean:=false;
begin
  select a.account_id,a.game_id,a.is_global_owner
    into v_actor,v_actor_game,v_owner
  from public.nexa_workspace_access_actor_v1(p_token) a
  limit 1;
  if v_actor is null then return jsonb_build_object('ok',false,'error','session_expired'); end if;

  select s.active_player_account_id,s.active_state_number
    into v_active_player,v_session_state
  from public.transfer_staff_sessions s
  where s.account_id=v_actor
    and s.token_hash=encode(digest(p_token,'sha256'),'hex')
    and s.expires_at>now()
  order by s.created_at desc
  limit 1;

  select identity_id into v_identity from public.nexa_account_identity_links where account_id=v_actor limit 1;
  select auth_user_id into v_user from public.nexa_account_identities where id=v_identity;

  if v_active_player is not null and v_user is not null then
    select p.player_id,p.in_game_name,p.state_number
      into v_game,v_name,v_session_state
    from public.player_accounts p
    where p.id=v_active_player and p.user_id=v_user
    limit 1;
  end if;

  if v_game is null then
    select p.id,p.player_id,p.in_game_name,p.state_number
      into v_active_player,v_game,v_name,v_session_state
    from public.player_accounts p
    where p.user_id=v_user and p.player_id=v_actor_game
    limit 1;
  end if;

  if v_game is null then
    v_game:=v_actor_game;
    select game_name into v_name from public.transfer_staff_accounts where id=v_actor;
  end if;

  if p_state_number is null or p_state_number<1 then p_state_number:=coalesce(v_session_state,0); end if;

  select id into v_context_staff
  from public.transfer_staff_accounts
  where game_id=v_game
  order by created_at
  limit 1;

  select id into v_tw from public.transfer_workspaces where state_number=p_state_number and is_active order by created_at limit 1;
  select id into v_mw from public.ministry_workspaces_v2 where state_number=p_state_number and is_active order by created_at limit 1;

  v_transfer:=v_owner or (v_context_staff is not null and exists(select 1 from public.transfer_staff_access a where a.workspace_id=v_tw and a.account_id=v_context_staff and a.status='active'));
  v_ministry:=v_owner or (v_context_staff is not null and exists(select 1 from public.ministry_staff_access_v2 a where a.workspace_id=v_mw and a.account_id=v_context_staff and a.status='active'));
  v_wos:=v_owner or exists(select 1 from public.nexa_wos_alliance_access a where a.state_number=p_state_number and a.game_id=v_game and a.status='active')
                 or (v_context_staff is not null and exists(select 1 from public.gift_staff_access g left join public.gift_alliances ga on ga.id=g.alliance_id where g.staff_account_id=v_context_staff and g.is_active and (g.state_number=p_state_number or ga.state_number=p_state_number or g.role='owner')));
  v_home:=exists(select 1 from public.player_accounts p where p.player_id=v_game and p.user_id=v_user and p.state_number=p_state_number);

  v_manage_transfer:=v_owner or (v_context_staff is not null and exists(select 1 from public.transfer_staff_access a where a.workspace_id=v_tw and a.account_id=v_context_staff and a.status='active' and (a.is_manager or a.is_owner)));
  v_manage_ministry:=v_owner or (v_context_staff is not null and exists(select 1 from public.ministry_staff_access_v2 a where a.workspace_id=v_mw and a.account_id=v_context_staff and a.status='active' and (a.is_owner or a.access_level='admin')));
  v_manage_wos:=v_owner or exists(select 1 from public.nexa_wos_alliance_access a where a.state_number=p_state_number and a.game_id=v_game and a.status='active' and (a.access_level='admin'));

  v_event_access:=v_owner or exists(select 1 from public.nexa_event_staff_permissions_v1 where staff_account_id=v_context_staff and state_number=p_state_number and status='active');
  v_event_admin:=v_owner or exists(select 1 from public.nexa_event_staff_permissions_v1 where staff_account_id=v_context_staff and state_number=p_state_number and status='active' and access_level='admin');
  return jsonb_build_object(
    'ok',true,
    'game_id',v_game,
    'game_name',v_name,
    'player_account_id',v_active_player,
    'state_number',p_state_number,
    'global_owner',v_owner,
    'event_access',v_event_access,
    'can_manage_access',v_owner or v_manage_transfer or v_manage_ministry or v_manage_wos or v_event_admin,
    'manage_modules',jsonb_build_object('transfer',v_manage_transfer,'ministry',v_manage_ministry,'wos',v_manage_wos,'event',v_event_admin),
    'cards',jsonb_build_array(
      jsonb_build_object('module','nexa','label','NEXA Home','enabled',v_home,'url','index.html','reason',case when v_home then null else 'account_required' end),
      jsonb_build_object('module','transfer','label','Transfer Workspace','enabled',v_transfer and v_tw is not null,'workspace_id',v_tw,'url',case when v_tw is null then null else 'transfer-workspace-v544.html?workspace='||v_tw::text||'&state='||p_state_number::text end),
      jsonb_build_object('module','ministry','label','Ministry Workspace','enabled',v_ministry and v_mw is not null,'workspace_id',v_mw,'url',case when v_mw is null then null else 'ministry-workspace-v192.html?workspace='||v_mw::text||'&state='||p_state_number::text end),
      jsonb_build_object('module','wos','label','WOS Utilities','enabled',v_wos,'url','wos-utilities.html?state='||p_state_number::text)
    )
  );
end
$function$;


create or replace function public.transfer_staff_session(p_token text) returns jsonb
language plpgsql security definer set search_path=public,extensions,pg_temp as $$
declare a record; st integer; h jsonb; cards jsonb; mods jsonb; ws jsonb;
begin
 select * into a from public.nexa_workspace_access_actor_v1(p_token) limit 1;
 if a.account_id is null then return jsonb_build_object('ok',false,'error','session_expired'); end if;
 select coalesce(p.state_number,s.active_state_number) into st from public.transfer_staff_sessions s
 left join public.player_accounts p on p.id=s.active_player_account_id
 where s.token_hash=encode(digest(p_token,'sha256'),'hex') and s.expires_at>now() limit 1;
 h:=public.nexa_staff_hub_v2(p_token,st);
 if not coalesce((h->>'ok')::boolean,false) then return h; end if;
 select coalesce(jsonb_agg(c || jsonb_build_object('state_number',h->'state_number','access_level',case when coalesce((h->>'global_owner')::boolean,false) or coalesce((h->'manage_modules'->>(c->>'module'))::boolean,false) then 'admin' else 'regular' end,'is_owner',h->'global_owner')),'[]') into mods
 from jsonb_array_elements(h->'cards') c where (c->>'module') in ('transfer','ministry') and (c->>'enabled')::boolean;
 select coalesce(jsonb_agg(c || jsonb_build_object('state_number',h->'state_number','is_manager',coalesce((h->'manage_modules'->>'transfer')::boolean,false),'is_owner',h->'global_owner')),'[]') into ws
 from jsonb_array_elements(h->'cards') c where c->>'module'='transfer' and (c->>'enabled')::boolean;
 return h || jsonb_build_object('modules',mods,'workspaces',ws);
end $$;

create or replace function public.transfer_staff_access_ok(p_workspace_id uuid,p_token text,p_manager boolean default false)
 returns boolean language plpgsql stable security definer set search_path=public,extensions,pg_temp as $$
 declare st integer; h jsonb;
 begin
 select state_number into st from public.transfer_workspaces where id=p_workspace_id and is_active;
 if st is null then return false; end if;
 h:=public.nexa_staff_hub_v2(p_token,st);
 return coalesce((h->>'ok')::boolean,false) and exists(select 1 from jsonb_array_elements(h->'cards') c where c->>'module'='transfer' and c->>'workspace_id'=p_workspace_id::text and (c->>'enabled')::boolean)
 and (not p_manager or coalesce((h->'manage_modules'->>'transfer')::boolean,false));
 end $$;

create or replace function public.ministry_staff_access_ok_v2(p_workspace_id uuid,p_token text,p_require_admin boolean default false)
 returns boolean language plpgsql stable security definer set search_path=public,extensions,pg_temp as $$
 declare st integer; h jsonb;
 begin
 select state_number into st from public.ministry_workspaces_v2 where id=p_workspace_id and is_active;
 if st is null then return false; end if;
 h:=public.nexa_staff_hub_v2(p_token,st);
 return coalesce((h->>'ok')::boolean,false) and exists(select 1 from jsonb_array_elements(h->'cards') c where c->>'module'='ministry' and c->>'workspace_id'=p_workspace_id::text and (c->>'enabled')::boolean)
 and (not p_require_admin or coalesce((h->'manage_modules'->>'ministry')::boolean,false));
 end $$;

CREATE OR REPLACE FUNCTION public.ministry_workspace_snapshot_v2(p_workspace_id uuid, p_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_account uuid;v_access record;v_ws record;v_event record;v_requests jsonb;v_apps jsonb;v_logs jsonb;v_clear jsonb;
begin
  if not public.ministry_staff_access_ok_v2(p_workspace_id,p_token,false) then return jsonb_build_object('ok',false,'error','forbidden');end if;
  v_account:=public.transfer_staff_account_from_token(p_token);
  select * into v_access from public.ministry_staff_access_v2 where workspace_id=p_workspace_id and account_id=v_account and status='active';
  select * into v_ws from public.ministry_workspaces_v2 where id=p_workspace_id;
  select * into v_event from public.svs_events where state_number=v_ws.state_number and status<>'ended' order by prep_monday desc,updated_at desc limit 1;
  select coalesce(jsonb_agg(to_jsonb(r) order by r.day_type,coalesce(r.estimated_points,0) desc,r.in_game_name),'[]'::jsonb) into v_requests
    from public.ministry_requests_v2 r where r.workspace_id=p_workspace_id and (v_event.id is null or r.event_id=v_event.id) and r.status<>'archived';
  select coalesce(jsonb_agg(to_jsonb(a) order by a.day_type,a.slot_time),'[]'::jsonb) into v_apps
    from public.ministry_appointments_v2 a where a.workspace_id=p_workspace_id and (v_event.id is null or a.event_id=v_event.id);
  select coalesce(jsonb_agg(jsonb_build_object('id',l.id,'day_type',l.day_type,'action_type',l.action_type,'before_state',l.before_state,'after_state',l.after_state,'changed_at',l.changed_at,'changed_by_name',coalesce(ac.game_name,'Staff')) order by l.changed_at desc),'[]'::jsonb) into v_logs
    from public.ministry_workspace_logs_v2 l left join public.transfer_staff_accounts ac on ac.id=l.changed_by_account
    where l.workspace_id=p_workspace_id and (v_event.id is null or l.event_id=v_event.id) limit 100;
  select jsonb_build_object('batch_id',b.id,'cleared_at',b.cleared_at,'restore_until',b.restore_until,'status',b.status)
    into v_clear
    from public.ministry_clear_batches_v3 b
    where b.workspace_id=p_workspace_id and b.status='pending' and b.restore_until>now()
    order by b.cleared_at desc limit 1;
  return jsonb_build_object('ok',true,'workspace',to_jsonb(v_ws),'event',to_jsonb(v_event),'access_level',case when public.ministry_staff_access_ok_v2(p_workspace_id,p_token,true) then 'admin' else 'regular' end,'is_owner',coalesce(v_access.is_owner,false) or exists(select 1 from public.nexa_workspace_access_actor_v1(p_token) where is_global_owner),'requests',v_requests,'appointments',v_apps,'logs',v_logs,'clear_recovery',v_clear);
end
$function$;

create or replace function public.nexa_workspace_session_v3(p_token text,p_state_number integer) returns jsonb
language plpgsql security definer set search_path=public,extensions,pg_temp as $$
declare a record; st integer; h jsonb; cards jsonb; mods jsonb; ws jsonb;
begin
 select * into a from public.nexa_workspace_access_actor_v1(p_token) limit 1;
 if a.account_id is null then return jsonb_build_object('ok',false,'error','session_expired'); end if;
 select coalesce(p.state_number,s.active_state_number) into st from public.transfer_staff_sessions s
 left join public.player_accounts p on p.id=s.active_player_account_id
 where s.token_hash=encode(digest(p_token,'sha256'),'hex') and s.expires_at>now() limit 1;
 h:=public.nexa_staff_hub_v2(p_token,coalesce(nullif(p_state_number,0),st));
 if not coalesce((h->>'ok')::boolean,false) then return h; end if;
 select coalesce(jsonb_agg(c || jsonb_build_object('state_number',h->'state_number','access_level',case when coalesce((h->>'global_owner')::boolean,false) or coalesce((h->'manage_modules'->>(c->>'module'))::boolean,false) then 'admin' else 'regular' end,'is_owner',h->'global_owner')),'[]') into mods
 from jsonb_array_elements(h->'cards') c where (c->>'module') in ('transfer','ministry') and (c->>'enabled')::boolean;
 select coalesce(jsonb_agg(c || jsonb_build_object('state_number',h->'state_number','is_manager',coalesce((h->'manage_modules'->>'transfer')::boolean,false),'is_owner',h->'global_owner')),'[]') into ws
 from jsonb_array_elements(h->'cards') c where c->>'module'='transfer' and (c->>'enabled')::boolean;
 return h || jsonb_build_object('modules',mods,'workspaces',ws);
end $$;


create or replace function public.transfer_staff_account_from_token(p_token text) returns uuid
language sql stable security definer set search_path=public,extensions,pg_temp as $$
 select case when s.active_player_account_id is null then s.account_id
 when pa.player_id=sa.game_id or exists(select 1 from public.nexa_account_identity_links l join public.nexa_account_identities i on i.id=l.identity_id where l.account_id=s.account_id and i.auth_user_id=pa.user_id) then ctx.id else null end
 from public.transfer_staff_sessions s join public.transfer_staff_accounts sa on sa.id=s.account_id left join public.player_accounts pa on pa.id=s.active_player_account_id
 left join lateral(select a.id from public.transfer_staff_accounts a where a.game_id=pa.player_id order by a.created_at limit 1) ctx on true
 where s.token_hash=encode(digest(coalesce(p_token,''),'sha256'),'hex') and s.expires_at>now() order by s.created_at desc limit 1
$$;
CREATE OR REPLACE FUNCTION public.nexa_staff_login_v2(p_state_number integer, p_game_id text, p_password text, p_remember boolean DEFAULT true)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions', 'pg_temp'
AS $function$
declare
 a public.transfer_staff_accounts%rowtype;
 tok text;
 has_access boolean:=false;
 has_home boolean:=false;
 individual_ok boolean:=false;
 global_ok boolean:=false;
 v_identity uuid;
 v_player uuid;
begin
 p_game_id:=btrim(coalesce(p_game_id,''));
 if p_state_number is null or p_state_number<1 or p_game_id !~ '^[0-9]{4,24}$' then return jsonb_build_object('ok',false,'error','invalid_credentials'); end if;
 select * into a from public.transfer_staff_accounts where game_id=p_game_id order by created_at limit 1;
 if a.id is null then return jsonb_build_object('ok',false,'error','invalid_credentials'); end if;
 individual_ok:=a.password_hash=crypt(coalesce(p_password,''),a.password_hash);
 select identity_id into v_identity from public.nexa_account_identity_links where account_id=a.id limit 1;
 if v_identity is null then
   select i.id into v_identity
   from public.player_accounts p
   join public.nexa_account_identities i on i.auth_user_id=p.user_id
   where p.player_id=a.game_id
   limit 1;
 end if;
 if v_identity is not null then
   select exists(select 1 from public.nexa_identity_auth_settings s where s.identity_id=v_identity and s.global_password_enabled and s.global_password_hash=crypt(coalesce(p_password,''),s.global_password_hash)) into global_ok;
 end if;
 if not individual_ok and not global_ok then return jsonb_build_object('ok',false,'error','invalid_credentials'); end if;

 select exists(select 1 from public.player_accounts p where p.player_id=a.game_id and p.state_number=p_state_number) into has_home;
 select id into v_player from public.player_accounts p where p.player_id=a.game_id and p.state_number=p_state_number limit 1;

 select (
 exists(select 1 from public.transfer_staff_access t join public.transfer_workspaces w on w.id=t.workspace_id where t.account_id=a.id and t.status='active' and w.is_active and w.state_number=p_state_number)
 or exists(select 1 from public.ministry_staff_access_v2 t join public.ministry_workspaces_v2 w on w.id=t.workspace_id where t.account_id=a.id and t.status='active' and w.is_active and w.state_number=p_state_number)
 or exists(select 1 from public.gift_staff_access g where g.staff_account_id=a.id and g.is_active and g.state_number=p_state_number)
 or exists(select 1 from public.nexa_wos_alliance_access w where w.game_id=a.game_id and w.status='active' and w.state_number=p_state_number)
 or exists(select 1 from public.nexa_event_staff_permissions_v1 e where e.staff_account_id=a.id and e.state_number=p_state_number and e.status='active')
 ) into has_access;
 if not has_access and not has_home then return jsonb_build_object('ok',false,'error','no_active_workspace_for_state'); end if;

 tok:=encode(gen_random_bytes(32),'hex');
 insert into public.transfer_staff_sessions(account_id,token_hash,expires_at,active_player_account_id,active_state_number)
 values(a.id,encode(digest(tok,'sha256'),'hex'),now()+case when p_remember then interval '30 days' else interval '12 hours' end,v_player,p_state_number);
 return jsonb_build_object('ok',true,'token',tok,'game_name',a.game_name,'game_id',a.game_id,'state_number',p_state_number,'player_account_id',v_player,'used_global_password',global_ok and not individual_ok);
end
$function$
;
-- Quick Operations storage. No direct browser table access; every RPC validates staff tokens.
create table if not exists public.nexa_quick_transfer_v1 (
 state_number integer primary key check(state_number>0), revision integer not null default 0,
 document jsonb not null default '{"ordinary":0,"special":0,"allocations":[],"applicants":[]}', updated_at timestamptz not null default now());
create table if not exists public.nexa_quick_members_v1 (
 state_number integer not null, game_id text not null check(game_id ~ '^[0-9]{4,24}$'),
 alliance_id bigint not null references public.alliances(id), profile jsonb not null default '{}',
 revision integer not null default 1, updated_at timestamptz not null default now(), primary key(state_number,game_id));
create table if not exists public.nexa_quick_forms_v1 (
 id uuid primary key default gen_random_uuid(),session_id uuid not null references public.nexa_quick_event_sessions_v1(id),
 version integer not null, definition jsonb not null, created_at timestamptz not null default now(), unique(session_id,version));
create table if not exists public.nexa_quick_registrations_v1 (
 id uuid primary key default gen_random_uuid(),session_id uuid not null references public.nexa_quick_event_sessions_v1(id),
 form_id uuid not null references public.nexa_quick_forms_v1(id),game_id text not null,
 answers jsonb not null, receipt_hash text not null unique, created_at timestamptz not null default now(),updated_at timestamptz not null default now(), unique(session_id,game_id));
create table if not exists public.nexa_quick_tickets_v1 (
 token_hash text primary key,session_id uuid not null references public.nexa_quick_event_sessions_v1(id),
 form_id uuid not null references public.nexa_quick_forms_v1(id), registration_id uuid references public.nexa_quick_registrations_v1(id),
 started_at timestamptz not null default now(),expires_at timestamptz not null,used_at timestamptz);
alter table public.nexa_quick_tickets_v1 add column if not exists source_registration_id uuid references public.nexa_quick_registrations_v1(id);
create table if not exists public.nexa_quick_audit_v1 (
 id bigint generated always as identity primary key, actor uuid, state_number integer,
 action text not null,details jsonb not null default '{}',created_at timestamptz not null default now());
-- Staff alliance is a single global profile, using the established bigint alliance key.
-- WOS uses UUID gift-alliance keys, mapped only by exact state/tag after an explicit selection.
create or replace function public.nexa_quick_context_v1(p_token text,p_state integer) returns jsonb
language plpgsql stable security definer set search_path=public,extensions,pg_temp as $$
declare h jsonb; a uuid; al bigint; ev boolean; adm boolean;
begin
 h:=public.nexa_staff_hub_v2(p_token,p_state);
 if not coalesce((h->>'ok')::boolean,false) then raise exception 'session_expired' using errcode='28000'; end if;
 p_state:=(h->>'state_number')::int;
 a:=coalesce(public.transfer_staff_account_from_token(p_token),(select account_id from public.nexa_workspace_access_actor_v1(p_token) where is_global_owner limit 1));
 select alliance_id into al from public.nexa_staff_profiles_v1 where staff_account_id=a and state_number=p_state;
 select coalesce(bool_or(status='active'),false),coalesce(bool_or(status='active' and access_level='admin'),false) into ev,adm
 from public.nexa_event_staff_permissions_v1 where staff_account_id=a and state_number=p_state;
 return h||jsonb_build_object('staff_account_id',a,'alliance_id',al,'event_access',ev or (h->>'global_owner')::boolean,'event_admin',adm or (h->>'global_owner')::boolean);
end $$;
create or replace function public.nexa_quick_rpc_v1(p_token text,p_state integer,p_action text,p_payload jsonb default '{}') returns jsonb
language plpgsql security definer set search_path=public,extensions,pg_temp as $$
declare c jsonb; own boolean; canevent boolean; admin boolean; a uuid; al bigint; v_id uuid; sid uuid; rr record; item jsonb; d jsonb; rev integer; k text; n integer; old jsonb; f jsonb;
begin
 c:=public.nexa_quick_context_v1(p_token,p_state); own:=(c->>'global_owner')::boolean; canevent:=(c->>'event_access')::boolean; admin:=(c->>'event_admin')::boolean;
 a:=(c->>'staff_account_id')::uuid;al:=(c->>'alliance_id')::bigint;
 if p_action='bootstrap' then
 return c||jsonb_build_object('alliances',coalesce((select jsonb_agg(jsonb_build_object('id',x.id,'tag',x.tag,'name',x.name) order by tag) from public.alliances x where state_number=p_state and is_active),'[]'));
 end if;
 if p_action in ('transfer_get','transfer_save') then
 if not exists(select 1 from jsonb_array_elements(c->'cards') x where x->>'module'='transfer' and (x->>'enabled')::boolean) then raise exception 'forbidden'; end if;
 if p_action='transfer_save' then
 d:=p_payload->'document';
 if jsonb_typeof(d->'applicants')<>'array' or jsonb_array_length(d->'applicants')>2000 or jsonb_typeof(d->'allocations')<>'array' then raise exception 'invalid_transfer_document'; end if;
 if coalesce((d->>'ordinary')::int,-1)<0 or coalesce((d->>'special')::int,-1)<0 then raise exception 'invalid_totals'; end if;
 if exists(select 1 from jsonb_array_elements(d->'applicants') x where coalesce(x->>'game_id','') !~ '^[0-9]{4,24}$' or nullif(trim(x->>'game_name'),'') is null or coalesce(x->>'status','') not in ('approved','waiting','pending','transferred') or coalesce(x->>'kind','') not in ('ordinary','special')) then raise exception 'invalid_applicant'; end if;
 if (select count(*) from jsonb_array_elements(d->'applicants'))<>(select count(distinct x->>'game_id') from jsonb_array_elements(d->'applicants') x) then raise exception 'duplicate_game_id'; end if;
 insert into public.nexa_quick_transfer_v1(state_number) values(p_state) on conflict do nothing;
 select document,revision into old,rev from public.nexa_quick_transfer_v1 where state_number=p_state for update;
 if rev<>(p_payload->>'revision')::int then raise exception 'conflict_reload_before_saving'; end if;
 -- Never allow an approved failure to jump ahead of the established waiting queue.
 select coalesce(max((x->>'priority')::bigint),0)::integer into n from jsonb_array_elements(old->'applicants') x where x->>'status'='waiting';
 f:='[]';
 for item in select value from jsonb_array_elements(d->'applicants') loop
 if item->>'status'='waiting' and exists(select 1 from jsonb_array_elements(old->'applicants') x where x->>'game_id'=item->>'game_id' and x->>'status'='approved') then
 n:=n+1;item:=item||jsonb_build_object('priority',n);
 end if; f:=f||jsonb_build_array(item);
 end loop;
 d:=jsonb_set(d,'{applicants}',f);
 update public.nexa_quick_transfer_v1 set document=d,revision=revision+1,updated_at=now() where state_number=p_state;
 end if;
 return jsonb_build_object('ok',true,'record',coalesce((select to_jsonb(t) from public.nexa_quick_transfer_v1 t where state_number=p_state),jsonb_build_object('revision',0,'document',jsonb_build_object('ordinary',0,'special',0,'allocations','[]'::jsonb,'applicants','[]'::jsonb))));
 end if;
 if p_action in ('members_get','member_save') then
 -- Event admin alone does not confer access to private profiles.
 if not own and (al is null or not canevent) then raise exception 'assigned_alliance_and_event_access_required'; end if;
 if p_action='member_save' then
 if jsonb_typeof(p_payload->'profile')<>'object' or nullif(trim(p_payload->'profile'->>'game_name'),'') is null then raise exception 'game_name_required';end if;
 if own then al:=(p_payload->>'alliance_id')::bigint; elsif (p_payload->>'alliance_id')::bigint is distinct from al then raise exception 'alliance_scope_forbidden'; end if;
 if not exists(select 1 from public.alliances where id=al and state_number=p_state and is_active) then raise exception 'invalid_alliance';end if;
 perform pg_advisory_xact_lock(hashtext('quick_member:'||p_state||':'||(p_payload->>'game_id')));
 select * into rr from public.nexa_quick_members_v1 where state_number=p_state and game_id=p_payload->>'game_id' for update;
 if rr.game_id is not null and not own and rr.alliance_id<>al then raise exception 'alliance_scope_forbidden'; end if;
 if coalesce(rr.revision,0)<>coalesce((p_payload->>'revision')::int,0) then raise exception 'conflict_reload_before_saving'; end if;
 insert into public.nexa_quick_members_v1(state_number,game_id,alliance_id,profile) values(p_state,p_payload->>'game_id',al,p_payload->'profile')
 on conflict(state_number,game_id) do update set alliance_id=excluded.alliance_id,profile=excluded.profile,revision=nexa_quick_members_v1.revision+1,updated_at=now();
 end if;
 return jsonb_build_object('ok',true,'members',coalesce((select jsonb_agg(to_jsonb(m) order by m.profile->>'game_name') from public.nexa_quick_members_v1 m where state_number=p_state and (own or alliance_id=al)),'[]'));
 end if;
 if not canevent then raise exception 'event_access_required'; end if;
 if p_action='sessions_get' then
 return jsonb_build_object('ok',true,'sessions',coalesce((select jsonb_agg(to_jsonb(s) order by created_at desc) from public.nexa_quick_event_sessions_v1 s where state_number=p_state),'[]'));
 elsif p_action='session_save' then
 if not admin then raise exception 'event_admin_required'; end if;
 sid:=coalesce(nullif(p_payload->>'id','')::uuid,gen_random_uuid());
 if exists(select 1 from public.nexa_quick_event_sessions_v1 where id=sid and state_number<>p_state) then raise exception 'state_scope_forbidden'; end if;
 if nullif(p_payload->>'opens_at','')::timestamptz>=nullif(p_payload->>'closes_at','')::timestamptz then raise exception 'close_must_follow_open';end if;
 if p_payload->>'event_type' not in ('fdt','foundry','svs','custom') or nullif(trim(p_payload->>'event_name'),'') is null then raise exception 'invalid_session'; end if;
 select to_jsonb(s) into old from public.nexa_quick_event_sessions_v1 s where id=sid for update;
 d:=coalesce(old->'settings','{}')||coalesce(p_payload->'settings','{}');
 if old is not null and old->>'event_type'<>p_payload->>'event_type' and exists(select 1 from public.nexa_quick_rosters_v1 where session_id=sid) then raise exception 'event_type_locked_after_rosters_created';end if;
 if p_payload->>'status'='closed' and coalesce(old->>'status','')<>'closed' then d:=d||jsonb_build_object('closed_at',now()); end if;
 if p_payload->>'status'='open' then d:=d-'closed_at'; end if;
 if coalesce((d->>'grace_minutes')::int,10) not between 0 and 30 then raise exception 'grace_must_be_0_to_30_minutes'; end if;
 insert into public.nexa_quick_event_sessions_v1(id,state_number,event_type,event_name,opens_at,closes_at,status,settings)
 values(sid,p_state,p_payload->>'event_type',p_payload->>'event_name',nullif(p_payload->>'opens_at','')::timestamptz,nullif(p_payload->>'closes_at','')::timestamptz,p_payload->>'status',d)
 on conflict(id) do update set event_type=excluded.event_type,event_name=excluded.event_name,opens_at=excluded.opens_at,closes_at=excluded.closes_at,status=excluded.status,settings=excluded.settings,updated_at=now();
 return jsonb_build_object('ok',true,'id',sid);
 end if;
 sid:=(p_payload->>'session_id')::uuid;
 if not exists(select 1 from public.nexa_quick_event_sessions_v1 where id=sid and state_number=p_state) then raise exception 'session_not_found'; end if;
 if p_action='rosters_get' then
 return jsonb_build_object('ok',true,'rosters',coalesce((select jsonb_agg(to_jsonb(r)||jsonb_build_object('members',coalesce((select jsonb_agg(to_jsonb(m) order by source_alliance_tag,placement_order) from public.nexa_quick_roster_members_v1 m where roster_id=r.id),'[]')) order by sort_order,created_at) from public.nexa_quick_rosters_v1 r where session_id=sid),'[]'));
 elsif p_action='roster_save' then
 v_id:=coalesce(nullif(p_payload->>'id','')::uuid,gen_random_uuid());
 perform 1 from public.nexa_quick_event_sessions_v1 where id=sid for update;
 if exists(select 1 from public.nexa_quick_rosters_v1 r where r.id=(p_payload->>'id')::uuid and r.session_id<>sid) then raise exception 'session_scope_forbidden';end if;
 select event_type into k from public.nexa_quick_event_sessions_v1 where id=sid;
 if k='fdt' and (nullif(trim(p_payload->>'host_alliance_tag'),'') is null or (p_payload->>'capacity')::int>60) then raise exception 'fdt_host_alliance_and_max_60_required';end if;
 if k='foundry' and p_payload->>'label' not in ('Legion 1','Legion 2') then raise exception 'foundry_legion_required';end if;
 if exists(select 1 from jsonb_array_elements(p_payload->'members') x join public.nexa_quick_roster_members_v1 m on m.game_id=x->>'game_id' join public.nexa_quick_rosters_v1 r on r.id=m.roster_id where r.session_id=sid and r.id<>v_id) then raise exception 'player_already_in_another_group';end if;
 if jsonb_array_length(p_payload->'members')>(p_payload->>'capacity')::int then raise exception 'roster_capacity_exceeded';end if;
 if exists(select 1 from jsonb_array_elements(p_payload->'members') x where nullif(trim(x->>'game_name'),'') is null) then raise exception 'game_name_required';end if;
 insert into public.nexa_quick_rosters_v1(id,session_id,roster_kind,label,host_alliance_tag,theme_color,capacity,sort_order)
 values(v_id,sid,case k when 'fdt' then 'fdt_alliance' when 'foundry' then 'foundry_legion' else 'other' end,case when k='fdt' then p_payload->>'host_alliance_tag' else p_payload->>'label' end,p_payload->>'host_alliance_tag',p_payload->>'theme_color',(p_payload->>'capacity')::int,coalesce((p_payload->>'sort_order')::int,0))
 on conflict(id) do update set label=excluded.label,host_alliance_tag=excluded.host_alliance_tag,theme_color=excluded.theme_color,capacity=excluded.capacity,updated_at=now();
 delete from public.nexa_quick_roster_members_v1 m where m.roster_id=v_id;
 n:=0;for item in select value from jsonb_array_elements(p_payload->'members') loop
 n:=n+1;
 insert into public.nexa_quick_roster_members_v1(id,roster_id,game_id,game_name,source_alliance_tag,placement_order,attributes)
 values(gen_random_uuid(),v_id,item->>'game_id',item->>'game_name',item->>'source_alliance_tag',n,coalesce(item->'attributes','{}'));
 end loop;
 return jsonb_build_object('ok',true,'id',v_id);
 elsif p_action='forms_get' then
 return jsonb_build_object('ok',true,'forms',coalesce((select jsonb_agg(to_jsonb(frm) order by version desc) from public.nexa_quick_forms_v1 frm where session_id=sid),'[]'));
 elsif p_action='form_save' then
 if not admin then raise exception 'event_admin_required'; end if;
 d:=p_payload->'definition';
 if jsonb_typeof(d->'questions')<>'array' or jsonb_array_length(d->'questions')>100 then raise exception 'invalid_form';end if;
 for item in select value from jsonb_array_elements(d->'questions') loop
 if item->>'type' not in ('short','long','number','dropdown','multiple','checkbox','yesno') or coalesce(item->>'id','')!~'^[a-zA-Z][a-zA-Z0-9_]{0,59}$' or nullif(trim(item->>'label'),'') is null or coalesce(item->>'target','all') not in ('all','J','RL') then raise exception 'invalid_question';end if;
 end loop;
 if (select count(*) from jsonb_array_elements(d->'questions'))<>(select count(distinct x->>'id') from jsonb_array_elements(d->'questions') x) then raise exception 'duplicate_question_id';end if;
 perform 1 from public.nexa_quick_event_sessions_v1 where id=sid for update;
 select coalesce(max(version),0)+1 into n from public.nexa_quick_forms_v1 where session_id=sid;
 insert into public.nexa_quick_forms_v1(session_id,version,definition) values(sid,n,d) returning nexa_quick_forms_v1.id into v_id;
 return jsonb_build_object('ok',true,'id',v_id,'version',n);
 elsif p_action='registrations_get' then
 return jsonb_build_object('ok',true,'registrations',coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'game_id',r.game_id,'answers',r.answers,'created_at',r.created_at,'updated_at',r.updated_at) order by r.created_at) from public.nexa_quick_registrations_v1 r where session_id=sid),'[]'));
 end if;
 raise exception 'unknown_action';
end $$;
-- Public forms have no Game ID lookup. A random receipt is needed to update a submission.
create or replace function public.nexa_quick_public_v1(p_action text,p_session_id uuid,p_payload jsonb default '{}') returns jsonb
language plpgsql security definer set search_path=public,extensions,pg_temp as $$
declare s public.nexa_quick_event_sessions_v1%rowtype; f public.nexa_quick_forms_v1%rowtype;
 t public.nexa_quick_tickets_v1%rowtype;r public.nexa_quick_registrations_v1%rowtype;
 secret text;receipt text;ans jsonb;q jsonb;val jsonb;boundary timestamptz;sections jsonb;section text;rol text;
begin
 select * into s from public.nexa_quick_event_sessions_v1 where id=p_session_id for share;
 if s.id is null then raise exception 'form_not_found';end if;
 if p_action='begin' then
 if s.status<>'open' or (s.opens_at is not null and now()<s.opens_at) or (s.closes_at is not null and now()>=s.closes_at) then raise exception 'registration_closed';end if;
 select * into f from public.nexa_quick_forms_v1 where session_id=s.id order by version desc limit 1;
 if f.id is null then raise exception 'no_published_form';end if;
 if nullif(p_payload->>'receipt','') is not null then
 select rr.* into r from public.nexa_quick_registrations_v1 rr join public.nexa_quick_event_sessions_v1 ss on ss.id=rr.session_id where ss.state_number=s.state_number and rr.receipt_hash=encode(digest(p_payload->>'receipt','sha256'),'hex');
 if r.id is null then raise exception 'invalid_receipt';end if;
 end if;
 secret:=encode(gen_random_bytes(32),'hex');
 insert into public.nexa_quick_tickets_v1(token_hash,session_id,form_id,registration_id,source_registration_id,expires_at)
 values(encode(digest(secret,'sha256'),'hex'),s.id,f.id,case when r.session_id=s.id then r.id end,r.id,now()+interval '2 hours');
 return jsonb_build_object('ok',true,'ticket',secret,'form',f.definition,'version',f.version,'event_name',s.event_name,'returning',r.id is not null,'answers',coalesce(r.answers,'{}'));
 elsif p_action='submit' then
 select * into t from public.nexa_quick_tickets_v1 where token_hash=encode(digest(coalesce(p_payload->>'ticket',''),'sha256'),'hex') and session_id=s.id for update;
 if t.token_hash is null or t.used_at is not null or now()>t.expires_at then raise exception 'ticket_invalid_or_expired';end if;
 if s.status in ('draft','archived') then raise exception 'registration_closed';end if;
 boundary:=least(s.closes_at,nullif(s.settings->>'closed_at','')::timestamptz);
 if (s.status='closed' or (boundary is not null and now()>=boundary)) and
 (boundary is null or t.started_at>boundary or now()>boundary+make_interval(mins=>least(30,greatest(0,coalesce((s.settings->>'grace_minutes')::int,10))))) then raise exception 'registration_closed';end if;
 select * into f from public.nexa_quick_forms_v1 where id=t.form_id;
 ans:=p_payload->'answers';
 if jsonb_typeof(ans)<>'object' or octet_length(ans::text)>65536 then raise exception 'invalid_answers';end if;
 if coalesce(t.registration_id,t.source_registration_id) is not null then
 select * into r from public.nexa_quick_registrations_v1 where id=coalesce(t.registration_id,t.source_registration_id) for update;
 sections:=p_payload->'update_sections';
 if jsonb_typeof(sections)<>'array' then raise exception 'select_update_sections';end if;
 -- Keep every unselected profile section and immutable identity intact.
 for q in select value from jsonb_array_elements(f.definition->'questions') loop
 section:=coalesce(q->>'section','Profile');
 if not (sections ? section) or q->>'id'='game_id' then
 ans:=jsonb_set(ans,array[q->>'id'],coalesce(r.answers->(q->>'id'),'null'::jsonb));
 end if;
 end loop;
 ans:=jsonb_set(ans,'{game_id}',to_jsonb(r.game_id));
 end if;
 if coalesce(ans->>'game_id','')!~'^[0-9]{4,24}$' or nullif(trim(ans->>'game_name'),'') is null or coalesce(ans->>'role','') not in ('J','RL') then raise exception 'identity_name_and_role_required';end if;
 rol:=ans->>'role';
 for q in select value from jsonb_array_elements(f.definition->'questions') loop
 val:=ans->(q->>'id');
 if coalesce((q->>'visible')::boolean,true)=false or (coalesce(q->>'target','all') not in ('all',rol)) then ans:=ans-(q->>'id');continue;end if;
 if coalesce((q->>'required')::boolean,false) and (val is null or val='null'::jsonb or val='""'::jsonb or val='[]'::jsonb) then raise exception 'required_question: %',q->>'label';end if;
 if val is null or val='null'::jsonb or val='""'::jsonb then continue;end if;
 if q->>'type'='number' and coalesce(ans->>(q->>'id'),'')!~'^[0-9]+(\.[0-9]+)?$' then raise exception 'invalid_number: %',q->>'label';end if;
 if q->>'type'='yesno' and ans->>(q->>'id') not in ('Yes','No') then raise exception 'invalid_yesno';end if;
 if q->>'type' in ('dropdown','multiple') and not coalesce(q->'options','[]') ? (ans->>(q->>'id')) then raise exception 'invalid_option: %',q->>'label';end if;
 if q->>'type'='checkbox' and (jsonb_typeof(val)<>'array' or not (coalesce(q->'options','[]') @> val)) then raise exception 'invalid_checkbox';end if;
 end loop;
 -- Whitelist only published questions plus the three immutable required core fields.
 select coalesce(jsonb_object_agg(key,value),'{}') into ans from jsonb_each(ans) where key in ('game_id','game_name','role') or key in (select x->>'id' from jsonb_array_elements(f.definition->'questions') x);
 receipt:=encode(gen_random_bytes(32),'hex');
 if t.registration_id is null then
 if exists(select 1 from public.nexa_quick_registrations_v1 where session_id=s.id and game_id=ans->>'game_id') then raise exception 'already_registered_receipt_required';end if;
 insert into public.nexa_quick_registrations_v1(session_id,form_id,game_id,answers,receipt_hash) values(s.id,f.id,ans->>'game_id',ans,encode(digest(receipt,'sha256'),'hex'));
 else
 update public.nexa_quick_registrations_v1 set form_id=f.id,answers=ans,receipt_hash=encode(digest(receipt,'sha256'),'hex'),updated_at=now() where id=r.id;
 end if;
 update public.nexa_quick_tickets_v1 set used_at=now() where token_hash=t.token_hash;
 return jsonb_build_object('ok',true,'receipt',receipt);
 end if;
 raise exception 'unknown_action';
end $$;
create table if not exists public.nexa_quick_pending_staff_v1 (
 game_id text not null, state_number integer not null, alliance_id bigint references public.alliances(id), modules jsonb not null,
 created_at timestamptz not null default now(),primary key(game_id,state_number));
alter table public.nexa_quick_pending_staff_v1 add column if not exists removals jsonb not null default '{}';
create or replace function public.nexa_quick_staff_v1(p_token text,p_state integer,p_action text,p_payload jsonb default '{}') returns jsonb
language plpgsql security definer set search_path=public,extensions,pg_temp as $$
declare c jsonb; own boolean; actor uuid; target uuid; gid text; al bigint; giftid uuid; tw uuid; mw uuid;
 mm jsonb; mods jsonb; item jsonb; k text; lev text; enabled boolean; rows jsonb; old jsonb; snap jsonb; pending jsonb; pr public.nexa_quick_pending_staff_v1%rowtype; q public.nexa_staff_removal_queue_v1%rowtype;
begin
 c:=public.nexa_quick_context_v1(p_token,p_state);own:=(c->>'global_owner')::boolean;actor:=(c->>'staff_account_id')::uuid;
 mm:=c->'manage_modules'||jsonb_build_object('event',(c->>'event_admin')::boolean);
 if not own and not exists(select 1 from jsonb_each(mm) where value='true') then raise exception 'admin_required';end if;
 select id into tw from public.transfer_workspaces where state_number=p_state and is_active order by created_at limit 1;
 select id into mw from public.ministry_workspaces_v2 where state_number=p_state and is_active order by created_at limit 1;
 if p_action='directory' then
 select coalesce(jsonb_agg(jsonb_build_object('game_id',a.game_id,'game_name',a.game_name,'registered',true,'is_self',a.id=actor,
 'global_owner',exists(select 1 from public.player_accounts p join public.user_roles u on u.user_id=p.user_id where p.player_id=a.game_id and lower(u.role)='owner') or exists(select 1 from public.transfer_staff_access where account_id=a.id and is_owner) or exists(select 1 from public.ministry_staff_access_v2 where account_id=a.id and is_owner),
 'alliance_id',sp.alliance_id,
 'transfer',(select jsonb_build_object('enabled',status='active','level',case when is_manager or is_owner then 'admin' else 'regular' end) from public.transfer_staff_access where account_id=a.id and workspace_id=tw limit 1),
 'ministry',(select jsonb_build_object('enabled',status='active','level',case when is_owner then 'admin' else access_level end) from public.ministry_staff_access_v2 where account_id=a.id and workspace_id=mw limit 1),
 'wos',(select jsonb_build_object('enabled',status='active','level',access_level) from public.nexa_wos_alliance_access where game_id=a.game_id and state_number=p_state order by updated_at desc limit 1),
 'event',(select jsonb_build_object('enabled',status='active','level',access_level) from public.nexa_event_staff_permissions_v1 where staff_account_id=a.id and state_number=p_state),
 'removals',coalesce((select jsonb_agg(jsonb_build_object('id',id,'scope',scope,'delete_after',delete_after)) from public.nexa_staff_removal_queue_v1 where staff_account_id=a.id and state_number=p_state and status='pending' and delete_after>now()),'[]')) order by a.game_name),'[]') into rows
 from public.transfer_staff_accounts a left join public.nexa_staff_profiles_v1 sp on sp.staff_account_id=a.id
 where a.id=actor or exists(select 1 from public.transfer_staff_access where account_id=a.id and workspace_id=tw) or exists(select 1 from public.ministry_staff_access_v2 where account_id=a.id and workspace_id=mw)
 or exists(select 1 from public.nexa_wos_alliance_access where game_id=a.game_id and state_number=p_state) or exists(select 1 from public.nexa_event_staff_permissions_v1 where staff_account_id=a.id and state_number=p_state);
 select coalesce(jsonb_agg(jsonb_build_object('game_id',game_id,'game_name',game_id,'registered',false,'alliance_id',alliance_id,'removals',coalesce((select jsonb_agg(jsonb_build_object('scope',key,'delete_after',value->>'delete_after')) from jsonb_each(removals) where (value->>'delete_after')::timestamptz>now()),'[]'))||modules),'[]') into pending from public.nexa_quick_pending_staff_v1 where state_number=p_state;
 return jsonb_build_object('ok',true,'people',rows||pending,'manage_modules',mm,'alliances',coalesce((select jsonb_agg(jsonb_build_object('id',id,'tag',tag,'name',name) order by tag) from public.alliances where state_number=p_state and is_active),'[]'));
 end if;
 gid:=p_payload->>'game_id';
 select id into target from public.transfer_staff_accounts where game_id=gid;
 if gid !~'^[0-9]{4,24}$' then raise exception 'invalid_game_id';end if;
 if target=actor or gid=c->>'game_id' then raise exception 'self_access_changes_forbidden';end if;
 if exists(select 1 from public.nexa_account_identity_links l1 join public.nexa_account_identity_links l2 on l2.identity_id=l1.identity_id where l1.account_id=actor and l2.account_id=target) or exists(select 1 from public.player_accounts p1 join public.player_accounts p2 on p2.user_id=p1.user_id where p1.player_id=c->>'game_id' and p2.player_id=gid) then raise exception 'self_linked_identity_changes_forbidden';end if;
 if exists(select 1 from public.transfer_staff_sessions ss where ss.account_id=target and ss.developer_user_id is not null and (exists(select 1 from public.user_roles u where u.user_id=ss.developer_user_id and lower(u.role)='owner') or exists(select 1 from public.nexa_platform_roles platform_owner where platform_owner.user_id=ss.developer_user_id and (platform_owner.is_platform_owner or platform_owner.developer_mode_allowed)))) then raise exception 'owner_protected';end if;
 if exists(select 1 from public.player_accounts p join public.user_roles u on u.user_id=p.user_id where p.player_id=gid and lower(u.role)='owner')
 or exists(select 1 from public.transfer_staff_access where account_id=target and is_owner)
 or exists(select 1 from public.ministry_staff_access_v2 where account_id=target and is_owner) then raise exception 'owner_protected';end if;
 perform pg_advisory_xact_lock(hashtext('quick_staff:'||gid));
 if p_action='save' then
 al:=(p_payload->>'alliance_id')::bigint;
 if not exists(select 1 from public.alliances where id=al and state_number=p_state and is_active) then raise exception 'alliance_required';end if;
 -- Global profile changes can affect every workspace: only owner, or first assignment.
 if target is not null and not own and exists(select 1 from public.nexa_staff_profiles_v1 where staff_account_id=target and (alliance_id is distinct from al or state_number<>p_state)) then raise exception 'global_profile_change_requires_owner';end if;
 mods:=p_payload->'modules';
 if jsonb_typeof(mods)<>'object' then raise exception 'invalid_modules';end if;
 for k,item in select key,value from jsonb_each(mods) loop
 if k not in ('transfer','ministry','wos','event') or not coalesce((mm->>k)::boolean,false) then raise exception 'module_scope_forbidden: %',k;end if;
 if coalesce(item->>'level','') not in ('regular','admin') or coalesce(jsonb_typeof(item->'enabled'),'')<>'boolean' then raise exception 'invalid_access_level';end if;
 if exists(select 1 from public.nexa_staff_removal_queue_v1 where staff_account_id=target and state_number=p_state and scope=k and status='pending') then raise exception 'restore_or_finalize_pending_removal_first';end if;
 end loop;
 if target is null then
 select * into pr from public.nexa_quick_pending_staff_v1 where game_id=gid and state_number=p_state;
 if not own and pr.alliance_id is not null and pr.alliance_id<>al then raise exception 'global_profile_change_requires_owner';end if;
 if exists(select 1 from jsonb_object_keys(mods) key where pr.removals ? key) then raise exception 'restore_or_finalize_pending_removal_first';end if;
 old:=pr.modules;
 insert into public.nexa_quick_pending_staff_v1(game_id,state_number,alliance_id,modules) values(gid,p_state,al,coalesce(old,'{}')||mods)
 on conflict(game_id,state_number) do update set alliance_id=excluded.alliance_id,modules=excluded.modules;
 return jsonb_build_object('ok',true,'pending',true);
 end if;
 insert into public.nexa_staff_profiles_v1(staff_account_id,alliance_id,state_number) values(target,al,p_state)
 on conflict(staff_account_id) do update set alliance_id=excluded.alliance_id,state_number=excluded.state_number,updated_at=now();
 for k,item in select key,value from jsonb_each(mods) loop
 enabled:=(item->>'enabled')::boolean;lev:=item->>'level';
 if k='transfer' then
 if tw is null then raise exception 'transfer_workspace_missing';end if;
 if not enabled then perform public.nexa_quick_staff_v1(p_token,p_state,'remove',jsonb_build_object('game_id',gid,'scope',k));continue;end if;
 update public.transfer_staff_access set is_manager=lev='admin',status='active',disabled_at=null,updated_at=now() where account_id=target and workspace_id=tw and not is_owner;
 if not found then insert into public.transfer_staff_access(id,workspace_id,account_id,game_id,is_manager,is_owner,status,updated_at) values(gen_random_uuid(),tw,target,gid,lev='admin',false,'active',now());end if;
 elsif k='ministry' then
 if mw is null then raise exception 'ministry_workspace_missing';end if;
 if not enabled then perform public.nexa_quick_staff_v1(p_token,p_state,'remove',jsonb_build_object('game_id',gid,'scope',k));continue;end if;
 update public.ministry_staff_access_v2 set access_level=lev,status='active',disabled_at=null,updated_at=now() where account_id=target and workspace_id=mw and not is_owner;
 if not found then insert into public.ministry_staff_access_v2(id,workspace_id,account_id,game_id,access_level,is_owner,status,updated_at) values(gen_random_uuid(),mw,target,gid,lev,false,'active',now());end if;
 elsif k='wos' then
 if not enabled then perform public.nexa_quick_staff_v1(p_token,p_state,'remove',jsonb_build_object('game_id',gid,'scope',k));continue;end if;
 select g.id into giftid from public.gift_alliances g join public.alliances x on x.tag=g.tag and x.state_number=g.state_number where x.id=al and g.is_active and g.deleted_at is null;
 if giftid is null then raise exception 'selected_alliance_missing_wos_mapping';end if;
 if exists(select 1 from public.nexa_wos_alliance_access where game_id=gid and state_number<>p_state and status='active') then raise exception 'existing_wos_state_conflict_requires_explicit_review';end if;
 if exists(select 1 from public.nexa_wos_alliance_access where game_id=gid and state_number=p_state and alliance_id<>giftid and status='active') then raise exception 'existing_wos_alliance_conflict_requires_explicit_review';end if;
 update public.nexa_wos_alliance_access set access_level=lev,status='active',removed_at=null,updated_at=now() where game_id=gid and state_number=p_state and alliance_id=giftid;
 if not found then insert into public.nexa_wos_alliance_access(id,state_number,alliance_id,game_id,role,access_level,status,updated_at) values(gen_random_uuid(),p_state,giftid,gid,'r4',lev,'active',now());end if;
 insert into public.wos_utility_staff_access(id,game_id,staff_account_id,role,main_alliance_id,module_access,status,updated_at)
 values(gen_random_uuid(),gid,target,case when lev='admin' then 'administrative' else 'r4' end,giftid,'{"gift":true,"reminders":true}','active',now())
 on conflict(game_id) do update set staff_account_id=excluded.staff_account_id,role=excluded.role,main_alliance_id=excluded.main_alliance_id,module_access=coalesce(wos_utility_staff_access.module_access,'{}')||excluded.module_access,status='active',updated_at=now();
 -- The canonical in-game rank is preserved. The legacy permission record reflects the explicit administrative access level.

 elsif k='event' then
 if not enabled then perform public.nexa_quick_staff_v1(p_token,p_state,'remove',jsonb_build_object('game_id',gid,'scope',k));continue;end if;
 insert into public.nexa_event_staff_permissions_v1(staff_account_id,state_number,access_level,status) values(target,p_state,lev,'active')
 on conflict(staff_account_id,state_number) do update set access_level=excluded.access_level,status='active',updated_at=now();
 end if;
 end loop;
 elsif p_action in ('remove','restore') then
 if target is null then
 select * into pr from public.nexa_quick_pending_staff_v1 where game_id=gid and state_number=p_state for update;
 if pr.game_id is null then raise exception 'staff_not_found';end if;
 for k in select value #>> '{}' from jsonb_array_elements(case when p_payload->>'scope'='all' then '["transfer","ministry","wos","event"]'::jsonb else jsonb_build_array(p_payload->>'scope') end) loop
 if not coalesce((mm->>k)::boolean,false) then
 if p_payload->>'scope'='all' then continue;else raise exception 'module_scope_forbidden';end if;end if;
 if p_action='remove' and coalesce((pr.modules->k->>'enabled')::boolean,false) then
 pr.removals:=pr.removals||jsonb_build_object(k,jsonb_build_object('delete_after',now()+interval '7 days','snapshot',pr.modules->k));
 pr.modules:=jsonb_set(pr.modules,array[k,'enabled'],'false');
 elsif p_action='restore' and pr.removals ? k and (pr.removals->k->>'delete_after')::timestamptz>now() then
 pr.modules:=jsonb_set(pr.modules,array[k],pr.removals->k->'snapshot');pr.removals:=pr.removals-k;
 end if;
 end loop;
 update public.nexa_quick_pending_staff_v1 set modules=pr.modules,removals=pr.removals where game_id=gid and state_number=p_state;
 insert into public.nexa_quick_audit_v1(actor,state_number,action,details) values(actor,p_state,'pending_staff_'||p_action,jsonb_build_object('game_id',gid,'scope',p_payload->>'scope'));
 return jsonb_build_object('ok',true);
 end if;
 for k in select value #>> '{}' from jsonb_array_elements(case when p_payload->>'scope'='all' then '["transfer","ministry","wos","event"]'::jsonb else jsonb_build_array(p_payload->>'scope') end) loop
 if not coalesce((mm->>k)::boolean,false) then
 if p_payload->>'scope'='all' then continue;else raise exception 'module_scope_forbidden';end if;end if;
 if p_action='remove' then
 if exists(select 1 from public.nexa_staff_removal_queue_v1 where staff_account_id=target and state_number=p_state and scope=k and status='pending') then continue;end if;
 if k='transfer' then
 select coalesce(jsonb_agg(to_jsonb(x)),'[]') into snap from public.transfer_staff_access x where account_id=target and workspace_id=tw and status='active' and not is_owner;
 update public.transfer_staff_access set status='disabled',disabled_at=now(),updated_at=now() where account_id=target and workspace_id=tw and status='active' and not is_owner;
 elsif k='ministry' then
 select coalesce(jsonb_agg(to_jsonb(x)),'[]') into snap from public.ministry_staff_access_v2 x where account_id=target and workspace_id=mw and status='active' and not is_owner;
 update public.ministry_staff_access_v2 set status='disabled',disabled_at=now(),updated_at=now() where account_id=target and workspace_id=mw and status='active' and not is_owner;
 elsif k='wos' then
 if exists(select 1 from public.wos_utility_staff_access where game_id=gid and status='active' and main_alliance_id is null) and not exists(select 1 from public.nexa_staff_profiles_v1 where staff_account_id=target and state_number=p_state) then raise exception 'assign_global_alliance_before_removing_unscoped_wos_access';end if;
 select jsonb_build_object('wos',coalesce((select jsonb_agg(to_jsonb(x)) from public.nexa_wos_alliance_access x where game_id=gid and state_number=p_state and status='active'),'[]'),'gift',coalesce((select jsonb_agg(to_jsonb(x)) from public.gift_staff_access x where staff_account_id=target and state_number=p_state and is_active),'[]'),'legacy',coalesce((select jsonb_agg(to_jsonb(x)) from public.wos_utility_staff_access x left join public.gift_alliances ga on ga.id=x.main_alliance_id where x.game_id=gid and x.status='active' and (ga.state_number=p_state or (x.main_alliance_id is null and exists(select 1 from public.nexa_staff_profiles_v1 where staff_account_id=target and state_number=p_state)))),'[]')) into snap;
 update public.nexa_wos_alliance_access set status='removed',removed_at=now(),updated_at=now() where game_id=gid and state_number=p_state and status='active';
 update public.gift_staff_access set is_active=false,disabled_at=now() where staff_account_id=target and state_number=p_state and is_active;
 update public.wos_utility_staff_access l set status='removed',updated_at=now() where l.game_id=gid and l.status='active' and (exists(select 1 from public.gift_alliances ga where ga.id=l.main_alliance_id and ga.state_number=p_state) or (l.main_alliance_id is null and exists(select 1 from public.nexa_staff_profiles_v1 where staff_account_id=target and state_number=p_state)));
 elsif k='event' then
 select coalesce(jsonb_agg(to_jsonb(x)),'[]') into snap from public.nexa_event_staff_permissions_v1 x where staff_account_id=target and state_number=p_state and status='active';
 update public.nexa_event_staff_permissions_v1 set status='suspended',updated_at=now() where staff_account_id=target and state_number=p_state;
 else raise exception 'invalid_scope';end if;
 if snap='[]' or snap='{"wos":[],"gift":[],"legacy":[]}' then continue;end if;
 insert into public.nexa_staff_removal_queue_v1(id,staff_account_id,state_number,scope,status,snapshot,requested_by,requested_at,delete_after) values(gen_random_uuid(),target,p_state,k,'pending',snap,actor,now(),now()+interval '7 days');
 -- Permission checks are fresh on each request; revoke linked staff tokens as well.
 update public.transfer_staff_sessions set expires_at=least(expires_at,now()) where account_id=target or active_player_account_id in(select id from public.player_accounts where player_id=gid);
 else
 select * into q from public.nexa_staff_removal_queue_v1 where staff_account_id=target and state_number=p_state and scope=k and status='pending' and delete_after>now() order by requested_at desc limit 1 for update;
 if q.id is null then raise exception 'restore_window_expired_or_not_found';end if;
 if k='transfer' then update public.transfer_staff_access x set status='active',is_manager=(z->>'is_manager')::boolean,disabled_at=null,updated_at=now() from jsonb_array_elements(q.snapshot) z where x.id=(z->>'id')::uuid and not x.is_owner;
 elsif k='ministry' then update public.ministry_staff_access_v2 x set status='active',access_level=z->>'access_level',disabled_at=null,updated_at=now() from jsonb_array_elements(q.snapshot) z where x.id=(z->>'id')::uuid and not x.is_owner;
 elsif k='wos' then
 update public.nexa_wos_alliance_access x set status='active',access_level=z->>'access_level',removed_at=null,updated_at=now() from jsonb_array_elements(q.snapshot->'wos') z where x.id=(z->>'id')::uuid;
 update public.gift_staff_access x set is_active=true,disabled_at=null from jsonb_array_elements(q.snapshot->'gift') z where x.id=(z->>'id')::uuid;
 update public.wos_utility_staff_access x set status=z->>'status',role=z->>'role',main_alliance_id=(z->>'main_alliance_id')::uuid,module_access=z->'module_access',updated_at=now() from jsonb_array_elements(coalesce(q.snapshot->'legacy','[]')) z where x.id=(z->>'id')::uuid;
 elsif k='event' then update public.nexa_event_staff_permissions_v1 x set status='active',access_level=z->>'access_level',updated_at=now() from jsonb_array_elements(q.snapshot) z where x.staff_account_id=target and x.state_number=p_state;
 end if;
 update public.nexa_staff_removal_queue_v1 set status='restored',restored_at=now() where id=q.id;
 end if;
 end loop;
 else raise exception 'unknown_action';end if;
 insert into public.nexa_quick_audit_v1(actor,state_number,action,details) values(actor,p_state,'staff_'||p_action,jsonb_build_object('game_id',gid,'scope',p_payload->>'scope','modules',p_payload->'modules'));
 return jsonb_build_object('ok',true);
end $$;
-- Called only by a trusted database scheduler/service, never by browser roles.
create or replace function public.nexa_quick_finalize_removals_v1() returns integer
language plpgsql security definer set search_path=public,pg_temp as $$
declare q record; n integer:=0;gid text;pr record;k text;mods jsonb;rem jsonb;
begin
 for q in select * from public.nexa_staff_removal_queue_v1 where status='pending' and delete_after<=now() for update skip locked loop
 select game_id into gid from public.transfer_staff_accounts where id=q.staff_account_id;
 if exists(select 1 from public.player_accounts p join public.user_roles u on u.user_id=p.user_id where p.player_id=gid and lower(u.role)='owner') or exists(select 1 from public.transfer_staff_access where account_id=q.staff_account_id and is_owner) or exists(select 1 from public.ministry_staff_access_v2 where account_id=q.staff_account_id and is_owner) then continue;end if;
 -- Never delete accounts, identities, sessions, global profiles, or historical events.
 if q.scope='transfer' then delete from public.transfer_staff_access x using jsonb_array_elements(q.snapshot) z where x.id=(z->>'id')::uuid and x.status='disabled' and not x.is_owner;
 elsif q.scope='ministry' then delete from public.ministry_staff_access_v2 x using jsonb_array_elements(q.snapshot) z where x.id=(z->>'id')::uuid and x.status='disabled' and not x.is_owner;
 elsif q.scope='wos' then
 delete from public.nexa_wos_alliance_access x using jsonb_array_elements(q.snapshot->'wos') z where x.id=(z->>'id')::uuid and x.status='removed';
 delete from public.gift_staff_access x using jsonb_array_elements(q.snapshot->'gift') z where x.id=(z->>'id')::uuid and not x.is_active;
 delete from public.wos_utility_staff_access x using jsonb_array_elements(coalesce(q.snapshot->'legacy','[]')) z where x.id=(z->>'id')::uuid and x.status='removed';
 elsif q.scope='event' then delete from public.nexa_event_staff_permissions_v1 where staff_account_id=q.staff_account_id and state_number=q.state_number and status='suspended';end if;
 update public.nexa_staff_removal_queue_v1 set status='finalized',finalized_at=now(),snapshot='{}' where id=q.id;
 insert into public.nexa_quick_audit_v1(state_number,action,details) values(q.state_number,'staff_removal_finalized',jsonb_build_object('queue_id',q.id,'game_id',gid,'scope',q.scope));n:=n+1;
 end loop;
 for pr in select * from public.nexa_quick_pending_staff_v1 where removals<>'{}' for update loop
 mods:=pr.modules;rem:=pr.removals;
 for k in select key from jsonb_each(pr.removals) where (value->>'delete_after')::timestamptz<=now() loop
 mods:=mods-k;rem:=rem-k;
 insert into public.nexa_quick_audit_v1(state_number,action,details) values(pr.state_number,'pending_staff_removal_finalized',jsonb_build_object('game_id',pr.game_id,'scope',k));
 end loop;
 update public.nexa_quick_pending_staff_v1 set modules=mods,removals=rem where game_id=pr.game_id and state_number=pr.state_number;
 if mods='{}' then delete from public.nexa_quick_pending_staff_v1 where game_id=pr.game_id and state_number=pr.state_number;end if;
 end loop;
 -- Tickets contain no profiles; purge expired capabilities after seven days.
 delete from public.nexa_quick_tickets_v1 where expires_at<now()-interval '7 days';
 return n;
end $$;
create or replace function public.nexa_quick_register_staff_v1(p_game_id text,p_username text,p_game_name text,p_password text,p_remember boolean default false) returns jsonb
language plpgsql security definer set search_path=public,extensions,pg_temp as $$
declare a public.transfer_staff_accounts%rowtype;v record; k text;j jsonb;tw uuid;mw uuid;ga uuid;tok text;
begin
 if p_game_id !~'^[0-9]{4,24}$' or p_username !~'^[A-Za-z0-9._-]{3,32}$' or length(p_password)<8 or nullif(trim(p_game_name),'') is null then raise exception 'invalid_registration';end if;
 perform pg_advisory_xact_lock(hashtext('quick_staff:'||p_game_id));
 if not exists(select 1 from public.nexa_quick_pending_staff_v1 where game_id=p_game_id and removals='{}' and exists(select 1 from jsonb_each(modules) where (value->>'enabled')::boolean)) then raise exception 'no_pending_staff_invitation';end if;
 select * into a from public.transfer_staff_accounts where game_id=p_game_id;
 if a.id is not null then
 if a.password_hash<>crypt(p_password,a.password_hash) then raise exception 'existing_account_password_required';end if;
 else
 insert into public.transfer_staff_accounts(id,username,game_name,game_id,password_hash) values(gen_random_uuid(),p_username,p_game_name,p_game_id,crypt(p_password,gen_salt('bf',10))) returning * into a;
 end if;
 for v in select * from public.nexa_quick_pending_staff_v1 where game_id=p_game_id for update loop
 if exists(select 1 from public.nexa_staff_profiles_v1 where staff_account_id=a.id and (alliance_id<>v.alliance_id or state_number<>v.state_number)) then raise exception 'global_profile_conflict_requires_owner';end if;
 insert into public.nexa_staff_profiles_v1(staff_account_id,alliance_id,state_number) values(a.id,v.alliance_id,v.state_number) on conflict(staff_account_id) do nothing;
 for k,j in select key,value from jsonb_each(v.modules) loop
 if not (j->>'enabled')::boolean then continue;end if;
 select id into tw from public.transfer_workspaces where state_number=v.state_number and is_active order by created_at limit 1;
 select id into mw from public.ministry_workspaces_v2 where state_number=v.state_number and is_active order by created_at limit 1;
 if k='transfer' then
 if not exists(select 1 from public.transfer_staff_access where workspace_id=tw and account_id=a.id) then insert into public.transfer_staff_access(id,workspace_id,account_id,game_id,is_manager,is_owner,status,updated_at) values(gen_random_uuid(),tw,a.id,p_game_id,j->>'level'='admin',false,'active',now());end if;
 elsif k='ministry' then
 if not exists(select 1 from public.ministry_staff_access_v2 where workspace_id=mw and account_id=a.id) then insert into public.ministry_staff_access_v2(id,workspace_id,account_id,game_id,access_level,is_owner,status,updated_at) values(gen_random_uuid(),mw,a.id,p_game_id,j->>'level',false,'active',now());end if;
 elsif k='wos' then
 select g.id into ga from public.gift_alliances g join public.alliances x on x.tag=g.tag and x.state_number=g.state_number where x.id=v.alliance_id and g.is_active and g.deleted_at is null;
 if ga is null then raise exception 'selected_alliance_missing_wos_mapping';end if;
 if not exists(select 1 from public.nexa_wos_alliance_access where game_id=p_game_id and state_number=v.state_number and alliance_id=ga) then insert into public.nexa_wos_alliance_access(id,state_number,alliance_id,game_id,role,access_level,status,updated_at) values(gen_random_uuid(),v.state_number,ga,p_game_id,'r4',j->>'level','active',now());end if;
 insert into public.wos_utility_staff_access(id,game_id,staff_account_id,role,main_alliance_id,module_access,status,updated_at)
 values(gen_random_uuid(),p_game_id,a.id,case when j->>'level'='admin' then 'administrative' else 'r4' end,ga,'{"gift":true,"reminders":true}','active',now())
 on conflict(game_id) do update set staff_account_id=excluded.staff_account_id,role=excluded.role,main_alliance_id=excluded.main_alliance_id,module_access=coalesce(wos_utility_staff_access.module_access,'{}')||excluded.module_access,status='active',updated_at=now();
 elsif k='event' then
 insert into public.nexa_event_staff_permissions_v1(staff_account_id,state_number,access_level,status) values(a.id,v.state_number,j->>'level','active') on conflict(staff_account_id,state_number) do nothing;
 end if;
 end loop;
 delete from public.nexa_quick_pending_staff_v1 where game_id=p_game_id and state_number=v.state_number;
 end loop;
 tok:=encode(gen_random_bytes(32),'hex');
 insert into public.transfer_staff_sessions(account_id,token_hash,expires_at) values(a.id,encode(digest(tok,'sha256'),'hex'),now()+case when p_remember then interval '30 days' else interval '12 hours' end);
 return jsonb_build_object('ok',true,'token',tok,'state_number',v.state_number);
end $$;

create or replace function public.nexa_global_staff_save_v1(p_token text,p_state_number integer,p_game_id text,p_transfer_enabled boolean,p_transfer_level text,p_ministry_enabled boolean,p_ministry_level text,p_wos_enabled boolean,p_wos_level text,p_wos_role text,p_wos_alliance_id uuid) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare al bigint;c jsonb;mods jsonb:='{}';t uuid;
begin
 c:=public.nexa_quick_context_v1(p_token,p_state_number);
 select id into t from public.transfer_staff_accounts where game_id=p_game_id;
 select alliance_id into al from public.nexa_staff_profiles_v1 where staff_account_id=t;
 if al is null and p_wos_alliance_id is not null then select x.id into al from public.alliances x join public.gift_alliances g on g.tag=x.tag and g.state_number=x.state_number where g.id=p_wos_alliance_id and x.state_number=p_state_number;end if;
 if coalesce((c->'manage_modules'->>'transfer')::boolean,false) then mods:=mods||jsonb_build_object('transfer',jsonb_build_object('enabled',p_transfer_enabled,'level',p_transfer_level));end if;
 if coalesce((c->'manage_modules'->>'ministry')::boolean,false) then mods:=mods||jsonb_build_object('ministry',jsonb_build_object('enabled',p_ministry_enabled,'level',p_ministry_level));end if;
 if coalesce((c->'manage_modules'->>'wos')::boolean,false) then mods:=mods||jsonb_build_object('wos',jsonb_build_object('enabled',p_wos_enabled,'level',p_wos_level));end if;
 return public.nexa_quick_staff_v1(p_token,p_state_number,'save',jsonb_build_object('game_id',p_game_id,'alliance_id',al,'modules',mods));
end $$;

alter table public.nexa_quick_transfer_v1 enable row level security;
revoke all on public.nexa_quick_transfer_v1 from anon,authenticated;
alter table public.nexa_quick_members_v1 enable row level security;
revoke all on public.nexa_quick_members_v1 from anon,authenticated;
alter table public.nexa_quick_forms_v1 enable row level security;
revoke all on public.nexa_quick_forms_v1 from anon,authenticated;
alter table public.nexa_quick_registrations_v1 enable row level security;
revoke all on public.nexa_quick_registrations_v1 from anon,authenticated;
alter table public.nexa_quick_tickets_v1 enable row level security;
revoke all on public.nexa_quick_tickets_v1 from anon,authenticated;
alter table public.nexa_quick_audit_v1 enable row level security;
revoke all on public.nexa_quick_audit_v1 from anon,authenticated;
alter table public.nexa_quick_pending_staff_v1 enable row level security;
revoke all on public.nexa_quick_pending_staff_v1 from anon,authenticated;
revoke all on function public.nexa_quick_context_v1(text,integer) from public;
grant execute on function public.nexa_quick_context_v1(text,integer) to anon,authenticated;
revoke all on function public.nexa_quick_rpc_v1(text,integer,text,jsonb) from public;
grant execute on function public.nexa_quick_rpc_v1(text,integer,text,jsonb) to anon,authenticated;
revoke all on function public.nexa_quick_staff_v1(text,integer,text,jsonb) from public;
grant execute on function public.nexa_quick_staff_v1(text,integer,text,jsonb) to anon,authenticated;
revoke all on function public.nexa_quick_public_v1(text,uuid,jsonb) from public;
grant execute on function public.nexa_quick_public_v1(text,uuid,jsonb) to anon,authenticated;
revoke all on function public.nexa_quick_register_staff_v1(text,text,text,text,boolean) from public;
grant execute on function public.nexa_quick_register_staff_v1(text,text,text,text,boolean) to anon,authenticated;
revoke all on function public.nexa_workspace_session_v3(text,integer) from public;
grant execute on function public.nexa_workspace_session_v3(text,integer) to anon,authenticated;
revoke all on function public.nexa_quick_finalize_removals_v1() from public,anon,authenticated;
grant execute on function public.nexa_quick_finalize_removals_v1() to service_role;
notify pgrst, 'reload schema';
commit;
