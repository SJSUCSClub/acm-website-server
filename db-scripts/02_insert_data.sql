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

INSERT INTO users (
    id, name, email, major, education_level, grad_date, interests, profile_pic, linkedin, github, website, role, paid 
) VALUES 
('user1', 'Alice Smith', 'alice.smith@example.com', 'Aerospace Engineering, BS', 'Undergraduate', '2025-05-15', 
  '{"Web Development", "Machine Learning"}', 'default.png', 'https://linkedin.com', 'https://github.com', NULL, 'user', NULL),
('user2', 'Bob Johnson', 'bob.johnson@example.com', 'Chemistry, BA', 'Graduate', '2022-12-10', 
  '{"Networking", "Cybersecurity"}', 'default.png', 'https://linkedin.com', 'https://github.com', NULL, 'user', NULL),
('user3', 'Charlie Brown', 'charlie.brown@example.com', 'History, BA', 'Undergraduate', '2026-08-30', 
  '{"Mobile Development", "Game Development"}', 'default.png', 'https://www.linkedin.com', NULL, 'https://www.bing.com/', 'user', NULL),
('user4', 'Diana Evans', 'diana.evans@example.com', 'Computer Science, BS', 'Graduate', '2023-11-01', 
  '{"Artificial Intelligence"}', 'default.png', 'https://linkedin.com', 'https://github.com', NULL, 'user', NULL),
('user5', 'Evan Wright', 'evan.wright@example.com', 'Philosophy, BA', 'Undergraduate', '2025-04-20', 
  '{"Data Science", "Cloud Computing"}', 'default.png', NULL, 'https://github.com', 'https://www.google.com/', 'user', NULL);

insert into files(key, name) values
('default/image-placeholder.svg', 'Default Image'),
('events/2/image.png', 'image'),
('companies/1/logo.png', 'Microsoft Logo'),
('companies/2/logo.jpg', 'JPMorgan Chase Logo'),
('companies/3/logo.png', 'Boeing Logo'),
('companies/4/logo.jpeg', 'Johnson & Johnson Logo'),
('companies/5/logo.jpg', 'ExxonMobil Logo'),
('spotlights/1/image.webp', 'Spotlight Image'),
('spotlights/2/image.webp', 'Spotlight Image'),
('spotlights/3/image.webp', 'Spotlight Image'),
('projects/2/files/README.md', 'README.md'),
('officers/1/pfp.png', 'Karthik Pfp'),
('officers/2/pfp.png', 'Shirley Pfp'),
('officers/3/pfp.png', 'Angela Pfp'),
('officers/4/pfp.png', 'Bineet Pfp'),
('officers/5/pfp.png', 'Anne Pfp'),
('officers/6/pfp.png', 'Timothy Pfp'),
('officers/7/pfp.png', 'Trique Pfp'),
('officers/8/pfp.png', 'Galit Pfp');

-- Insert company 1
INSERT INTO companies (name, location, description, industry_id, logo) values
('Microsoft', 'Redmond, WA', 'An American technology giant that develops software, personal computers, and consumer electronics. Known for its Windows operating system and Office software suite.', 'Technology', 'companies/1/logo.png'),
('JPMorgan Chase', 'New York City, NY', 'A multinational bank and financial services holding company.', 'Banking and Finance', 'companies/2/logo.jpg'),
('Boeing', 'Chicago, IL', 'A multinational corporation that designs, manufactures, and sells airplanes, rotorcraft, rockets, and satellites.', 'Aerospace', 'companies/3/logo.png'),
('Johnson & Johnson', 'New Brunswick, NJ', 'A multinational healthcare company that develops medical devices, pharmaceuticals, and consumer packaged goods.', 'Healthcare', 'companies/4/logo.jpeg'),
('ExxonMobil', 'Irving, TX', 'A multinational oil and gas corporation that explores, produces, and sells crude oil, natural gas, and petroleum products.', 'Energy', 'companies/5/logo.jpg');

INSERT INTO projects (name, description, github_link, status) values
('ACM@SJSU Website', 'A user portal for ACM@SJSU members to manage their profiles, events, and projects.', 'https://github.com/SJSUCSClub/acm-website-server', 'In Progress'),
('Lenses', 'A review platform that allows users to rate and review professors and courses at SJSU.', 'https://github.com/SJSUCSClub/course-scheduling', 'Completed'),
('File Sharing', 'End to end encyrpted file sharing platform for ACM@SJSU members.', 'https://github.com/SJSUCSClub/e2ee-file-sharing', 'In Progress');

INSERT INTO projects_files(project_id, file_key) VALUES
('2', 'projects/2/files/README.md');

-- Insert event 1
INSERT INTO events (
    name, location, start_date, end_date, description, event_type, 
    event_capacity, start_time, end_time, tags, target_audience, member_only, image
) 
VALUES (
    'Tech Conference 2024', 'San Francisco, CA', '2024-11-01', '2024-11-03', 
    'A three-day conference on the latest in technology and innovation.', 
    'Conference', 500, '09:00', '17:00', 
    '{"Artificial Intelligence", "Machine Learning"}', 'Students', false, null
),
('Hackathon 2024', 'New York, NY', '2024-12-10', '2024-12-12', 
    'A 48-hour hackathon focused on software development and innovation.', 
    'Hackathon', 300, '08:00', '20:00', 
    '{"Networking"}', 'Students', false, 'events/2/image.png'
),
(
    'Data Science Workshop', 'Boston, MA', '2024-09-15', '2024-09-15', 
    'A one-day workshop on data science fundamentals and techniques.', 
    'Workshop', 150, '10:00', '16:00', 
    '{"Data Science"}', 'Students', true, null
),
(
  'ACM x Tesla Tech Talk', 'Online', '2024-09-15', '2024-09-15', 'Guest speaker Phuc Ngo, an NLP and Senior Data Engineer at Tesla, talks about his experiences and journey in the industry.', 'Tech Talk', null, '17:00', '18:00', '{"Machine Learning", "Data Science"}', 'Students', false, null),
('Google Alumni Panel', 'San Jose, CA', '2023-08-15', '2023-08-15', 'ACM hosted a Q&A panel with SJSU alumni who are now working at Google. Members had the opportunity to gain insight into the technical interview process and what a typical workday at Google looks like, as well as network with panelists.', 'Other', null, '17:00', '18:00', '{"Networking"}', 'Students', false, null),
(
 'Google Cloud Hero', 'Mountain View, CA', '2023-10-12', '2023-10-12', 'Cloud Hero gets a room full of people competing head-to-head, with a live play-by-play leaderboard and lots of prizes. To date, over 1,000 players have played Cloud Hero at 12 public events like Google Cloud Next and Google Cloud Summits—with more venues on the way!', 'Workshop', null, '17:00', '18:00', '{"Cloud Computing"}', 'Students', true, null
);

INSERT INTO event_companies(event_id, company_id) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(2, 1),
(2, 3),
(2, 4),
(3, 5),
(3, 3);

INSERT INTO subscribed_events(user_id, event_id) VALUES
('user1', 1),
('user1', 2),
('user2', 1),
('user2', 3),
('user4', 2),
('user4', 1),
('user3', 3),
('user5', 1),
('user5', 2),
('user5', 3);

INSERT INTO subscribed_companies(user_id, company_id) VALUES
('user1', 1),
('user1', 2),
('user1', 5),
('user2', 1),
('user2', 2),
('user2', 3),
('user2', 4),
('user2', 5),
('user3', 2),
('user3', 4),
('user3', 5),
('user4', 3),
('user4', 4),
('user4', 5);

INSERT INTO interested_in_projects(user_id, project_id) VALUES
('user1', 1),
('user1', 3),
('user2', 2),
('user3', 1),
('user3', 2),
('user3', 3),
('user5', 2),
('user5', 3);

INSERT INTO equipment_rental_type (name, price, description) VALUES
('Laptop Rental', 150.00, 'High-performance laptop rental for projects or events.'),
('Projector Rental', 80.00, 'HD projector rental for presentations or meetings.'),
('Camera Rental', 120.00, 'Professional DSLR camera rental for photography.'),
('VR Headset Rental', 100.00, 'Virtual reality headset rental for gaming or events.'),
('Tablet Rental', 50.00, NULL);

INSERT INTO equipment_item(equipment_type) VALUES
(1),
(1),
(1),
(1),
(1),
(1),
(1),
(2),
(2),
(2),
(3),
(3),
(3),
(3),
(3),
(4),
(4),
(5),
(5),
(5),
(5),
(5);

INSERT INTO sponsors VALUES
('Kohls', 'sponsors/kohls/logo.png'),
('Google', 'sponsors/google/logo.png'),
('Tesla', 'sponsors/tesla/logo.png'),
('FetchAI', 'sponsors/fetchai/logo.png');

INSERT INTO club_links(instagram, discord, linkedin, member_application) VALUES
('https://www.instagram.com/sjsuacm/', 'https://discord.gg/Rw85ngkExu', 'https://www.linkedin.com/company/sjsu-computer-science-club/about/', 'https://docs.google.com/forms/d/e/1FAIpQLSfNBu-IGm7bhUmMf2cSOmNca3SiJZyVRzPBVTVOYVBNZIyeYA/viewform?pli=1');

INSERT INTO landing_spotlights(event_id, image_key) VALUES
(4, 'spotlights/1/image.webp'),
(5, 'spotlights/2/image.webp'),
(6, 'spotlights/3/image.webp');

INSERT INTO landing_questions(question, answer) VALUES
($$Who's allowed to join this club?$$, $$ACM@SJSU is open to all SJSU students, regardless of their major!$$),
($$What are the rules of the club?$$, $$Be respectful, keep the clubroom clean, and have fun!$$),
($$Is there a membership fee for the club?$$, $$Yes. It's $20 for 1 semester or $30 for 2 semesters$$),
($$What do I get for a paid membership?$$, $$Paid members are invited to attend exclusive networking sessions, tech talks, and company events. We collaborate with many industry leaders, including Google, Tesla, and Nvidia, so don''t miss out!$$);

INSERT INTO users (
    id, name, email, major, education_level, grad_date, interests, profile_pic, linkedin, github, website, role, paid 
) VALUES 
('Karthik Manishankar', 'Karthik Manishankar', 'karthik.manishankar@sjsu.edu', 'Undeclared', 'Undergraduate', '2025-05-15', '{}', 'officers/1/pfp.png', 'https://www.linkedin.com/in/karthikmanishankar/', 'https://github.com/placeholder', NULL, 'user', NULL),
('Shirley Li', 'Shirley Li', 'shirley.li@sjsu.edu', 'Undeclared', 'Undergraduate', '2025-05-15', '{}', 'officers/2/pfp.png', 'https://www.linkedin.com/in/shirley-shuhua-li', 'https://github.com/placeholder', NULL, 'user', NULL),
('Angela Huang', 'Angela Huang', 'angela.huang@sjsu.edu', 'Undeclared', 'Undergraduate', '2025-05-15', '{}', 'officers/3/pfp.png', 'https://www.linkedin.com/in/angela-huang-725a25169/', 'https://github.com/placeholder', NULL, 'user', NULL),
('Bineet Anand', 'Bineet Anand', 'bineet.anand@sjsu.edu', 'Undeclared', 'Undergraduate', '2025-05-15', '{}', 'officers/4/pfp.png', 'https://www.linkedin.com/in/bineet-anand/', 'https://github.com/placeholder', NULL, 'user', NULL),
('Anne Mai', 'Anne Mai', 'anne.mai@sjsu.edu', 'Undeclared', 'Undergraduate', '2025-05-15', '{}', 'officers//pfp.png', 'https://www.linkedin.com/in/annepmai/', 'https://github.com/placeholder', NULL, 'user', NULL),
('Timothy Kim', 'Timothy Kim', 'timothy.kim@sjsu.edu', 'Undeclared', 'Undergraduate', '2025-05-15', '{}', 'officers/6/pfp.png', 'https://www.linkedin.com/in/timothy-kim712/', 'https://github.com/placeholder', NULL, 'user', NULL),
('Trique Nguyen', 'Trique Nguyen', 'trique.nguyen@sjsu.edu', 'Undeclared', 'Undergraduate', '2025-05-15', '{}', 'officers/7/pfp.png', 'https://www.linkedin.com/in/trique-nguyen/', 'https://github.com/placeholder', NULL, 'user', NULL),
('Galit Bolotin', 'Galit Bolotin', 'galit.bolotin@sjsu.edu', 'Undeclared', 'Undergraduate', '2025-05-15', '{}', 'officers/8/pfp.png', 'https://www.linkedin.com/in/gbolotin/', 'https://github.com/placeholder', NULL, 'user', NULL);
INSERT INTO officers(user_id, position, linkedin, photo) VALUES
('Karthik Manishankar', 'President', 'https://www.linkedin.com/in/karthikmanishankar/', 'officers/1/pfp.png'),
('Shirley Li', 'Vice President', 'https://www.linkedin.com/in/shirley-shuhua-li', 'officers/2/pfp.png'),
('Angela Huang', 'Secretary', 'https://www.linkedin.com/in/angela-huang-725a25169/', 'officers/3/pfp.png'),
('Bineet Anand', 'Social Media Manager', 'https://www.linkedin.com/in/bineet-anand/', 'officers/4/pfp.png'),
('Anne Mai', 'Event Chair', 'https://www.linkedin.com/in/annepmai/', 'officers/5/pfp.png'),
('Timothy Kim', 'Treasurer', 'https://www.linkedin.com/in/timothy-kim712/', 'officers/6/pfp.png'),
('Trique Nguyen', 'Dev Team Officer', 'https://www.linkedin.com/in/trique-nguyen/', 'officers/7/pfp.png'),
('Galit Bolotin', 'Event Chair', 'https://www.linkedin.com/in/gbolotin/', 'officers/8/pfp.png');



