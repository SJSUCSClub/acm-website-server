create database acm_website;

\c acm_website;

create extension if not exists pg_trgm;

create type events_enum as enum ('workshop', 'seminar', 'hackathon', 'conference', 'meetup', 'test', 'other');
create type cs_fields_enum as enum ('web development', 'machine learning', 'cloud computing', 'artificial intelligence');
create type target_audience_enum as enum ('students');
create type equipment_condition_enum as enum ('ready', 'broken', 'in maintenance');
create type membership_term_enum as enum ('semester', 'annual');
create type membership_request_status_enum as enum ('pending', 'approved', 'declined');
create type industry_enum as enum ('investment banking', 'aerospace', 'healthcare');
create type officer_position_enum as enum ('president', 'vice president', 'dev team officer', 'treasurer', 'social media manager');

create table if not exists majors(
   name text not null,
   PRIMARY KEY(name)
);

create table if not exists users(
   id serial,
   created_at timestamp not null default CURRENT_TIMESTAMP,
   name text not null,
   email text not null,
   major text not null,
   grad_date Date not null,
   interests cs_fields_enum[] not null default '{}'::cs_fields_enum[],
   profile_pic text,
   PRIMARY KEY(id),
   foreign key(major) references majors(name) on update cascade
);

create table if not exists session(
   id serial,
   user_id integer not null,
   created_at timestamp not null default CURRENT_TIMESTAMP,
   expires_at timestamp not null,
   PRIMARY KEY(id),
   FOREIGN KEY(user_id) REFERENCES users(id) on update cascade on delete cascade
);

create table if not exists equipment_rental_type(
   id serial,
   created_at timestamp not null default CURRENT_TIMESTAMP,
   name text not null,
   price money not null,
   description text,
   PRIMARY KEY(id)
);

create table if not exists equipment_item(
   id serial,
   created_at timestamp not null default CURRENT_TIMESTAMP,
   equipment_type integer not null,
   PRIMARY KEY(id),
   FOREIGN KEY(equipment_type) REFERENCES equipment_rental_type(id) on update cascade
);

create table if not exists equipment_rentals(
   item_id integer not null,
   user_id integer,
   date_borrowed date not null default current_date,
   return_date date not null,
   price money not null,
   condition equipment_condition_enum not null default 'ready',
   PRIMARY KEY(user_id, item_id),
   FOREIGN KEY(item_id) REFERENCES equipment_item(id) on update cascade,
   FOREIGN KEY(user_id) REFERENCES users(id) on update cascade on delete set null
);

create table if not exists blacklist(
   user_id integer not null,
   reason text not null,
   date_blacklisted timestamp not null default CURRENT_TIMESTAMP,
   PRIMARY KEY(user_id),
   FOREIGN KEY(user_id) REFERENCES users(id) on update cascade on delete cascade
);

create table if not exists urls(
   id serial,
   original_url text not null,
   short_url text not null,
   PRIMARY KEY(id)
);

create table if not exists events(
   id serial,
   created_at timestamp not null default current_timestamp,
   name text not null,
   location text not null,
   start_date Date not null,
   end_date Date not null,
   description text not null,
   urls text[] not null default '{}'::text[],
   event_type events_enum not null,
   event_capacity int,
   image text not null,
   start_time time not null,
   end_time time not null,   
   tags cs_fields_enum[] not null default array[]::cs_fields_enum[],
   target_audience target_audience_enum,
   shortened_event_url integer,
   PRIMARY KEY(id),
   FOREIGN KEY(shortened_event_url) REFERENCES urls(id) on update cascade
);

create table if not exists files(
   key text not null,
   name text not null,
   created_at timestamp not null default current_timestamp,
   primary key(key)
);

create table if not exists events_files(
   event_id integer not null,
   file_key text not null,
   primary key(event_id, file_key),
   foreign key(event_id) references events(id) on update cascade on delete cascade,
   foreign key(file_key) references files(key) on update cascade on delete cascade
);

create table if not exists bookmarked_events(
   user_id integer not null,
   event_id integer not null,
   bookmarked_date timestamp not null default CURRENT_TIMESTAMP,
   PRIMARY KEY(user_id, event_id),
   FOREIGN KEY(user_id) REFERENCES users(id) on update cascade on delete cascade,
   FOREIGN KEY(event_id) REFERENCES events(id) on update cascade on delete cascade
);

create table if not exists subscribed_events(
   user_id integer not null,
   event_id integer not null,
   subscribed_date timestamp not null default CURRENT_TIMESTAMP,
   PRIMARY KEY(user_id, event_id),
   FOREIGN KEY(user_id) REFERENCES users(id) on update cascade on delete cascade,
   FOREIGN KEY(event_id) REFERENCES events(id) on update cascade on delete cascade
);

create table if not exists companies(
   id serial,
   name text not null,
   location text,
   description text not null,
   industry_id industry_enum not null,
   logo text,
   PRIMARY KEY(id),
   FOREIGN KEY(logo) REFERENCES files(key) on update cascade
);

create table if not exists event_companies(
   event_id integer not null,
   company_id integer not null,
   PRIMARY KEY(event_id, company_id),
   FOREIGN KEY(event_id) REFERENCES events(id) on delete cascade,
   FOREIGN KEY(company_id) REFERENCES companies(id) on delete cascade
);

create table if not exists subscribed_companies(
   user_id integer not null,
   company_id integer not null,
   subscribed_date timestamp not null default CURRENT_TIMESTAMP,
   PRIMARY KEY(user_id, company_id),
   FOREIGN KEY(user_id) REFERENCES users(id) on delete cascade,
   FOREIGN KEY(company_id) REFERENCES companies(id) on delete cascade
);

create table if not exists projects(
   id serial,
   name text not null,
   description text not null,
   github_link text,
   PRIMARY KEY(id)
);

create table if not exists projects_files(
   project_id integer not null,
   file_key text not null,
   primary key(project_id, file_key),
   foreign key(project_id) references projects(id) on update cascade on delete cascade,
   foreign key(file_key) references files(key) on update cascade on delete cascade
);

create table if not exists interested_in_projects(
   user_id integer not null,
   project_id integer not null,
   PRIMARY KEY(user_id, project_id),
   FOREIGN KEY(user_id) REFERENCES users(id) on update cascade on delete cascade,
   FOREIGN KEY(project_id) REFERENCES projects(id) on update cascade on delete cascade
);

create table if not exists officers(
   id serial,
   position officer_position_enum not null,
   linkedin text,
   photo text,
   PRIMARY KEY(id),
   FOREIGN KEY(photo) REFERENCES files(key) on update cascade
);

create index projects_name_trgm_idx on projects using gin (name gin_trgm_ops);
create index companies_name_trgm_idx on companies using gin (name gin_trgm_ops);
create index events_name_trgm_idx on events using gin (name gin_trgm_ops);
create index equipment_type_trgm_idx on equipment_rental_type using gin (name gin_trgm_ops);

create or replace function get_event_attendance(current_event_id integer)
returns integer as $$
declare
   attendance integer;
begin
 select COUNT(user_id)
 into attendance
 from subscribed_events
 where event_id = current_event_id;
 return attendance;
end;
$$ language plpgsql
stable
returns null on null input;

create or replace function is_user_alumni(user_id integer)
returns boolean as $$
declare
  user_grad_date date;
begin
  select grad_date into user_grad_date from users where id=user_id;
  if user_grad_date < current_date then
    return true;
  else
    return false;
  end if;
end;
$$ language plpgsql
stable
returns null on null input;

--create or replace function is_equipment_type_available(equipment_type_id integer)
--returns boolean as $$
--declare
--  rented_item_count integer;
--  item_count integer;
--begin
--  select count(*) into rented_item_count
--  from equipment_rentals er
--  inner join equipment_item ei
--  on er.item_id=ei.id
--  where er.return_date 
--end;
--$$ language plpgsql
--stable
--returns null on null input;
