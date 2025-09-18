WITH user_data AS (
	SELECT 'test_user_' || i::text as id,
		'Test User ' || i::text as name,
		'testuser' || i::text || '@example.com' as email,
		(
			ARRAY [
            'Computer Science, BS',
            'Software Engineering, BS',
            'Computer Engineering, BS',
            'Data Science, BS',
            'Applied Mathematics, Applied and Computational Mathematics Concentration, BS'
        ]
		) [floor(random() * 5 + 1)] as major,
		(ARRAY ['Undergraduate', 'Graduate']) [floor(random() * 2 + 1)]::education_level_enum as education_level,
		(CURRENT_DATE + (random() * 1000)::integer) as grad_date,
		ARRAY [(ARRAY[
            'Web Development',
            'Machine Learning',
            'Cloud Computing',
            'Artificial Intelligence',
            'Networking',
            'Cybersecurity',
            'Mobile Development',
            'Game Development',
            'Data Science'
        ]
) [floor(random() * 9 + 1)]::cs_fields_enum ] as interests,
'default.png' as profile_pic,
'https://linkedin.com' as linkedin,
'https://github.com' as github,
NULL::text as website,
CASE
	WHEN random() < 0.2 THEN 'admin'::user_role_enum
	WHEN random() < 0.5 THEN 'member'::user_role_enum
	ELSE 'user'::user_role_enum
END AS role
FROM generate_series(1, 50) i
)
INSERT INTO users (
		id,
		name,
		email,
		major,
		education_level,
		grad_date,
		interests,
		profile_pic,
		linkedin,
		github,
		website,
		role,
		paid
	)
SELECT id,
	name,
	email,
	major,
	education_level,
	grad_date,
	interests,
	profile_pic,
	linkedin,
	github,
	website,
	role,
	CASE
		WHEN role = 'member'
		OR role = 'admin' THEN (ARRAY ['Semester', 'Annual']) [floor(random() * 2 + 1)]::membership_term_enum
		ELSE NULL
	END AS paid
FROM user_data
WHERE NOT EXISTS (
		SELECT 1
		FROM users
		WHERE id = user_data.id
	);