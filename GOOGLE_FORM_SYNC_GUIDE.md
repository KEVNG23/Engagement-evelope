# How to Connect Google Form to Your Website Database

This guide will help you sync Google Form responses to your website's PostgreSQL database.

## Overview

Your website has two ways to collect RSVPs:
1. **Native RSVP Form** - Built into the website (goes directly to database)
2. **Google Form** - External form that can be synced to database

## Step-by-Step Setup

### Step 1: Set Up Your Google Form

1. **Go to your Google Form:**
   - URL: https://docs.google.com/forms/d/1FAIpQLScmVoVainH-HX1EJ6qU80tdyNb8xehICB9muHP_okld417oBg/edit

2. **Ensure your form has these fields** (in this exact order):
   - Họ và Tên (Full Name)
   - Bạn thuộc nhóm khách (Guest Group)
   - Bạn có thể tham dự không? (Can you attend?)
   - Bạn có bị dị ứng thực phẩm nào không? (Food allergies)
   - Bạn có phải người ăn chay trường không (Vegetarian)
   - **NEW: Địa chỉ Email (Email Address)**

3. **Add Email field to your Google Form:**
   - Click "+" to add a new question
   - Type: "Short answer"
   - Question: "Địa chỉ Email" or "Email Address"
   - Turn ON "Required"
   - Enable "Response validation" → "Text" → "Email"

### Step 2: Link Google Form to Google Sheets

1. **Open your Google Form**
2. Click the "Responses" tab
3. Click the green Sheets icon (Create Spreadsheet)
4. Choose "Create a new spreadsheet"
5. Name it (e.g., "Engagement RSVP Responses")
6. Click "Create"

Your form responses will now automatically save to this spreadsheet!

### Step 3: Get the CSV Download Link

**Option A: Manual CSV Export (Recommended for now)**

1. Open the linked Google Sheet
2. Go to: **File** → **Download** → **Comma Separated Values (.csv)**
3. Save the CSV file

**Option B: Auto-sync with Published CSV URL (Advanced)**

1. Open the linked Google Sheet
2. Go to: **File** → **Share** → **Publish to web**
3. Choose:
   - **Link**: Select the sheet with responses
   - **Format**: "Comma-separated values (.csv)"
4. Click "Publish"
5. Copy the published URL (it looks like: `https://docs.google.com/spreadsheets/d/e/...output=csv`)
6. Add this URL to Railway environment variables as `GOOGLE_SHEET_CSV_URL`

### Step 4: Set Up PostgreSQL Database on Railway

1. **Go to your Railway project dashboard**
2. Click "New" → "Database" → "Add PostgreSQL"
3. Railway will provision the database
4. **Copy the DATABASE_URL:**
   - Click on the PostgreSQL service
   - Go to "Variables" tab
   - Copy the `DATABASE_URL` value

5. **Add DATABASE_URL to your main app:**
   - Click on your main application service
   - Go to "Variables" tab
   - Click "New Variable"
   - Name: `DATABASE_URL`
   - Value: (paste the PostgreSQL connection string)
   - Click "Add"

6. **Redeploy your application:**
   - The app will automatically run database migrations
   - Check logs to confirm: "✓ Database migrations completed successfully"

### Step 5: Import Google Form Responses to Database

Now you can import your existing Google Form responses into the database:

#### Method 1: Manual CSV Import (Easiest)

1. **Download CSV from Google Sheets:**
   - Open your responses spreadsheet
   - File → Download → Comma Separated Values (.csv)
   - Save the file and open it in a text editor

2. **Go to Host Dashboard:**
   - Visit: `https://your-domain.com/host`
   - Log in with your HOST_PASSWORD

3. **Import CSV:**
   - Scroll down to "Khôi phục từ Google Form (CSV)" section
   - Copy ALL the CSV content (including headers)
   - Paste into the text area
   - Click "Khôi phục từ CSV" (Restore from CSV)

4. **Verify:**
   - You should see all responses appear in the "Chi tiết từng khách" table
   - Emails should be populated if they exist in the CSV

#### Method 2: Auto-sync (If you set up GOOGLE_SHEET_CSV_URL)

1. **Set the environment variable:**
   - In Railway, add `GOOGLE_SHEET_CSV_URL` with your published CSV URL

2. **Click "Đồng bộ Google" button:**
   - Go to `/host` dashboard
   - Click the "Đồng bộ Google" (Sync Google) button
   - The system will fetch and import responses automatically

### Step 6: Ongoing Sync

**For new responses going forward:**

You have two options:

**Option A: Use Built-in RSVP Form (Recommended)**
- Share your website URL with guests
- They use the native RSVP form on your site
- Responses go directly to PostgreSQL database
- Emails are required and automatically collected

**Option B: Continue Using Google Form + Manual Import**
- Share your Google Form with guests
- Periodically export CSV and import via Host Dashboard
- Good for keeping Google Forms as backup

**Option C: Auto-sync (Advanced)**
- If you set up `GOOGLE_SHEET_CSV_URL`
- Click "Đồng bộ Google" button periodically
- Or the system auto-restores on redeploy if database is empty

## Important Notes

### Email Field Mapping

The sync looks for these column names in your CSV:
- "email"
- "e-mail"
- "dia chi email"
- "email address"

Make sure your Google Form email question appears as one of these in the CSV header.

### CSV Format Requirements

Your CSV should look like this:

```csv
Timestamp,Họ và Tên,Bạn thuộc nhóm khách,Bạn có thể tham dự không?,Bạn có bị dị ứng thực phẩm nào không?,Bạn có phải người ăn chay trường không,Email
1/10/2027 14:30:00,Nguyễn Văn A,Gia đình nhà trai,Có,Không,Không,email@example.com
```

### Guest Group Values

The system recognizes these Vietnamese guest group values:
- Gia đình nhà trai
- Gia đình nhà gái
- Bạn chú rể
- Bạn cô dâu
- Đồng nghiệp chú rể
- Đồng nghiệp cô dâu

Any other value will be saved as "Other" with the original text.

## Troubleshooting

### "No email addresses available to export"
- Make sure you've added the email field to your Google Form
- Re-export CSV and import again
- Or manually add emails via the Host Dashboard

### "Sheet missing name column"
- Your CSV must have a column for names
- Check that the first row has headers
- Column can be named: "ho va ten", "name", or "full name"

### Sync button says "Chưa có Sheet URL"
- You haven't set up `GOOGLE_SHEET_CSV_URL` environment variable
- Use manual CSV import method instead

### Database connection errors
- Verify `DATABASE_URL` is set correctly in Railway
- Check Railway logs for migration errors
- Ensure PostgreSQL service is running

## Summary

✅ **You now have:**
- PostgreSQL database (persistent storage)
- Native RSVP form on your website
- Ability to import Google Form responses
- Email collection from all guests
- Manual email editing for existing guests
- Email export functionality

✅ **Best Practice:**
- Use native RSVP form for new guests
- Keep Google Form as backup
- Periodically export emails from Host Dashboard
- Set up PostgreSQL for data persistence

Need help? Check the Railway logs or test the import with a small CSV first!
