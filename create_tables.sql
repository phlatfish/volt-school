CREATE TABLE students (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

CREATE TABLE buses (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

CREATE TABLE incidents (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous access to students" ON students FOR ALL USING (true);
CREATE POLICY "Allow anonymous access to buses" ON buses FOR ALL USING (true);
CREATE POLICY "Allow anonymous access to incidents" ON incidents FOR ALL USING (true); 
