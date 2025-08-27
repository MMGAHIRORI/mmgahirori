# Database Migration Instructions

## Overview
This migration adds new features to the Admin Panel for Event and Live Stream Management:

1. **Home Page Event Display**: Events now automatically appear on the home page if they are today or in the future
2. **Photo Home Page Display**: Photos can be marked to show on the home page via a checkbox
3. **Live Stream Visibility Control**: Live stream section only shows when actively streaming
4. **Operator Role Support**: New operator role with granular permissions
5. **Automatic Event Cleanup**: Past events are automatically hidden/deleted

## Database Changes Required

### Step 1: Apply the Migration

**Option A: Use the Minimal Migration (Recommended)**
If you encounter syntax errors, use this safer approach:

```sql
-- Copy and execute the contents of: src/database/migrations/minimal_table_updates.sql
```

**Option B: Use the Full Migration**
If you want to include RLS policies, use the step-by-step approach:

```sql
-- Copy and execute the contents of: src/database/migrations/add_home_page_features_safe.sql
```

The minimal migration includes:
- Add `show_on_home_page` field to `gallery_photos` table
- Add operator permission fields to `user_profiles` table
- Create performance indexes
- Set default permissions for existing users

**If you get a syntax error about 'IF NOT EXISTS' with policies:**
1. Use the minimal migration first
2. RLS policies can be added manually later if needed

### Step 2: Verify Tables
Check that the following fields have been added:

**gallery_photos table:**
- `show_on_home_page` (boolean, default: false)

**user_profiles table:**
- `can_manage_events` (boolean, default: false)
- `can_manage_gallery` (boolean, default: false) 
- `can_manage_livestream` (boolean, default: false)
- `can_edit_profile` (boolean, default: true)

## New Features Added

### 1. Event Management
- **Home Page Display**: Events automatically appear on home page if date is today or future
- **Automatic Cleanup**: Past events are automatically removed daily at midnight
- **Manual Cleanup**: Admin can manually cleanup past events via "Cleanup Past Events" button

### 2. Gallery Management
- **Show on Home Page**: New checkbox in photo upload/edit form
- **Home Page Gallery**: New section on home page showing selected photos
- **Enhanced Display**: Photos marked for home page appear in dedicated home page gallery section

### 3. Live Stream Management
- **Conditional Display**: Live stream section only shows when `is_live = true`
- **Auto Hide**: When stream is stopped, section automatically disappears from home page

### 4. User Management & Permissions
- **Operator Role**: New role between admin and user
- **Granular Permissions**: Operators can be assigned specific management permissions
- **Profile Restrictions**: Operators cannot edit their own profile or password
- **Permission Matrix**:
  - **Admin**: All permissions (events, gallery, live stream, profile edit)
  - **Operator**: Customizable permissions (events, gallery, live stream), cannot edit profile
  - **User**: No management permissions

## Testing the Features

### Test Event Display
1. Create a new event with today's or future date
2. Check that it appears on both Events page and Home page
3. Create an event with past date
4. Verify it only shows in admin panel and gets cleaned up

### Test Photo Home Page Display
1. Upload a new photo
2. Check "Show on Home Page" checkbox
3. Verify photo appears in Home page gallery section
4. Uncheck the box and verify photo is removed from home page

### Test Live Stream Visibility
1. Go to Admin Live Stream management
2. Toggle stream status ON
3. Check home page has live stream section
4. Toggle stream status OFF
5. Verify live stream section disappears from home page

### Test Operator Role
1. Create new user with "Operator" role
2. Assign specific permissions (e.g., only events management)
3. Test operator cannot access areas they don't have permission for
4. Verify operator cannot edit their profile

## Automatic Background Processes

### Event Cleanup Service
- **Schedule**: Runs daily at midnight
- **Function**: Automatically deletes events with dates before today
- **Initialization**: Starts when app loads
- **Manual Trigger**: Available in Admin Events page

## File Changes Made

### Database
- `src/database/migrations/add_home_page_features.sql` - Migration script
- `src/integrations/supabase/types.ts` - Updated TypeScript types

### Components
- `src/components/LiveKatha.tsx` - Conditional display based on live status
- `src/pages/Home.tsx` - Added upcoming events and home gallery sections
- `src/pages/Events.tsx` - Enhanced filtering for upcoming events
- `src/pages/Gallery.tsx` - Updated for new field support

### Admin Panel
- `src/pages/admin/AdminEvents.tsx` - Added cleanup functionality
- `src/pages/admin/AdminGallery.tsx` - Added "Show on Home Page" checkbox
- `src/pages/admin/AdminUsers.tsx` - Added operator role and granular permissions

### Utilities
- `src/lib/eventCleanup.ts` - Automatic cleanup service
- `src/App.tsx` - Initialize cleanup service on app start

## Configuration Notes

### RLS Policies
The migration creates Row Level Security policies for:
- Users reading their own permissions
- Admins updating user permissions  
- Public access to photos marked for home page

### Performance
- Added database index on `gallery_photos.show_on_home_page` for faster home page queries
- Limited home page queries (6 events, 8 photos) for optimal performance

## Troubleshooting

### If Migration Fails with "syntax error at or near 'NOT'"
This is a PostgreSQL version compatibility issue. Use this approach:

1. **Use the minimal migration**: Execute `src/database/migrations/minimal_table_updates.sql`
2. **Skip RLS policies for now**: The app will work without the additional policies
3. **Run commands individually**: Copy each SQL command separately into Supabase SQL editor

### If Migration Partially Fails
1. Check which columns were successfully added:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'gallery_photos' AND column_name = 'show_on_home_page';
   
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'user_profiles' AND column_name LIKE 'can_manage_%';
   ```
2. Only run the parts of the migration that failed
3. Restart your development server after successful migration

### Other Common Issues
1. Check Supabase logs for specific error details
2. Ensure you have admin access to the database
3. Verify table names match your actual database schema

### If Features Don't Work
1. Verify migration was applied successfully
2. Check browser console for JavaScript errors
3. Ensure TypeScript types are updated and app is recompiled
4. Check Supabase RLS policies are correctly applied

### Cache Issues
If changes don't appear immediately:
1. Clear browser cache
2. Restart development server
3. Check Supabase real-time subscriptions are working
