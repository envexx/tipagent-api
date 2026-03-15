-- Add tasks field to projects table for owner's task descriptions
-- This helps AI agent understand what work should be rewarded and how much
ALTER TABLE projects ADD COLUMN tasks TEXT;
