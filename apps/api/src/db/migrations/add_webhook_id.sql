-- Add webhook_id column to projects table for auto-registered webhooks
ALTER TABLE projects ADD COLUMN webhook_id INTEGER;
