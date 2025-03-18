SELECT 'CREATE DATABASE acm_website'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'acm_website')\gexec

\c acm_website;

create extension if not exists pg_trgm;

create type events_enum as enum ('Workshop', 'Seminar', 'Hackathon', 'Conference', 'Meetup', 'Tech Talk', 'Other');
create type cs_fields_enum as enum ('Web Development', 'Machine Learning', 'Cloud Computing', 'Artificial Intelligence', 'Networking', 'Cybersecurity', 'Mobile Development', 'Game Development', 'Data Science');
create type target_audience_enum as enum ('Students');
create type equipment_condition_enum as enum ('Ready', 'Broken', 'In Maintenance');
create type membership_term_enum as enum ('Semester', 'Annual');
create type education_level_enum as enum('Undergraduate', 'Graduate');
create type membership_request_status_enum as enum ('Pending', 'Approved', 'Declined');
create type industry_enum as enum ('Banking and Finance', 'Aerospace', 'Healthcare', 'Automotive', 'Energy', 'Technology');
create type officer_position_enum as enum ('President', 'Vice President', 'Dev Team Officer', 'Treasurer', 'Social Media Manager', 'Secretary');
create type user_role_enum as enum ('user', 'member', 'admin');
create type year_enum as enum ('Freshman', 'Sophomore', 'Junior', 'Senior', 'Alumni');
create type project_status_enum as enum ('Not Started', 'Looking for Members', 'In Progress', 'Completed');

create table if not exists majors(
   name text not null,
   PRIMARY KEY(name)
);

create table if not exists users(
   id text not null,
   created_at timestamp not null default CURRENT_TIMESTAMP,
   name text not null,
   email text not null,
   role user_role_enum not null default 'user',
   major text not null,
   education_level education_level_enum not null,
   grad_date Date not null,
   interests cs_fields_enum[] not null default '{}'::cs_fields_enum[],
   paid membership_term_enum,
   profile_pic text,
   discord text,
   linkedin text,
   github text,
   website text,
   PRIMARY KEY(id),
   foreign key(major) references majors(name) on update cascade,
   constraint check_paid_role check ((paid IS NULL AND role IN ('user', 'admin')) OR (paid IS NOT NULL AND role IN ('member', 'admin')))
);

create table if not exists session(
   id text not null,
   user_id text not null,
   created_at timestamp not null default CURRENT_TIMESTAMP,
   expires_at timestamp not null,
   PRIMARY KEY(id),
   FOREIGN KEY(user_id) REFERENCES users(id) on update cascade on delete cascade
);

create table if not exists user_key(
   id text not null,
   user_id text not null,
   hashed_password text,
   PRIMARY KEY(id),
   FOREIGN KEY(user_id) REFERENCES users(id) on update cascade on delete cascade
);

create table if not exists equipment_rental_type(
   id serial,
   created_at timestamp not null default CURRENT_TIMESTAMP,
   name text not null,
   price numeric(10,2) not null,
   image text,
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
   user_id text,
   date_borrowed date not null default current_date,
   return_date date not null,
--   price money not null,
   price numeric(10,2) not null,
   condition equipment_condition_enum not null default 'Ready',
   PRIMARY KEY(user_id, item_id),
   FOREIGN KEY(item_id) REFERENCES equipment_item(id) on update cascade,
   FOREIGN KEY(user_id) REFERENCES users(id) on update cascade on delete set null
);

create table if not exists blacklist(
   user_id text not null,
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

create table if not exists files(
   key text not null,
   name text not null,
   created_at timestamp not null default current_timestamp,
   primary key(key)
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
   image text,
   start_time time not null,
   end_time time not null,   
   tags cs_fields_enum[] not null default array[]::cs_fields_enum[],
   target_audience target_audience_enum,
   shortened_event_url integer,
   member_only boolean not null default false,
   PRIMARY KEY(id),
   FOREIGN KEY(shortened_event_url) REFERENCES urls(id) on update cascade,
   foreign key(image) references files(key) on update cascade
);

create table if not exists events_files(
   event_id integer not null,
   file_key text not null,
   primary key(event_id, file_key),
   foreign key(event_id) references events(id) on update cascade on delete cascade,
   foreign key(file_key) references files(key) on update cascade
);

create table if not exists bookmarked_events(
   user_id text not null,
   event_id integer not null,
   bookmarked_date timestamp not null default CURRENT_TIMESTAMP,
   PRIMARY KEY(user_id, event_id),
   FOREIGN KEY(user_id) REFERENCES users(id) on update cascade on delete cascade,
   FOREIGN KEY(event_id) REFERENCES events(id) on update cascade on delete cascade
);

create table if not exists subscribed_events(
   user_id text not null,
   event_id integer not null,
   subscribed_date timestamp not null default CURRENT_TIMESTAMP,
   PRIMARY KEY(user_id, event_id),
   FOREIGN KEY(user_id) REFERENCES users(id) on update cascade on delete cascade,
   FOREIGN KEY(event_id) REFERENCES events(id) on update cascade on delete cascade
);

create table if not exists attending_events(
   user_id text not null,
   event_id integer not null,
   attending_date timestamp not null default CURRENT_TIMESTAMP,
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
   user_id text not null,
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
   status project_status_enum not null default 'Not Started',
   PRIMARY KEY(id)
);

create table if not exists projects_files(
   project_id integer not null,
   file_key text not null,
   primary key(project_id, file_key),
   foreign key(project_id) references projects(id) on update cascade on delete cascade,
   foreign key(file_key) references files(key) on update cascade
);

create table if not exists interested_in_projects(
   user_id text not null,
   project_id integer not null,
   PRIMARY KEY(user_id, project_id),
   FOREIGN KEY(user_id) REFERENCES users(id) on update cascade on delete cascade,
   FOREIGN KEY(project_id) REFERENCES projects(id) on update cascade on delete cascade
);

create table if not exists officers(
   id serial,
   user_id text not null,
   position officer_position_enum not null,
   linkedin text,
   photo text,
   PRIMARY KEY(id),
   FOREIGN KEY(user_id) REFERENCES users(id) on update cascade on delete cascade,
   FOREIGN KEY(photo) REFERENCES files(key) on update cascade
);

create table if not exists sponsors(
   name varchar(100),
   logo_key text not null,
   primary key(name)
);

create table if not exists club_links(
  id serial,
  instagram text,
  discord text,
  linkedin text,
  member_application text,
  primary key(id)
 );

create table if not exists landing_spotlights(
  id serial,
  event_id integer not null,
  image_key text not null,
  primary key(id),
  foreign key(event_id) references events(id) on update cascade,
  foreign key(image_key) references files(key) on update cascade
 );

create table if not exists landing_questions(
  id serial,
  question text not null,
  answer text not null,
  primary key(id)
);

create table if not exists payment_links(
   id serial,
   name text not null,
   link text not null,
   PRIMARY KEY(id)
);

create index projects_name_trgm_idx on projects using gin (name gin_trgm_ops);
create index companies_name_trgm_idx on companies using gin (name gin_trgm_ops);
create index events_name_trgm_idx on events using gin (name gin_trgm_ops);
create index equipment_type_trgm_idx on equipment_rental_type using gin (name gin_trgm_ops);

create or replace function get_event_attendance(current_event_id integer)
RETURNS integer AS $$
BEGIN
   RETURN (SELECT COUNT(user_id)
           FROM subscribed_events
           WHERE event_id = current_event_id);
END;
$$ LANGUAGE plpgsql
STABLE
RETURNS NULL ON NULL INPUT;

create or replace function is_user_alumni(user_id text)
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


CREATE OR REPLACE FUNCTION isalum(userId text) RETURNS BOOLEAN LANGUAGE plpgsql AS
$$
DECLARE
gradDate date;
cDate date;
BEGIN
SELECT users.grad_date FROM users WHERE users.id = userId INTO gradDate;
SELECT CURRENT_DATE INTO cDate;
RETURN gradDate <= cDate;
END;
$$;

CREATE OR REPLACE FUNCTION getAttendees(eventId integer) 
RETURNS INTEGER 
RETURNS NULL ON NULL INPUT
LANGUAGE plpgsql AS
$$
DECLARE
    attendeeCount INTEGER;
BEGIN
SELECT COUNT(*) INTO attendeeCount from subscribed_events WHERE event_id=eventId;
RETURN attendeeCount;   
END;
$$;

CREATE OR REPLACE FUNCTION getEventAttendeesCount(eventId integer)
RETURNS INTEGER
LANGUAGE plpgsql
AS
$$
DECLARE
    attendeeCount INTEGER;
BEGIN
    SELECT COUNT(*) INTO attendeeCount
    FROM subscribed_events
    WHERE event_id = eventId;

    RETURN attendeeCount;
END;
$$;

CREATE OR REPLACE FUNCTION getYear(userId text)
RETURNS year_enum 
LANGUAGE plpgsql
AS $$
DECLARE
      gradDate date;
      gradYear INTEGER;
      currentYear INTEGER;
      currentMonth INTEGER;
      level text;
BEGIN
      SELECT grad_date INTO gradDate FROM users WHERE id = userId;
      SELECT education_level INTO level FROM users WHERE id = userId;

      SELECT EXTRACT(YEAR FROM gradDate) into gradYear;
      SELECT EXTRACT(YEAR FROM CURRENT_DATE) into currentYear;
      SELECT EXTRACT(MONTH FROM CURRENT_DATE) into currentMonth;
      IF currentMonth > 8 THEN
            currentYear = currentYear + 1;
      END IF;

      CASE
         WHEN gradYear - currentYear = 0 THEN
            RETURN 'Senior';
         WHEN gradYear - currentYear = 1 THEN
            IF level = 'Graduate' THEN
               RETURN 'Sophomore';
            END IF;
            RETURN 'Junior';
         WHEN gradYear - currentYear = 2 THEN
            IF level = 'Graduate' THEN
               RETURN 'Freshman';
            END IF;
            RETURN 'Sophomore';
         WHEN gradYear - currentYear = 3 THEN
            RETURN 'Freshman';
         ELSE
            RETURN 'Alumni';
      END CASE;
END;
$$;

create or replace function getEnumValues(enumName text)
returns text[]
language plpgsql
as
$$
declare
   exist boolean;
	values text[];
begin
   select exists (select 1 from pg_type where typname = enumName) into exist;
   if exist then
      select array(select enumlabel from pg_enum where enumtypid=enumName::regtype) into values;
      return values;
   end if;
   return array[]::text[];
end;
$$;
