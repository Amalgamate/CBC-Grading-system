# Quick Test Guide - Test Message Feature

## What Was Fixed

The test message feature wasn't working because the backend routes were missing authentication middleware.

**Changes:**
- ✅ Added `authenticate` and `requireTenant` middleware to communication routes
- ✅ Improved backend error handling and logging
- ✅ Enhanced frontend debugging and error messages
- ✅ Backend now compiles without errors

---

## How to Test

### Step 1: Restart Your Backend Server
```bash
cd c:\Amalgamate\Projects\EDucore\server
npm run build          # Compile TypeScript (should complete successfully)
npm run dev            # Start the server
```

**Expected Output:**
- No compilation errors
- Server starts and listens on a port (usually 5000 or 3001)

### Step 2: Refresh Your Frontend
1. Open the application in browser (usually `http://localhost:3000`)
2. Log in if not already logged in
3. Hard refresh: `Ctrl+F5` (to clear cache)
4. Go to **Communication → Messages**

### Step 3: Test the Feature
1. You should see a list of recipients loading (191 parents)
2. Scroll to "Test Message First" section
3. Enter a phone number: `0713612141` or any valid parent phone
4. Enter a test message: `Hello, this is a test`
5. Click the **"Send Test"** button

### Step 4: Check Results

#### ✅ Success (Green notification)
- Toast message appears: `✓ Test SMS sent to +254713612141`
- Green box appears below showing: `✓ Test message sent to +254713612141...`
- Browser console shows: `✅ API Response: {success: true, ...}`

#### ❌ Error (Red notification)
- Red toast message appears with error details
- Red box appears showing what went wrong
- Browser console shows error logs starting with `❌`

### Step 5: Check Browser Console (F12)

When you click "Send Test", you should see in the Console tab:

```
🧪 Test message initiated
📞 Formatted phone: +254713612141
🏫 School ID: [some-id]
📝 Message to send: Hello, this is a test
🚀 Calling API...
✅ API Response: {success: true, message: "SMS sent successfully", messageId: "...", provider: "mobilesasa"}
```

---

## Troubleshooting

### Issue: "School ID not found" Error
**Solution:** 
- Log out completely (clear localStorage)
- Log back in
- Refresh the page
- Try again

### Issue: Phone number format error
**Solution:**
- Use format: `0712345678` (10 digits)
- Or: `+254712345678` (with country code)

### Issue: "SMS is disabled" Error
**Cause:** School hasn't configured SMS API keys

**Solution:**
- Go to Communication Settings
- Add MobileSasa API Key
- Save settings
- Try again

### Issue: Nothing happens when clicking "Send Test"
**Debug Steps:**
1. Open Browser DevTools: `F12`
2. Go to Console tab
3. Look for any red error messages
4. Check Network tab for API request to `/api/communication/test/sms`
5. Take a screenshot and share the error

---

## Network Testing

1. Open DevTools: `F12`
2. Go to **Network** tab
3. Click "Send Test" message
4. Look for POST request to `/api/communication/test/sms`
5. Click on it and check:
   - **Status:** Should be `200` (success) or `400`/`500` (error)
   - **Request:** Shows phoneNumber, message, schoolId in body
   - **Response:** Shows `success: true` or error message

---

## Quick Commands

```bash
# Terminal 1: Run backend
cd c:\Amalgamate\Projects\EDucore\server
npm run build
npm run dev

# Terminal 2: Check for errors (if available)
# tail -f server/logs/error.log
```

---

## Success Checklist

- [ ] Backend builds without errors
- [ ] Backend server starts successfully
- [ ] Frontend loads Messages page with 191 recipients
- [ ] Can enter phone number and message
- [ ] Clicking "Send Test" shows a response (success or error)
- [ ] Browser console shows detailed logs
- [ ] Toast notification appears (green or red)
- [ ] testResult box shows at bottom with timestamp

Once all items are checked, the feature is working! ✅

---

## What's Different Now

| Before ❌ | After ✅ |
|----------|---------|
| No response to "Send Test" click | Clear success/error notification |
| Silent failures | Detailed console logging |
| No error handling | User-friendly error messages |
| Missing middleware | Full authentication pipeline |
| Only localStorage for schoolId | Multi-source schoolId retrieval |

---

## Need Help?

1. Check the `TEST_MESSAGE_FIX_SUMMARY.md` file for detailed technical information
2. Look in browser console (F12) for detailed logs
3. Check Network tab for API response details
4. Verify backend is running with `npm run dev`
5. Make sure you're logged in with a valid account
