ALTER TABLE employees
DROP COLUMN IF EXISTS age;

ALTER TABLE employees
ADD COLUMN age INTEGER GENERATED ALWAYS AS (date_part('year', age(birth_date))) STORED;

ALTER TABLE employees
RENAME COLUMN semi_formal_photo_url TO avatar_url;