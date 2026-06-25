# ⛪ Church Calendar — Lakeland Fellowship Church

A full-featured church event calendar with participant scheduling and admin management.

---

## 🚀 Deployment Guide (Step by Step)

### What you need
- A GitHub account (free) → github.com
- A Netlify account (free) → netlify.com
- Your Android phone (everything can be done from mobile)

---

### STEP 1 — Create a GitHub Repository

1. Open your phone browser and go to **github.com**
2. Log in to your GitHub account
3. Tap the **+** icon (top right) → **New repository**
4. Fill in:
   - Repository name: `church-calendar`
   - Description: `Beyond the Norm Ministry Calendar`
   - Set to **Public**
5. Tap **Create repository**

---

### STEP 2 — Upload the Project Files

1. On your new repository page, tap **uploading an existing file**
2. Upload ALL the files from the zip you downloaded, keeping the folder structure:
   ```
   church-calendar/
   ├── package.json
   ├── netlify.toml
   ├── public/
   │   └── index.html
   └── src/
       ├── index.js
       ├── App.js
       ├── storage.js
       ├── constants.js
       ├── utils.js
       └── components/
           ├── UI.js
           ├── EventForm.js
           ├── EventDetail.js
           ├── CalendarView.js
           ├── ParticipantsView.js
           └── AdminDashboard.js
   ```
3. Scroll down and tap **Commit changes**

---

### STEP 3 — Deploy to Netlify

1. Go to **netlify.com** on your phone
2. Log in or sign up (free)
3. Tap **Add new site** → **Import an existing project**
4. Choose **GitHub**
5. Authorize Netlify to access your GitHub
6. Select your **church-calendar** repository
7. Netlify auto-detects the settings from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `build`
8. Tap **Deploy site**
9. Wait 2–3 minutes for the build to complete
10. Netlify gives you a URL like: `https://amazing-name-123.netlify.app`

---

### STEP 4 — Customize Your URL (Optional)

1. In Netlify, go to **Site settings** → **Domain management**
2. Tap **Options** → **Edit site name**
3. Change it to something like: `beyondthenorm-calendar`
4. Your URL becomes: `https://beyondthenorm-calendar.netlify.app`

---

### STEP 5 — Share with Church Members

Send this message to your members:
> "You can now view our church calendar at: https://YOUR-SITE.netlify.app
> Bookmark it on your phone for easy access!"

---

## 🔐 Admin Login

- **Username:** `admin`
- **Password:** `church2024`

> To change the password: edit `src/constants.js` and update `ADMIN_CREDENTIALS`

---

## 📋 Features

- ✅ Monthly calendar with color-coded events
- ✅ Sabbath gatherings auto-generated every Saturday
- ✅ Pre-loaded holidays (Christmas, Easter, Good Friday, Pentecost)
- ✅ 10 default church members with roles
- ✅ Admin mode — add/edit/delete events
- ✅ Member management — add/edit/remove
- ✅ Auto-shuffle participants to Sabbath gatherings
- ✅ Shuffle history log
- ✅ Export to CSV or JSON
- ✅ Works on iPhone, Android, and laptop
- ✅ Mobile responsive design

---

## ⚠️ About Data Storage

This app uses **browser localStorage** for data. This means:
- Each device stores its own copy of the data
- Changes made on one device won't automatically appear on another

**To share data across devices:** Export as JSON on one device → import manually, OR upgrade to a backend database (ask for help when ready).

---

## 🛠️ Local Development (Optional)

```bash
npm install
npm start
```

Open http://localhost:3000

---

## 📁 File Structure

```
src/
├── App.js              # Main app, routing, state management
├── storage.js          # localStorage helpers
├── constants.js        # Event types, seed data, holidays
├── utils.js            # Date helpers, shuffle algorithm
└── components/
    ├── UI.js           # Shared: Modal, Toast, Button, Badge, Avatar
    ├── EventForm.js    # Add/edit event form
    ├── EventDetail.js  # Event detail popup
    ├── CalendarView.js # Monthly calendar grid
    ├── ParticipantsView.js  # Member management
    └── AdminDashboard.js    # Stats, history, export
```
