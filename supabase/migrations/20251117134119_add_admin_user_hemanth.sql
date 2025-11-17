/*
  # Add Admin User

  This migration adds hemanth@securitysavvy.info to the user_profiles table with admin privileges.
  
  1. Changes
    - Insert user profile for hemanth@securitysavvy.info with correct user ID
    - Set role to 'admin'
    - Use ON CONFLICT to update role if profile already exists
  
  2. Security
    - User exists in auth.users table
    - RLS policies will apply to this admin user
    - Admin will have access to admin dashboard and management features
*/

-- Insert or update user profile with admin role
INSERT INTO user_profiles (id, role, full_name, created_at, updated_at)
VALUES (
  'ad67da06-f2bf-442c-93d2-bdfa52886023',
  'admin',
  'Hemanth',
  now(),
  now()
)
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'admin',
  full_name = 'Hemanth',
  updated_at = now();