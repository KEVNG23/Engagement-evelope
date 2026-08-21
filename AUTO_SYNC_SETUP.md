# Google Form Auto-Sync Setup (Option B)

This guide shows you how to set up automatic syncing from Google Form to your website database.

## What You'll Achieve

- Click one button to sync all Google Form responses
- Automatic backup/restore on Railway redeploys
- No need to manually download and paste CSV

---

## Step-by-Step Instructions

### Step 1: Ensure Your Google Form is Connected to Sheets

1. Open your Google Form:
   ```
   https://docs.google.com/forms/d/1FAIpQLScmVoVainH-HX1EJ6qU80tdyNb8xehICB9muHP_okld417oBg/edit
   ```

2. Click the **"Responses"** tab at the top

3. If not already connected, click the green **Google Sheets icon** 
   - Choose "Create a new spreadsheet"
   - Name it something like "Engagement RSVP Responses"
   - Click "Create"

4. A new Google Sheet will open with your form responses

---

### Step 2: Get the Sheet ID

Your Google Sheet URL looks like this:
```
https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
```

**Example:**
```
https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z/edit
```

The part between `/d/` and `/edit` is your **SHEET_ID**.

Copy this SHEET_ID - you'll need it in the next step.

---

### Step 3: Publish Your Sheet as CSV

1. **In your Google Sheet**, go to the menu:
   ```
   File → Share → Publish to web
   ```

2. In the dialog that appears:
   - **First dropdown** (Link): Select the specific sheet tab with responses
     - Usually it's "Form Responses 1" or similar
   - **Second dropdown** (Format): Select **"Comma-separated values (.csv)"**

3. Check the box: **"Automatically republish when changes are made"**
   - This ensures new responses are immediately available

4. Click **"Publish"** button

5. A warning appears - click **"OK"**

6. **Copy the published URL** that appears
   - It looks like: `https://docs.google.com/spreadsheets/d/e/2PACX-...long-string.../pub?output=csv`
   - Make sure it ends with `output=csv`

---

### Step 4: Add the URL to Railway

1. **Go to Railway Dashboard:**
   ```
   https://railway.app
   ```

2. **Find your project** and click on it

3. **Click on your main application service** (not the PostgreSQL database)

4. **Go to the "Variables" tab**

5. **Click "New Variable"** or "+ Variable"

6. **Add the environment variable:**
   ```
   Variable name:  GOOGLE_SHEET_CSV_URL
   Variable value: [paste your published CSV URL here]
   ```
   
   Example value:
   ```
   https://docs.google.com/spreadsheets/d/e/2PACX-1vQxxx.../pub?output=csv
   ```

7. **Click "Add"**

8. Railway will automatically redeploy your app

---

### Step 5: Wait for Deployment

1. Watch the deployment progress in Railway

2. Check the logs for successful deployment:
   - Click on your service
   - Go to "Deployments" tab
   - Click the most recent deployment
   - Look for: `✓ Database migrations completed successfully`

3. Once deployed, your app is ready!

---

### Step 6: Test the Auto-Sync

1. **Go to your Host Dashboard:**
   ```
   https://your-domain.com/host
   ```

2. **Log in** with your HOST_PASSWORD

3. You should see a **"Đồng bộ Google"** (Sync Google) button

4. **Click the button**

5. Wait a few seconds - you should see a success message:
   ```
   "Đã đồng bộ / khôi phục từ Google."
   ```

6. **Check the guest list below:**
   - All Google Form responses should appear
   - Each guest should have their information
   - Emails should be populated (if present in form)

---

### Step 7: How to Use Going Forward

#### For New Responses:

1. **Someone fills out your Google Form**
2. Response automatically saves to Google Sheets
3. **Go to Host Dashboard** (`/host`)
4. **Click "Đồng bộ Google"** button
5. New responses appear immediately!

#### Auto-Restore Feature:

- If Railway redeploys and database is empty
- The system automatically fetches from Google Sheet
- No data loss!

---

## Important Notes

### ✅ What This Auto-Sync Does:

- **Merge mode** by default (safe)
  - Adds new responses from Google Form
  - Updates existing responses if they changed
  - Keeps local responses that aren't in Google Form

- **Preserves manually entered data**
  - Emails you added manually are kept
  - Local-only RSVPs (from website form) are not deleted

### 🔄 Sync Direction:

- **Google Form → Website Database** (one-way)
- Website form responses stay in database
- Google Form is the backup source

### 📧 Email Field:

The system looks for these column names in your sheet:
- "email"
- "e-mail" 
- "dia chi email"
- "email address"
- "Email Address"

Make sure your Google Form email question matches one of these!

---

## Troubleshooting

### "Chưa có Sheet URL"

**Problem:** You see this message when clicking sync.

**Solution:** 
- Check that `GOOGLE_SHEET_CSV_URL` is set in Railway
- Make sure you added it to the **main app**, not the database service
- Redeploy if you just added it

---

### "Đồng bộ thất bại" (Sync Failed)

**Problem:** Sync button shows error.

**Possible causes:**

1. **Wrong CSV URL format**
   - Must end with `output=csv`
   - Should be the published URL, not the regular edit URL

2. **Sheet not published**
   - Go back to Step 3 and publish the sheet again
   - Make sure "Automatically republish" is checked

3. **Sheet has no responses yet**
   - Add at least one test response to your form
   - Try syncing again

4. **Wrong sheet tab selected**
   - When publishing, select the tab with actual form responses
   - Usually "Form Responses 1"

---

### "No responses appear after sync"

**Problem:** Sync succeeds but no guests show up.

**Solution:**

1. **Check column names in Google Sheet:**
   - Must have a name column (Họ và Tên)
   - Download CSV and verify headers

2. **Test the CSV URL directly:**
   - Open the published URL in browser
   - Should download a CSV file
   - Check if it has data

3. **Check Railway logs:**
   - Go to Railway → Your service → Logs
   - Look for sync errors

---

### "Some emails are missing"

**Problem:** Not all guests have emails after sync.

**Solution:**

1. **Check your Google Form** has email field
2. **Verify column name** in sheet matches recognized names
3. **Manually add emails:**
   - Go to Host Dashboard
   - Click "Edit" (Sửa) next to guest's email
   - Add the email address
   - Click "Save" (Lưu)

---

## Alternative: Manual CSV Import

If auto-sync isn't working, you can always use manual import:

1. Open Google Sheet
2. File → Download → CSV
3. Open CSV in text editor
4. Copy all content
5. Go to Host Dashboard
6. Paste in "Khôi phục từ Google Form (CSV)" section
7. Click import

---

## Security Notes

### Is the published CSV secure?

**The CSV URL is public** but:
- The URL is very long and random (hard to guess)
- It only has the responses data, not edit access
- If someone finds the URL, they can only VIEW responses

**To make it more secure:**
- Don't share the published CSV URL
- Use the native website RSVP form for sensitive data
- Use HOST_PASSWORD to protect the dashboard

### Published URL vs. Regular URL

❌ **Don't use the regular edit URL:**
```
https://docs.google.com/spreadsheets/d/SHEET_ID/edit
```

✅ **Use the published CSV URL:**
```
https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?output=csv
```

---

## Summary Checklist

- [ ] Google Form connected to Google Sheets
- [ ] Email field added to Google Form
- [ ] Sheet published as CSV with auto-republish
- [ ] Published CSV URL copied
- [ ] `GOOGLE_SHEET_CSV_URL` added to Railway
- [ ] App redeployed successfully
- [ ] Tested sync button - works!
- [ ] All responses showing in dashboard
- [ ] Emails populated correctly

---

## Next Steps

✅ **You're all set!** Now you can:

1. Share Google Form with guests who prefer it
2. Share website URL with guests who prefer native form
3. Click "Đồng bộ Google" whenever you want to sync
4. Export email list with one click
5. Manually edit any missing emails

**Pro tip:** Set up PostgreSQL database first (see DATABASE_SETUP.md) so data persists across Railway redeploys!

---

Need help? Check Railway logs or test with a small CSV first!
