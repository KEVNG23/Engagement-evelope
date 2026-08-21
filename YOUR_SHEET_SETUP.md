# Your Google Sheets to Website Connection Guide

## Your Sheet Information

**Your Google Sheet Edit URL:**
```
https://docs.google.com/spreadsheets/d/1JqbJ4BT6kTy12QY_scQAbcS6Qls2ipefrNijjUox3to/edit?usp=drivesdk
```

**Your Sheet ID:** `1JqbJ4BT6kTy12QY_scQAbcS6Qls2ipefrNijjUox3to`

---

## Step-by-Step: Connect This Sheet to Your Website

### Step 1: Publish Your Sheet as CSV

1. **Open your Google Sheet** (click the link above)

2. **Go to the top menu:**
   ```
   File → Share → Publish to web
   ```

3. **In the dialog box:**
   - **First dropdown** (which tab to publish):
     - Click and select the tab with your form responses
     - Usually called "Form Responses 1" or "Sheet1"
   
   - **Second dropdown** (format):
     - Click and select **"Comma-separated values (.csv)"**
   
   - **Checkbox at bottom:**
     - ✅ Check "Automatically republish when changes are made"

4. **Click the green "Publish" button**

5. **Click "OK"** on the warning dialog

6. **A URL will appear** - it looks like:
   ```
   https://docs.google.com/spreadsheets/d/e/2PACX-1vT...long-code.../pub?output=csv
   ```
   
   **COPY THIS ENTIRE URL** - you'll need it in the next step!

---

### Step 2: Add the CSV URL to Railway

1. **Go to Railway:**
   ```
   https://railway.app
   ```

2. **Click on your project**

3. **Click on your main application** (NOT the PostgreSQL database)

4. **Click the "Variables" tab**

5. **Click "+ Variable" or "New Variable"**

6. **Enter:**
   ```
   Name:  GOOGLE_SHEET_CSV_URL
   Value: [paste the published URL from Step 1]
   ```
   
   Make sure the URL:
   - Starts with `https://docs.google.com/spreadsheets/d/e/`
   - Ends with `pub?output=csv`

7. **Click "Add"**

8. **Railway will automatically redeploy** your app (wait ~1-2 minutes)

---

### Step 3: Test the Connection

1. **Go to your website's host dashboard:**
   ```
   https://your-domain.com/host
   ```

2. **Log in** with your HOST_PASSWORD

3. **Look for the "Đồng bộ Google" button**
   - It's in the top section with other buttons
   - Should be next to "Refresh" and "Download CSV"

4. **Click "Đồng bộ Google"**

5. **Wait a few seconds** - you should see:
   ```
   "Đã đồng bộ / khôi phục từ Google."
   ```

6. **Check the table below** - all your Google Form responses should appear!

---

### Step 4: Verify Email Column

Make sure your Google Sheet has an **Email** column with data:

1. Open your Google Sheet
2. Look at the column headers (first row)
3. You should see columns like:
   - Timestamp
   - Họ và Tên (or Name)
   - Bạn thuộc nhóm khách
   - Bạn có thể tham dự không?
   - Bạn có bị dị ứng thực phẩm nào không?
   - Bạn có phải người ăn chay trường không
   - **Email** or **Địa chỉ Email** ← This is important!

If the Email column is missing:
1. Add the email field to your Google Form first
2. Wait for new responses (or edit old responses to add emails)
3. Sync again

---

## Troubleshooting

### Problem: "Chưa có Sheet URL" message

**Solution:**
- Make sure you added `GOOGLE_SHEET_CSV_URL` to Railway
- Check you added it to the **main app**, not the database
- Wait for Railway to finish redeploying

### Problem: Sync button doesn't work

**Solution:**
1. Check Railway logs for errors
2. Verify the published URL is correct (ends with `output=csv`)
3. Try the manual CSV import method as backup

### Problem: No responses appear after sync

**Solution:**
1. Open your published CSV URL in a browser
2. Should download a CSV file - check if it has data
3. Verify your sheet has responses
4. Check the sheet tab you published is the one with data

### Problem: Emails are missing

**Solution:**
1. Add email field to your Google Form
2. Ask guests to resubmit or manually add emails in Host Dashboard
3. Use the "Edit" button next to each guest to add email

---

## Alternative: Manual CSV Import

If auto-sync isn't working, use manual import:

1. **Open your Google Sheet**

2. **Download CSV:**
   ```
   File → Download → Comma Separated Values (.csv)
   ```

3. **Open the downloaded CSV file** in Notepad or TextEdit

4. **Select ALL and Copy** (Ctrl+A, Ctrl+C)

5. **Go to Host Dashboard** (`/host`)

6. **Scroll down** to find:
   ```
   "Khôi phục từ Google Form (CSV)"
   ```

7. **Paste** the CSV content in the text box

8. **Click** "Khôi phục từ CSV"

9. **Done!** All responses imported

---

## Summary Checklist

- [ ] Opened my Google Sheet
- [ ] Published sheet as CSV (File → Share → Publish to web)
- [ ] Selected correct sheet tab
- [ ] Selected "Comma-separated values (.csv)" format  
- [ ] Checked "Automatically republish"
- [ ] Copied the published URL
- [ ] Added `GOOGLE_SHEET_CSV_URL` to Railway variables
- [ ] Waited for Railway to redeploy
- [ ] Tested sync button in Host Dashboard
- [ ] Verified responses appear
- [ ] Confirmed emails are populated

---

## Quick Reference

**Your Sheet Edit URL:**
```
https://docs.google.com/spreadsheets/d/1JqbJ4BT6kTy12QY_scQAbcS6Qls2ipefrNijjUox3to/edit
```

**Where to publish:**
```
File → Share → Publish to web
```

**What to select:**
- Your response sheet tab
- "Comma-separated values (.csv)"

**Where to add in Railway:**
- Variable name: `GOOGLE_SHEET_CSV_URL`
- Variable value: [your published CSV URL]

**Where to sync:**
- Go to: `/host` on your website
- Click: "Đồng bộ Google" button

---

Need help? Test the manual CSV import first to make sure your data is correct!
