-- Migration: Add timer_duration column to games table
-- This migration adds support for custom timer durations per game

ALTER TABLE games ADD COLUMN timer_duration INTEGER DEFAULT 30;
