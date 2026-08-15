begin;

alter table public.event_form_questions
  add column if not exists show_on_response_card boolean not null default false,
  add column if not exists is_priority_field boolean not null default false;

commit;
