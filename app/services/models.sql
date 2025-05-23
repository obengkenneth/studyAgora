## user profile

create table public.user_profiles (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid null,
  full_name text null,
  user_group text null,
  curriculum text null,
  location text null,
  school text null,
  bio text null,
  avatar_url text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  deleted_at timestamp with time zone null,
  constraint user_profiles_pkey primary key (id),
  constraint user_profiles_user_id_key unique (user_id),
  constraint user_profiles_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
  constraint user_profiles_curriculum_check check (
    (
      curriculum = any (
        array['cambridge'::text, 'sat'::text, 'ielts'::text]
      )
    )
  ),
  constraint user_profiles_user_group_check check (
    (
      user_group = any (
        array[
          'student'::text,
          'parent'::text,
          'facilitator'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_user_profiles_curriculum on public.user_profiles using btree (curriculum) TABLESPACE pg_default;

create index IF not exists idx_user_profiles_deleted_at on public.user_profiles using btree (deleted_at) TABLESPACE pg_default;

create index IF not exists idx_user_profiles_user_group on public.user_profiles using btree (user_group) TABLESPACE pg_default;

create index IF not exists idx_user_profiles_user_id on public.user_profiles using btree (user_id) TABLESPACE pg_default;

create trigger set_timestamp_user_profiles BEFORE
update on user_profiles for EACH row
execute FUNCTION trigger_set_timestamp ();


## session resources
create table public.session_resources (
  id uuid not null default extensions.uuid_generate_v4 (),
  session_id uuid null,
  resource_id uuid null,
  created_at timestamp with time zone null default now(),
  deleted_at timestamp with time zone null,
  constraint session_resources_pkey primary key (id),
  constraint session_resources_session_id_resource_id_key unique (session_id, resource_id),
  constraint session_resources_resource_id_fkey foreign KEY (resource_id) references resources (id) on delete CASCADE,
  constraint session_resources_session_id_fkey foreign KEY (session_id) references live_sessions (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_session_resources_deleted_at on public.session_resources using btree (deleted_at) TABLESPACE pg_default;

## session enrollments
create table public.session_enrollments (
  id uuid not null default extensions.uuid_generate_v4 (),
  session_id uuid null,
  user_id uuid null,
  status text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  deleted_at timestamp with time zone null,
  constraint session_enrollments_pkey primary key (id),
  constraint session_enrollments_session_id_user_id_key unique (session_id, user_id),
  constraint session_enrollments_session_id_fkey foreign KEY (session_id) references live_sessions (id) on delete CASCADE,
  constraint session_enrollments_user_id_fkey foreign KEY (user_id) references user_profiles (user_id) on delete CASCADE,
  constraint session_enrollments_status_check check (
    (
      status = any (
        array[
          'registered'::text,
          'attended'::text,
          'cancelled'::text,
          'no_show'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_session_enrollments_deleted_at on public.session_enrollments using btree (deleted_at) TABLESPACE pg_default;

create index IF not exists idx_session_enrollments_user_id on public.session_enrollments using btree (user_id) TABLESPACE pg_default;

create trigger set_timestamp_session_enrollments BEFORE
update on session_enrollments for EACH row
execute FUNCTION trigger_set_timestamp ();


## resources
create table public.resources (
  id uuid not null default extensions.uuid_generate_v4 (),
  title text not null,
  description text null,
  resource_type text null,
  curriculum text null,
  subject text null,
  file_url text null,
  thumbnail_url text null,
  creator_id uuid null,
  is_public boolean null default false,
  download_count integer null default 0,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  deleted_at timestamp with time zone null,
  constraint resources_pkey primary key (id),
  constraint resources_creator_id_fkey foreign KEY (creator_id) references user_profiles (user_id),
  constraint resources_curriculum_check check (
    (
      curriculum = any (
        array['cambridge'::text, 'sat'::text, 'ielts'::text]
      )
    )
  ),
  constraint resources_resource_type_check check (
    (
      resource_type = any (
        array[
          'note'::text,
          'book'::text,
          'past_question'::text,
          'other'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_resources_creator_id on public.resources using btree (creator_id) TABLESPACE pg_default;

create index IF not exists idx_resources_curriculum on public.resources using btree (curriculum) TABLESPACE pg_default;

create index IF not exists idx_resources_deleted_at on public.resources using btree (deleted_at) TABLESPACE pg_default;

create trigger set_timestamp_resources BEFORE
update on resources for EACH row
execute FUNCTION trigger_set_timestamp ();

## pre_recorded_sessions
create table public.pre_recorded_sessions (
  id uuid not null default extensions.uuid_generate_v4 (),
  title text not null,
  description text null,
  curriculum text null,
  subject text null,
  duration integer null,
  video_url text null,
  thumbnail_url text null,
  facilitator_id uuid null,
  is_published boolean null default false,
  view_count integer null default 0,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  deleted_at timestamp with time zone null,
  constraint pre_recorded_sessions_pkey primary key (id),
  constraint pre_recorded_sessions_facilitator_id_fkey foreign KEY (facilitator_id) references user_profiles (user_id),
  constraint pre_recorded_sessions_curriculum_check check (
    (

## lesson_notes
create table public.lesson_notes (
  id uuid not null default extensions.uuid_generate_v4 (),
  lesson_id uuid not null,
  user_id uuid not null,
  content text not null,
  timestamp integer null, -- video timestamp in milliseconds
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  deleted_at timestamp with time zone null,
  constraint lesson_notes_pkey primary key (id),
  constraint lesson_notes_lesson_id_fkey foreign key (lesson_id) references lessons (id),
  constraint lesson_notes_user_id_fkey foreign key (user_id) references auth.users (id)
);

create index IF not exists idx_lesson_notes_lesson_id on public.lesson_notes using btree (lesson_id) TABLESPACE pg_default;
create index IF not exists idx_lesson_notes_user_id on public.lesson_notes using btree (user_id) TABLESPACE pg_default;
create index IF not exists idx_lesson_notes_deleted_at on public.lesson_notes using btree (deleted_at) TABLESPACE pg_default;

create trigger set_timestamp_lesson_notes BEFORE
update on lesson_notes for EACH row
execute FUNCTION trigger_set_timestamp ();


      curriculum = any (
        array['cambridge'::text, 'sat'::text, 'ielts'::text]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_pre_recorded_sessions_deleted_at on public.pre_recorded_sessions using btree (deleted_at) TABLESPACE pg_default;

create trigger set_timestamp_pre_recorded_sessions BEFORE
update on pre_recorded_sessions for EACH row
execute FUNCTION trigger_set_timestamp ();


### live_sessions
create table public.live_sessions (
  id uuid not null default extensions.uuid_generate_v4 (),
  title text not null,
  description text null,
  curriculum text null,
  subject text null,
  scheduled_start timestamp with time zone not null,
  estimated_duration integer null,
  meeting_url text null,
  facilitator_id uuid null,
  max_participants integer null,
  is_cancelled boolean null default false,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  deleted_at timestamp with time zone null,
  constraint live_sessions_pkey primary key (id),
  constraint live_sessions_facilitator_id_fkey foreign KEY (facilitator_id) references user_profiles (user_id),
  constraint live_sessions_curriculum_check check (
    (
      curriculum = any (
        array['cambridge'::text, 'sat'::text, 'ielts'::text]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_live_sessions_deleted_at on public.live_sessions using btree (deleted_at) TABLESPACE pg_default;

create index IF not exists idx_live_sessions_facilitator_id on public.live_sessions using btree (facilitator_id) TABLESPACE pg_default;

create index IF not exists idx_live_sessions_scheduled_start on public.live_sessions using btree (scheduled_start) TABLESPACE pg_default;

create trigger set_timestamp_live_sessions BEFORE
update on live_sessions for EACH row
execute FUNCTION trigger_set_timestamp ();

### courses
create table public.courses (
  id uuid not null default extensions.uuid_generate_v4 (),
  title text not null,
  duration text not null,
  curriculum text not null,
  image text not null,
  students integer null default 0,
  created_by uuid null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint courses_pkey primary key (id),
  constraint courses_created_by_fkey foreign KEY (created_by) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

## course_content
create table public.courses (
  id uuid not null default extensions.uuid_generate_v4 (),
  title text not null,
  duration text not null,
  curriculum text not null,
  image text not null,
  students integer null default 0,
  created_by uuid null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint courses_pkey primary key (id),
  constraint courses_created_by_fkey foreign KEY (created_by) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

### active_user_profiles
create view public.active_user_profiles as
select
  user_profiles.id,
  user_profiles.user_id,
  user_profiles.full_name,
  user_profiles.user_group,
  user_profiles.curriculum,
  user_profiles.location,
  user_profiles.school,
  user_profiles.bio,
  user_profiles.avatar_url,
  user_profiles.created_at,
  user_profiles.updated_at,
  user_profiles.deleted_at
from
  user_profiles
where
  user_profiles.deleted_at is null;

## active_session_enrollments
create view public.active_session_enrollments as
select
  session_enrollments.id,
  session_enrollments.session_id,
  session_enrollments.user_id,
  session_enrollments.status,
  session_enrollments.created_at,
  session_enrollments.updated_at,
  session_enrollments.deleted_at
from
  session_enrollments
where
  session_enrollments.deleted_at is null;

## active_resources
create view public.active_resources as
select
  resources.id,
  resources.title,
  resources.description,
  resources.resource_type,
  resources.curriculum,
  resources.subject,
  resources.file_url,
  resources.thumbnail_url,
  resources.creator_id,
  resources.is_public,
  resources.download_count,
  resources.created_at,
  resources.updated_at,
  resources.deleted_at
from
  resources
where
  resources.deleted_at is null;

## active_pre_recorded_sessions
create view public.active_pre_recorded_sessions as
select
  pre_recorded_sessions.id,
  pre_recorded_sessions.title,
  pre_recorded_sessions.description,
  pre_recorded_sessions.curriculum,
  pre_recorded_sessions.subject,
  pre_recorded_sessions.duration,
  pre_recorded_sessions.video_url,
  pre_recorded_sessions.thumbnail_url,
  pre_recorded_sessions.facilitator_id,
  pre_recorded_sessions.is_published,
  pre_recorded_sessions.view_count,
  pre_recorded_sessions.created_at,
  pre_recorded_sessions.updated_at,
  pre_recorded_sessions.deleted_at
from
  pre_recorded_sessions
where
  pre_recorded_sessions.deleted_at is null;

## active_live_sessions
create view public.active_live_sessions as
select
  live_sessions.id,
  live_sessions.title,
  live_sessions.description,
  live_sessions.curriculum,
  live_sessions.subject,
  live_sessions.scheduled_start,
  live_sessions.estimated_duration,
  live_sessions.meeting_url,
  live_sessions.facilitator_id,
  live_sessions.max_participants,
  live_sessions.is_cancelled,
  live_sessions.created_at,
  live_sessions.updated_at,
  live_sessions.deleted_at
from
  live_sessions
where
  live_sessions.deleted_at is null;