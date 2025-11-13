-- ============================================================================
-- Route Calculator Database Schema
-- PostgreSQL 12+
-- ============================================================================

-- Drop existing tables if they exist (for clean reinstall)
DROP TABLE IF EXISTS edge_attributes CASCADE;
DROP TABLE IF EXISTS edges CASCADE;
DROP TABLE IF EXISTS time_periods CASCADE;
DROP TABLE IF EXISTS transport_types CASCADE;
DROP TABLE IF EXISTS vertices CASCADE;
DROP VIEW IF EXISTS v_route_options CASCADE;
DROP FUNCTION IF EXISTS get_edge_weight CASCADE;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Vertices/Nodes table - represents locations in the network
CREATE TABLE vertices (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    vertex_type VARCHAR(50), -- e.g., 'bus_stop', 'intersection', 'landmark'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(latitude, longitude)
);

COMMENT ON TABLE vertices IS 'Locations/nodes in the transportation network';
COMMENT ON COLUMN vertices.latitude IS 'Latitude coordinate in decimal degrees';
COMMENT ON COLUMN vertices.longitude IS 'Longitude coordinate in decimal degrees';

-- Transportation types lookup table
CREATE TABLE transport_types (
    id SERIAL PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    avg_speed_kmh DECIMAL(5, 2)
);

COMMENT ON TABLE transport_types IS 'Available transportation methods';
COMMENT ON COLUMN transport_types.avg_speed_kmh IS 'Average speed in kilometers per hour';

-- Time periods lookup table
CREATE TABLE time_periods (
    id SERIAL PRIMARY KEY,
    period_name VARCHAR(50) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    days_of_week VARCHAR(20)
);

COMMENT ON TABLE time_periods IS 'Time periods for time-dependent routing (rush hour, etc.)';
COMMENT ON COLUMN time_periods.days_of_week IS 'e.g., Mon-Fri, Sat-Sun, All';

-- Main edges table - represents PHYSICAL connections between vertices
CREATE TABLE edges (
    id SERIAL PRIMARY KEY,
    vertex_start_id INTEGER NOT NULL REFERENCES vertices(id) ON DELETE CASCADE,
    vertex_end_id INTEGER NOT NULL REFERENCES vertices(id) ON DELETE CASCADE,
    transport_type_id INTEGER NOT NULL REFERENCES transport_types(id),
    
    -- Static/structural metadata
    is_bidirectional BOOLEAN DEFAULT TRUE,
    route_name VARCHAR(255),
    accessibility_level INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(vertex_start_id, vertex_end_id, transport_type_id),
    CHECK (vertex_start_id != vertex_end_id)
);

COMMENT ON TABLE edges IS 'Physical connections/paths between vertices in the network';
COMMENT ON COLUMN edges.is_bidirectional IS 'Can this path be traversed in both directions?';
COMMENT ON COLUMN edges.accessibility_level IS '0-5 rating for wheelchair/disability access';

-- Edge attributes/weights - stores time-varying properties
CREATE TABLE edge_attributes (
    id SERIAL PRIMARY KEY,
    edge_id INTEGER NOT NULL REFERENCES edges(id) ON DELETE CASCADE,
    time_period_id INTEGER REFERENCES time_periods(id) ON DELETE CASCADE,
    
    -- Weight attributes
    weight_distance DECIMAL(10, 2) NOT NULL,
    weight_cost DECIMAL(10, 2) DEFAULT 0.00,
    weight_time INTEGER NOT NULL,
    
    -- Optional condition-based attributes
    weather_condition VARCHAR(50),
    traffic_level VARCHAR(50),
    
    -- Validity period
    valid_from DATE,
    valid_until DATE,
    
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(edge_id, time_period_id, weather_condition, traffic_level),
    CHECK (weight_distance >= 0),
    CHECK (weight_cost >= 0),
    CHECK (weight_time >= 0)
);

COMMENT ON TABLE edge_attributes IS 'Time-varying weights/costs for edges';
COMMENT ON COLUMN edge_attributes.weight_distance IS 'Distance in meters';
COMMENT ON COLUMN edge_attributes.weight_cost IS 'Cost in local currency';
COMMENT ON COLUMN edge_attributes.weight_time IS 'Travel time in seconds';
COMMENT ON COLUMN edge_attributes.weather_condition IS 'e.g., normal, rain, snow, fog';
COMMENT ON COLUMN edge_attributes.traffic_level IS 'e.g., light, moderate, heavy';

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_edges_start ON edges(vertex_start_id);
CREATE INDEX idx_edges_end ON edges(vertex_end_id);
CREATE INDEX idx_edges_transport_type ON edges(transport_type_id);
CREATE INDEX idx_edges_bidirectional ON edges(is_bidirectional);
CREATE INDEX idx_vertices_location ON vertices(latitude, longitude);
CREATE INDEX idx_edge_attributes_edge ON edge_attributes(edge_id);
CREATE INDEX idx_edge_attributes_period ON edge_attributes(time_period_id);
CREATE INDEX idx_edge_attributes_active ON edge_attributes(is_active);
CREATE INDEX idx_edge_attributes_valid ON edge_attributes(valid_from, valid_until);

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View for querying routes with current/specified attributes
CREATE VIEW v_route_options AS
SELECT 
    e.id as edge_id,
    vs.id as start_vertex_id,
    vs.name as start_location,
    vs.latitude as start_lat,
    vs.longitude as start_lng,
    ve.id as end_vertex_id,
    ve.name as end_location,
    ve.latitude as end_lat,
    ve.longitude as end_lng,
    tt.type_name as transport_type,
    e.route_name,
    e.is_bidirectional,
    e.accessibility_level,
    ea.weight_distance,
    ea.weight_cost,
    ea.weight_time,
    tp.period_name,
    tp.start_time,
    tp.end_time,
    tp.days_of_week,
    ea.weather_condition,
    ea.traffic_level,
    ea.valid_from,
    ea.valid_until,
    ea.is_active
FROM edges e
JOIN vertices vs ON e.vertex_start_id = vs.id
JOIN vertices ve ON e.vertex_end_id = ve.id
JOIN transport_types tt ON e.transport_type_id = tt.id
JOIN edge_attributes ea ON e.id = ea.edge_id
LEFT JOIN time_periods tp ON ea.time_period_id = tp.id
WHERE ea.is_active = TRUE
    AND (ea.valid_from IS NULL OR ea.valid_from <= CURRENT_DATE)
    AND (ea.valid_until IS NULL OR ea.valid_until >= CURRENT_DATE);

COMMENT ON VIEW v_route_options IS 'Available routes with all attributes for easy querying';

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to get edge attributes for a specific time and conditions
CREATE OR REPLACE FUNCTION get_edge_weight(
    p_edge_id INTEGER,
    p_time TIME DEFAULT CURRENT_TIME,
    p_day VARCHAR(10) DEFAULT TO_CHAR(CURRENT_DATE, 'Dy'),
    p_weather VARCHAR(50) DEFAULT 'normal',
    p_traffic VARCHAR(50) DEFAULT 'light'
)
RETURNS TABLE (
    distance DECIMAL(10,2),
    cost DECIMAL(10,2),
    time_seconds INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ea.weight_distance,
        ea.weight_cost,
        ea.weight_time
    FROM edge_attributes ea
    LEFT JOIN time_periods tp ON ea.time_period_id = tp.id
    WHERE ea.edge_id = p_edge_id
        AND ea.is_active = TRUE
        AND (ea.weather_condition IS NULL OR ea.weather_condition = p_weather)
        AND (ea.traffic_level IS NULL OR ea.traffic_level = p_traffic)
        AND (
            tp.id IS NULL OR
            (p_time BETWEEN tp.start_time AND tp.end_time 
             AND (tp.days_of_week = 'All' OR POSITION(p_day IN tp.days_of_week) > 0))
        )
        AND (ea.valid_from IS NULL OR ea.valid_from <= CURRENT_DATE)
        AND (ea.valid_until IS NULL OR ea.valid_until >= CURRENT_DATE)
    ORDER BY 
        CASE WHEN ea.time_period_id IS NOT NULL THEN 1 ELSE 2 END,
        CASE WHEN ea.weather_condition IS NOT NULL THEN 1 ELSE 2 END,
        CASE WHEN ea.traffic_level IS NOT NULL THEN 1 ELSE 2 END
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_edge_weight IS 'Get the best matching edge attributes for given conditions';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to edges
CREATE TRIGGER update_edges_updated_at
    BEFORE UPDATE ON edges
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to edge_attributes
CREATE TRIGGER update_edge_attributes_updated_at
    BEFORE UPDATE ON edge_attributes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- GRANT PERMISSIONS (uncomment if using specific user)
-- ============================================================================

-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO routeuser;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO routeuser;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO routeuser;
