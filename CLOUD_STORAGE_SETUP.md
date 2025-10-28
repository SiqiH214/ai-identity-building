# Cloud Storage Setup Instructions

This application now supports cloud storage for custom locations and outfits using Supabase and Vercel Blob Storage.

## Prerequisites

- Supabase account (already configured in `.env.local`)
- Vercel Blob Storage (already configured in `.env.local`)

## Setting up the Database

1. **Log in to your Supabase Dashboard**
   - Go to https://zrejhctqebgzxbnckzkt.supabase.co
   - Navigate to the SQL Editor

2. **Create the database tables**
   - Copy the contents of `supabase-schema.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the SQL

This will create:
- `custom_locations` table for storing user-uploaded locations
- `custom_outfits` table for storing user-uploaded outfits
- Appropriate indexes and Row Level Security (RLS) policies

## How it Works

### Image Storage
- Images are uploaded to **Vercel Blob Storage** (cloud storage)
- Each image gets a unique public URL
- These URLs are stored in the Supabase database

### Data Storage
- Location and outfit metadata (name, city/category) is stored in **Supabase**
- Data is automatically synced across all users
- When you upload a custom location or outfit:
  1. The image is uploaded to Vercel Blob
  2. The metadata + image URL is saved to Supabase
  3. The item appears in your library immediately

### Custom Locations
When a user uploads a custom location:
```
User uploads image → Vercel Blob → Get URL → Save to Supabase → Display in UI
```

### Custom Outfits
When a user saves an outfit from "Steal Elements":
```
Analyze image → Upload to Vercel Blob → Get URL → Save to Supabase → Display in UI
```

## API Endpoints

The following API endpoints are available:

### Locations
- `GET /api/locations` - Fetch all custom locations
- `POST /api/locations` - Save a new custom location
- `DELETE /api/locations?id={id}` - Delete a custom location

### Outfits
- `GET /api/outfits` - Fetch all custom outfits
- `POST /api/outfits` - Save a new custom outfit
- `DELETE /api/outfits?id={id}` - Delete a custom outfit

## Features

### Element Names
All elements (locations, outfits, people, emotions, activities, poses) now display their names below the circular icons for better usability.

### Cloud Sync
- Custom locations and outfits are automatically saved to the cloud
- Data persists across sessions and devices
- Fallback to local state if cloud is unavailable

## Troubleshooting

If you encounter issues:

1. **Check Supabase Connection**
   - Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
   - Make sure the database tables are created

2. **Check Vercel Blob**
   - Verify `BLOB_READ_WRITE_TOKEN` in `.env.local`
   - Ensure you have sufficient storage quota

3. **Check Browser Console**
   - Open Developer Tools → Console
   - Look for error messages when uploading

4. **Fallback Behavior**
   - If cloud storage fails, the app will fallback to local state
   - Your data will still be available during the current session
