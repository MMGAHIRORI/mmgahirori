# Temporary User Account System

This system provides a secure way to create the initial admin user for your application through a temporary, limited-privilege account.

## Overview

The temporary user account system allows you to:
- Create a temporary user with limited privileges
- Use that temporary account to create exactly one permanent admin user
- Automatically disable the temporary account after use or expiration

## Features

### Temporary User Account
- **Username**: Sangam
- **Email**: mmgahirori@gmail.com  
- **Password**: Admin@123
- **Role**: `temp_admin_creator`
- **Expiration**: 24 hours after creation
- **Privileges**: Can only create one admin user, no other system access

### Security Features
- ✅ Automatic expiration in 24 hours
- ✅ Can only create exactly one admin user
- ✅ No read/write access to system content
- ✅ Account is disabled after admin creation
- ✅ Cannot be renewed or extended

## Setup Instructions

### 1. Database Migration

First, run the database migration to add the necessary columns:

```sql
-- Run this in your Supabase SQL editor
-- File: src/database/migrations/add_temp_user_fields.sql

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS admin_created BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- (See full migration script for complete setup)
```

### 2. Access the Setup Flow

Navigate to the temporary user setup page in your browser:

```
http://localhost:8080/temp-setup
```

### 3. Create Temporary Account

1. The form will be pre-filled with the specified credentials:
   - **Username**: Sangam
   - **Email**: mmgahirori@gmail.com
   - **Password**: Admin@123

2. Click "Create Temporary Account"

3. You'll be redirected to the login page after successful creation

### 4. Login to Temporary Account

1. Go to: `http://localhost:8080/temp-login`
2. Enter the credentials you just created
3. Click "Login to Temporary Account"

### 5. Create Admin User

1. You'll be taken to the temporary user dashboard
2. Fill out the admin creation form with:
   - Full Name for the admin user
   - Email address for the admin user  
   - Secure password for the admin user
   - Confirm the password

3. Click "Create Permanent Admin User"

4. The admin user will be created with full system privileges
5. The temporary account is automatically disabled

## Routes

The following routes are available:

- `/temp-setup` - Initial temporary user creation page
- `/temp-login` - Login page for temporary users
- `/temp-dashboard` - Dashboard for temporary users to create admin

## Admin Privileges

The created admin user will have:
- ✅ Full system administration access
- ✅ User management and permissions
- ✅ Content management (events, gallery)
- ✅ System settings configuration
- ✅ Live stream management

## Technical Implementation

### Files Created/Modified

1. **Services**:
   - `src/integrations/supabase/tempUsers.ts` - Temporary user management service

2. **Components**:
   - `src/components/AdminCreationForm.tsx` - Form for creating admin user
   - `src/pages/TempUserSetup.tsx` - Initial setup page
   - `src/pages/TempUserLogin.tsx` - Temporary user login
   - `src/pages/TempUserDashboard.tsx` - Temporary user dashboard

3. **Database**:
   - `src/database/migrations/add_temp_user_fields.sql` - Database migration
   - Updated `src/integrations/supabase/types.ts` - TypeScript types

4. **Routing**:
   - Updated `src/App.tsx` - Added new routes

### Database Schema Changes

Added columns to `user_profiles` table:
- `admin_created` - Boolean flag tracking if admin was created
- `expires_at` - Timestamp for account expiration

## Security Considerations

### Limitations Enforced
1. **Single Use**: Can only create one admin user
2. **Time Limited**: Expires in 24 hours
3. **No System Access**: Cannot read or modify system content
4. **Auto-Disable**: Account disabled after admin creation
5. **No Privilege Escalation**: Cannot grant itself additional permissions

### Best Practices
1. Run the initial setup immediately after deployment
2. Use strong credentials for the admin user you create
3. Delete/disable the temporary account records from the database after successful setup
4. Monitor for any expired temporary accounts

## Troubleshooting

### Common Issues

1. **Migration Failed**: Ensure you have proper database permissions
2. **Account Expired**: Temporary accounts expire in 24 hours - create a new one
3. **Already Used**: Each temporary account can only create one admin
4. **Login Failed**: Verify the credentials match what was used during creation

### Error Messages

- "Temporary user has expired" - Create a new temporary account
- "This temporary user has already created an admin user" - Use regular admin login
- "No temporary user profile found" - Ensure you're logged in with temp account

## Next Steps After Setup

1. Login with your new admin credentials at `/admin-login`
2. Access the full admin dashboard at `/admin`
3. Configure additional system settings as needed
4. Create additional users through the admin panel
5. Remove the temporary user records from the database

## Development Notes

The temporary user system is designed for initial setup only. For production deployments, consider:

1. Adding additional validation
2. Implementing audit logging
3. Adding email verification for the admin user
4. Setting up proper monitoring for expired accounts

---

**Important**: This is a one-time setup system. Once your admin user is created, you should use the regular admin authentication flow for all future access.
