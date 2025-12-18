-- Competitions feature migration
-- Create competitions and competition_participants tables

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS competition_participants CASCADE;
DROP TABLE IF EXISTS competitions CASCADE;

-- competitions table
CREATE TABLE competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  max_participants INTEGER,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- competition_participants table
CREATE TABLE competition_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER,
  rank INTEGER,
  time_taken INTEGER, -- seconds
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- One attempt per student per competition
  CONSTRAINT unique_student_competition UNIQUE (competition_id, student_id)
);

-- Indexes for performance
CREATE INDEX idx_competitions_start_time ON competitions(start_time);
CREATE INDEX idx_competitions_end_time ON competitions(end_time);
CREATE INDEX idx_competitions_published ON competitions(published) WHERE published = true;
CREATE INDEX idx_competitions_test ON competitions(test_id);
CREATE INDEX idx_competition_participants_competition ON competition_participants(competition_id);
CREATE INDEX idx_competition_participants_student ON competition_participants(student_id);
CREATE INDEX idx_competition_participants_rank ON competition_participants(competition_id, rank) WHERE rank IS NOT NULL;

-- RLS Policies
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_participants ENABLE ROW LEVEL SECURITY;

-- Students view published competitions only
CREATE POLICY "Students view published competitions"
  ON competitions FOR SELECT
  TO authenticated
  USING (published = true);

-- Admins manage all competitions
CREATE POLICY "Admins manage competitions"
  ON competitions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Students can view all participations (for leaderboard and checking join status)
CREATE POLICY "Students view participations"
  ON competition_participants FOR SELECT
  TO authenticated
  USING (true);

-- Students insert own participation
CREATE POLICY "Students insert own participation"
  ON competition_participants FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

-- Students update own participation (for score)
CREATE POLICY "Students update own participation"
  ON competition_participants FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- Admins view all participations
CREATE POLICY "Admins view all participations"
  ON competition_participants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Function to update ranks after submission
DROP FUNCTION IF EXISTS update_competition_ranks(uuid);

CREATE OR REPLACE FUNCTION update_competition_ranks(comp_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE competition_participants
  SET rank = subquery.new_rank
  FROM (
    SELECT 
      id,
      RANK() OVER (
        ORDER BY score DESC, time_taken ASC, completed_at ASC
      ) as new_rank
    FROM competition_participants
    WHERE competition_id = comp_id
      AND completed_at IS NOT NULL
      AND score IS NOT NULL
  ) AS subquery
  WHERE competition_participants.id = subquery.id
    AND competition_participants.competition_id = comp_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
