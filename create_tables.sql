-- Create the students table
CREATE TABLE students (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

-- Create the buses table
CREATE TABLE buses (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

-- Create the incidents table
CREATE TABLE incidents (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

-- Add Row Level Security (RLS) policies to allow access
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- Create policies that allow anonymous access for the demo
CREATE POLICY "Allow anonymous access to students" ON students FOR ALL USING (true);
CREATE POLICY "Allow anonymous access to buses" ON buses FOR ALL USING (true);
CREATE POLICY "Allow anonymous access to incidents" ON incidents FOR ALL USING (true); 