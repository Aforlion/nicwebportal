# Database Schema - Membership Management System

This document outlines the integrated database schema for the NIC Membership Management System.

## Integration with Existing Schema

The membership system integrates with your existing database by:
- **Using existing `profiles` table** for user authentication and basic info
- **Extending existing `memberships` table** with additional member details
- **Adding 5 new tables** for payments, documents, CPD, disciplinary records, and applications

---

## Table Structure

### Existing Tables (Modified)

#### `profiles` (No changes)
- Already contains: `id`, `full_name`, `email`, `phone`, `role`, `avatar_url`
- Used for authentication and basic user information

#### `memberships` (Extended)
**New columns added:**
- `member_id` - Alternative to nic_id for consistency
- `status` - pending, active, suspended, expired
- `joined_date` - Date member joined
- `photo_url` - Member photo
- `address` - Residential address
- `date_of_birth` - Date of birth
- `gender` - Gender
- `qualification` - Professional qualifications
- `years_of_experience` - Years of experience
- `updated_at` - Last update timestamp

**Existing columns:**
- `id`, `user_id`, `category`, `nic_id`, `expiry_date`, `is_active`, `digital_card_url`, `created_at`

---

### New Tables

#### 1. `payments`
Tracks payment transactions and membership dues.

**Key columns:**
- `membership_id` → references `memberships(id)`
- `amount`, `payment_type`, `payment_method`
- `transaction_reference`, `status`
- `receipt_number`, `receipt_url`
- `period_start`, `period_end`

#### 2. `documents`
Stores uploaded member documents.

**Key columns:**
- `membership_id` → references `memberships(id)`
- `document_name`, `document_type`, `file_url`
- `status` (pending, verified, rejected)
- `verified_by` → references `profiles(id)`

#### 3. `cpd_activities`
Tracks Continuing Professional Development.

**Key columns:**
- `membership_id` → references `memberships(id)`
- `title`, `provider`, `activity_type`
- `points`, `duration_hours`, `activity_date`
- `status` (pending, approved, rejected)
- `reviewed_by` → references `profiles(id)`

#### 4. `disciplinary_records`
Admin-only compliance and disciplinary records.

**Key columns:**
- `membership_id` → references `memberships(id)`
- `incident_date`, `incident_type`, `severity`
- `action_taken`, `resolved`
- `reported_by`, `handled_by` → references `profiles(id)`

#### 5. `membership_applications`
New member applications pending approval.

**Key columns:**
- `full_name`, `email`, `phone`, `address`
- `membership_category` (uses existing enum)
- `status` (pending, approved, rejected)
- `reviewed_by` → references `profiles(id)`
- `payment_reference`, `payment_status`

---

## Relationships

```
profiles (existing)
    ↓
memberships (extended)
    ↓
    ├── payments
    ├── documents
    ├── cpd_activities
    └── disciplinary_records

membership_applications (standalone)
```

---

## Migration File

Run the migration file to update your database:

**File:** `supabase/migrations/001_membership_system.sql`

This migration:
1. ✅ Adds new columns to existing `memberships` table
2. ✅ Creates 5 new tables
3. ✅ Sets up indexes for performance
4. ✅ Configures Row Level Security (RLS) policies
5. ✅ Adds triggers for `updated_at` columns

---

## Row Level Security (RLS)

All tables have RLS enabled with policies:
- **Members** can view/edit their own data
- **Admins** can view/edit all data
- **Disciplinary records** are admin-only
- **Applications** can be created by anyone (public registration)

---

## Next Steps

1. Run the migration in Supabase SQL editor
2. Verify tables are created successfully
3. Test RLS policies with test users
4. Connect frontend to Supabase client
