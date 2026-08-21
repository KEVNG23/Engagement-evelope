# PostgreSQL Database Setup

This application now supports PostgreSQL for persistent data storage.

## Setting Up PostgreSQL

### Option 1: Railway PostgreSQL (Recommended)

1. Go to your Railway project dashboard
2. Click "New" → "Database" → "Add PostgreSQL"
3. Railway will automatically provision a PostgreSQL database
4. Copy the `DATABASE_URL` connection string from the PostgreSQL service variables
5. Add `DATABASE_URL` to your main application's environment variables

### Option 2: External PostgreSQL Provider

You can use any PostgreSQL provider (Neon, Supabase, AWS RDS, etc.):

1. Create a PostgreSQL database with your provider
2. Get the connection string (format: `postgresql://user:password@host:port/database`)
3. Add it as the `DATABASE_URL` environment variable

## Environment Variable

Add this to your Railway environment variables:

```
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```

## How It Works

- **With DATABASE_URL**: Uses PostgreSQL for persistent storage
- **Without DATABASE_URL**: Falls back to JSON file storage (ephemeral on redeploys)

The application automatically:
- Creates the `rsvps` table on first run
- Runs necessary migrations
- Handles all database operations

## Database Schema

```sql
CREATE TABLE rsvps (
  token VARCHAR(32) PRIMARY KEY,
  name TEXT NOT NULL,
  guest_group TEXT NOT NULL,
  guest_group_other TEXT NOT NULL DEFAULT '',
  attend TEXT NOT NULL,
  allergy TEXT NOT NULL,
  vegetarian TEXT NOT NULL,
  email TEXT,
  google_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

## Benefits

✓ **Persistent Storage**: Data survives Railway redeploys  
✓ **Automatic Migrations**: Database schema created automatically  
✓ **Backward Compatible**: Still works without PostgreSQL  
✓ **Production Ready**: Proper indexing and query optimization  
✓ **Transaction Support**: Atomic bulk operations for Google Sheets sync

## Migrating Existing Data

If you have existing RSVP data in the JSON file:

1. Set up PostgreSQL as described above
2. Go to Host Dashboard (`/host`)
3. Use "Khôi phục từ Google Form (CSV)" to import your Google Forms responses
4. Or manually re-import your data

## Troubleshooting

**Connection Issues:**
- Ensure `DATABASE_URL` is correctly formatted
- Check that your database allows connections from Railway IPs
- For Railway PostgreSQL, SSL is required in production

**Migration Errors:**
- The app will log migration errors to console
- Check Railway logs for detailed error messages
- Ensure the database user has CREATE TABLE permissions

## Monitoring

- View database status in Railway dashboard
- Check connection pool metrics
- Monitor query performance

Your RSVP data is now safely stored in PostgreSQL! 🎉
