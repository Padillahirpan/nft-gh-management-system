-- NFT Greenhouse Management System
-- Database initialization script for TimescaleDB

-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Create indexes for better query performance
-- (These will be created after Prisma migration, but listed here for reference)

-- Index for sensor_readings time-series queries
-- CREATE INDEX IF NOT EXISTS idx_sensor_readings_recorded_at ON sensor_readings(recorded_at DESC);

-- Index for alerts status filtering
-- CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);

-- Index for harvests by date
-- CREATE INDEX IF NOT EXISTS idx_harvests_harvest_date ON harvests(harvest_date DESC);

-- Create a view for active alerts
-- CREATE OR REPLACE VIEW active_alerts AS
-- SELECT * FROM alerts WHERE status = 'ACTIVE' ORDER BY created_at DESC;

-- Grant permissions (if using a separate app user)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO greenhouse_app;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO greenhouse_app;
