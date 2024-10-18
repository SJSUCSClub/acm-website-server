SELECT 'CREATE DATABASE acm_website' 
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'acm_website')\gexec

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
create type user_role_enum as enum ('user', 'admin');

create table if not exists majors(
   name text not null,
   PRIMARY KEY(name)
);


create table if not exists users(
   id text not null,
   created_at timestamp not null,
   name text not null,
   email text not null,
   role user_role_enum not null default 'user',
   major text not null,
   grad_date Date not null,
   interests cs_fields_enum[] not null default '{}'::cs_fields_enum[],
   profile_pic text,
   PRIMARY KEY(id),
   foreign key(major) references majors(name) on update cascade
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
--   price money not null,
   price numeric(10,2) not null,
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
   condition equipment_condition_enum not null default 'ready',
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

insert into majors(name) values
('Undeclared'),
('Advertising, BS'),
('Aerospace Engineering, BS'),
('African American Studies, BA'),
('Animation & Illustration, BFA'),
('Anthropology, BA'),
('Anthropology, BA (SJSU Online)'),
('Applied Mathematics, Applied and Computational Mathematics Concentration, BS'),
('Art History and Visual Culture, BA'),
('Art, Digital Media Art Concentration, BFA'),
('Art, Photography Concentration, BFA'),
('Art, Pictorial Art Concentration, BFA'),
('Art, Spatial Art Concentration, BFA'),
('Art, Studio Practice Concentration (Preparation for Teaching), BA'),
('Art, Studio Practice Concentration, BA'),
('Aviation, BS'),
('Behavioral Science, BA'),
('Biological Sciences - Ecology and Evolution, BS'),
('Biological Sciences - Marine Biology, BS'),
('Biological Sciences, BA'),
('Biological Sciences, Microbiology Concentration, BS'),
('Biological Sciences, Molecular Biology Concentration, BS'),
('Biological Sciences, Systems Physiology Concentration, BS'),
('Biomedical Engineering, BS  '),
('Business Administration, Accounting Concentration, BS'),
('Business Administration, Accounting Information Systems Concentration, BS'),
('Business Administration, Business Analytics Concentration, BS'),
('Business Administration, Corporate Accounting and Finance Concentration, BS'),
('Business Administration, Entrepreneurship Concentration, BS'),
('Business Administration, Finance Concentration, BS'),
('Business Administration, General Business Concentration, BS'),
('Business Administration, General Business Concentration, BS (SJSU Online)'),
('Business Administration, Hospitality, Tourism and Event Management Concentration, BS'),
('Business Administration, Human Resource Management Concentration, BS'),
('Business Administration, International Business Concentration, BS'),
('Business Administration, Management Concentration, BS'),
('Business Administration, Management Information Systems Concentration, BS'),
('Business Administration, Marketing Concentration, BS'),
('Business Administration, Operations and Supply Chain Management Concentration, BS'),
('Chemical Engineering, BS '),
('Chemistry, BA'),
('Chemistry, Biochemistry Concentration, BS'),
('Chemistry, BS '),
('Chicana and Chicano Studies, BA'),
('Child and Adolescent Development, BA'),
('Child and Adolescent Development, Preparation for Teaching W/CSET Waiver, BA'),
('Child and Adolescent Development, Preparation for Teaching, BA'),
('Chinese, BA'),
('Civil Engineering, BS'),
('Climate Science, BS'),
('Communication Studies, BA'),
('Communication Studies, Preparation for Teaching, BA (Not Accepting Students)'),
('Communicative Disorders and Sciences, BA'),
('Computer Engineering, BS'),
('Computer Science and Linguistics, BS'),
('Computer Science, BS'),
('Creative Arts, BA'),
('Dance, BA'),
('Dance, BFA'),
('Data Science, BS'),
('Design Studies, BA'),
('Earth System Science, BS'),
('Economics, BA'),
('Economics, BA (SJSU Online)'),
('Economics, BS'),
('Electrical Engineering, BS '),
('Engineering Technology, Computer Network System Management Concentration, BS'),
('Engineering Technology, Manufacturing Systems Concentration, BS'),
('English, BA'),
('English, Creative Writing Concentration, BA'),
('English, Preparation for Teaching (Single Subject), BA'),
('English, Professional and Technical Writing Concentration, BA'),
('Environmental Studies, BA'),
('Environmental Studies, BS'),
('Environmental Studies, Preparation for Teaching, BA'),
('Forensic Science, Biology Concentration, BS'),
('Forensic Science, Chemistry Concentration, BS'),
('Forensic Science, Crime Scene Investigation Concentration, BS'),
('Forensic Science, Digital Evidence Concentration, BS'),
('French, BA'),
('Geographic Information Science (GIS), BS'),
('Geography, BA'),
('Geology, BS'),
('Global Studies, BA'),
('Graphic Design, BFA'),
('History, BA'),
('Humanities, American Studies Concentration, BA'),
('Humanities, Liberal Arts Concentration, BA'),
('Humanities, Religious Studies Concentration, BA'),
('Industrial and Systems Engineering, BS'),
('Industrial Design, BS'),
('Information Science and Data Analytics, BS'),
('Information Science and Data Analytics, BS (SJSU Online)'),
('Interdisciplinary Engineering, BS'),
('Interdisciplinary Engineering, BS (SJSU Online) (Currently Not Accepting Students)'),
('Interdisciplinary Studies, Educational and Community Leadership Concentration, BA (SJSU Online)'),
('Interior Design, BFA'),
('Japanese, BA'),
('Journalism, BS'),
('Justice Studies, BS'),
('Justice Studies, Criminology Concentration, BS'),
('Kinesiology, BS'),
('Kinesiology, Preparation for Teaching, BS'),
('Liberal Studies, Integrated Teacher Education Program Spanish Bilingual, BA'),
('Liberal Studies, Integrated Teacher Education Program, BA'),
('Liberal Studies, Preparation for Teaching, BA'),
('Linguistics, BA'),
('Materials Engineering, BS'),
('Mathematics, BA'),
('Mathematics, Integrated Teacher Education Program, BA'),
('Mechanical Engineering, BS'),
('Meteorology, BS'),
('Music, BA'),
('Music, Composition Concentration, BM'),
('Music, Jazz Studies Concentration, BM'),
('Music, Music Education Concentration, BM'),
('Music, Performance Concentration, BM'),
('Nursing, BS'),
('Nursing, Concurrent Enrollment Program (CEP) ADN to BSN'),
('Nursing, RN to BSN Concentration, BSN'),
('Nutritional Science, Applied Nutrition and Food Sciences Concentration, BS'),
('Nutritional Science, Dietetics Concentration, BS'),
('Nutritional Science, Food Management Concentration, BS'),
('Organizational Studies, BA'),
('Packaging, BS'),
('Philosophy, BA'),
('Physics, BA'),
('Physics, BS'),
('Physics, Preparation for Teaching, BA'),
('Political Science, BA'),
('Psychology, BA'),
('Public Health, BS'),
('Public Health, BS (SJSU Online)'),
('Public Health, Concentration in Community Health Education, BS'),
('Public Health, Concentration in Population Data Science, BS'),
('Public Relations, BS'),
('Public Relations, BS (SJSU Online)'),
('Radio-Television-Film, BA'),
('Recreation, BS'),
('Recreation, Recreation Management Concentration, BS'),
('Recreation, Recreation Therapy Concentration, BS'),
('Social Science, Preparation for Teaching (Single Subject), BA'),
('Social Work, BA'),
('Sociology, BA'),
('Sociology, Community Change Concentration, BA'),
('Sociology, Race and Ethnic Studies Concentration, BA'),
('Sociology, Social Interaction Concentration, BA (Not Accepting Students)'),
('Software Engineering, BS'),
('Spanish, BA'),
('Statistics, BS '),
('Theatre Arts, BA'),
('Theatre Arts, Preparation for Teaching, BA (Not accepting students)'),
('Women, Gender, and Sexuality Studies, BA');

