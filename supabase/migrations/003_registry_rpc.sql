-- ============================================
-- Registry Statistics Function
-- ============================================

CREATE OR REPLACE FUNCTION get_registry_stats()
RETURNS JSONB AS $$
DECLARE
    total_count BIGINT;
    active_count BIGINT;
    suspended_count BIGINT;
    revoked_count BIGINT;
    under_review_count BIGINT;
    result JSONB;
BEGIN
    -- Total count
    SELECT COUNT(*) INTO total_count FROM memberships;
    
    -- Active count (is_active = true)
    SELECT COUNT(*) INTO active_count FROM memberships WHERE is_active = true;
    
    -- Suspended count
    SELECT COUNT(*) INTO suspended_count FROM memberships WHERE compliance_status = 'suspended';
    
    -- Revoked count
    SELECT COUNT(*) INTO revoked_count FROM memberships WHERE compliance_status = 'revoked';
    
    -- Under Review count
    SELECT COUNT(*) INTO under_review_count FROM memberships WHERE compliance_status = 'under_review';
    
    -- Build JSON result
    result := jsonb_build_object(
        'total', total_count,
        'active', active_count,
        'suspended', suspended_count,
        'revoked', revoked_count,
        'underReview', under_review_count
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
