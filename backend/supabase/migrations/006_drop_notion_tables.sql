-- Drop tables that are now handled by Notion
-- User data (habits, tasks, etc.) now lives in Notion

-- Drop habit-related tables
DROP TABLE IF EXISTS habit_completions CASCADE;
DROP TABLE IF EXISTS habit_sharing_requests CASCADE;
DROP TABLE IF EXISTS habits CASCADE;

-- Drop study/learning tables (move to Notion)
DROP TABLE IF EXISTS learning_progress CASCADE;
DROP TABLE IF EXISTS quiz_questions CASCADE;
DROP TABLE IF EXISTS quiz_sessions CASCADE;
DROP TABLE IF EXISTS study_materials CASCADE;

-- Drop activity/body tracking tables (move to Notion)
DROP TABLE IF EXISTS body_measurements CASCADE;
DROP TABLE IF EXISTS food_logs CASCADE;
DROP TABLE IF EXISTS activities CASCADE;

-- Drop routine tables (move to Notion)
DROP TABLE IF EXISTS morning_routine_logs CASCADE;
DROP TABLE IF EXISTS routine_completions CASCADE;
DROP TABLE IF EXISTS routine_step_logs CASCADE;

-- Drop old screen time tables (keep new simplified ones)
DROP TABLE IF EXISTS screen_time_goals CASCADE;
DROP TABLE IF EXISTS screentime_logs CASCADE;

-- Keep these tables (real-time/technical data):
-- - notifications
-- - screen_time_summaries (new simplified version)
-- - distraction_events
-- - conversation_history
-- - oauth_tokens
-- - wake_detection_logs
-- - user_profiles (simplified version)
