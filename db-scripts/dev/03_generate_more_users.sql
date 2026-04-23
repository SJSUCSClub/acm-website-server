\c acm_website

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
	ELSE 'user'::user_role_enum
END AS role
FROM generate_series(1, 50) i
),
inserted_users AS (
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
		role
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
    role
  FROM user_data
  WHERE NOT EXISTS (
      SELECT 1
      FROM users
      WHERE id = user_data.id
    )
  RETURNING id
)
INSERT INTO user_system_notification_preferences(user_id, system_notification_id)
SELECT u.id, sn.id
FROM inserted_users u
CROSS JOIN system_notifications sn
ON CONFLICT DO NOTHING;
