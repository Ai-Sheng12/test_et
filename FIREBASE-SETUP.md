# Firebase Migration Guide - Option 2

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name it: `expense-tracker`
4. Accept terms, click "Create project"
5. Wait for project to complete (~1 minute)

---

## Step 2: Set Up Firestore Database

1. In Firebase Console, click "Cloud Firestore" in left menu
2. Click "Create database"
3. Select **"Start in test mode"** (for development)
4. Choose region closest to you
5. Click "Enable"
6. Update rules later (instructions below)

---

## Step 3: Enable Authentication

1. In Firebase Console, click "Authentication" 
2. Click "Get started"
3. Select "Anonymous" provider
4. Toggle it **ON**
5. Click "Save"

This allows users to use the app without signing up.

---

## Step 4: Get Your Firebase Credentials

1. In Firebase Console, click the gear icon ⚙️ → "Project settings"
2. Scroll to "Your apps" section
3. Click "Web" icon (</> symbol)
4. Register app, copy the config code
5. You'll see something like:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDxxx...",
  authDomain: "expense-tracker-xxxx.firebaseapp.com",
  projectId: "expense-tracker-xxxx",
  storageBucket: "expense-tracker-xxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

---

## Step 5: Update Your Firebase Config

1. Open `firebase-config.js` in VS Code
2. Replace the placeholder values with your actual config from Step 4
3. Save the file

Example:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDxxx...",  // PASTE YOUR VALUES
  authDomain: "expense-tracker-xxxx.firebaseapp.com",
  projectId: "expense-tracker-xxxx",
  storageBucket: "expense-tracker-xxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

---

## Step 6: Set Firestore Security Rules

1. Go to Firestore Database → "Rules" tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId}/expenses/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
    match /users/{userId}/budgets/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

3. Click "Publish"

---

## Step 7: Test Locally (Optional)

To test before deploying:

1. Rename `index.html` to `index-old.html` (backup)
2. Rename `index-firebase.html` to `index.html`
3. Rename `app.js` to `app-old.js` (backup)
4. Rename `app-firebase.js` to `app.js`
5. Open http://localhost/test_et/ in browser
6. Should load and work with Firebase

**Note:** You may need to configure your local development server's CORS for Firebase. If you get CORS errors, skip testing locally and go straight to deployment.

---

## Step 8: Prepare for GitHub Pages Deployment

### Create a GitHub Repository

1. Go to [github.com](https://github.com) → "New repository"
2. Name it: `expense-tracker`
3. Make it **Public**
4. Click "Create repository"

### Prepare Your Files

Create a clean directory structure for deployment:

```
expense-tracker/
├── index.html              (use index-firebase.html content)
├── app.js                  (use app-firebase.js content)
├── app.css                 (copy as-is)
├── firebase-config.js      (with your credentials)
└── README.md               (optional)
```

**DO NOT include:**
- `index.php` ❌
- `app-old.js` ❌
- `database.php` ❌
- `expense.php` ❌
- `budget.php` ❌
- `api/` folder ❌

---

## Step 9: Deploy to GitHub Pages

### Option A: Using Git Command Line

```bash
cd /path/to/expense-tracker

# Initialize git
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Add files
git add .
git commit -m "Initial commit: Firebase expense tracker"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/expense-tracker.git

# Push to main branch
git branch -M main
git push -u origin main
```

### Option B: Using GitHub Desktop or VS Code

1. Open VS Code
2. Initialize Git: `Ctrl+Shift+G` → "Initialize Repository"
3. Add files and commit
4. Publish to GitHub

---

## Step 10: Enable GitHub Pages

1. Go to your repository on GitHub
2. Go to **Settings** → **Pages**
3. Under "Branch", select `main` (or `master`)
4. Select root folder `/`
5. Click "Save"
6. Wait ~2 minutes for GitHub to build
7. Your site will be available at: `https://YOUR_USERNAME.github.io/expense-tracker/`

---

## Troubleshooting

### "Anonymous authentication failed"
- Go to Firebase Console → Authentication
- Make sure Anonymous provider is enabled

### "Data not saving"
- Check Firestore Security Rules (Step 6)
- Check browser console for errors (F12)
- Make sure database rules allow anonymous users

### "CORS error"
- This shouldn't happen with Firebase
- Clear browser cache and try again

### "Firebase not loading"
- Check firebase-config.js has correct credentials
- Check internet connection
- Check Chrome DevTools (F12) → Console tab for errors

---

## Next: Testing in Production

1. Visit your GitHub Pages URL
2. Try adding an expense
3. Refresh the page
4. Expense should still be there ✅

If it works, you're done! 🎉

For more help, see:
- [Firebase Documentation](https://firebase.google.com/docs)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
