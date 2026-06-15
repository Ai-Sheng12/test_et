# Files for GitHub Pages Deployment

## ✅ DEPLOY THESE FILES

These are the ONLY files you need on GitHub Pages:

```
📁 expense-tracker/
├── 📄 index.html                (use index-firebase.html content)
├── 📄 app.js                    (use app-firebase.js content)
├── 📄 app.css                   (use existing file as-is)
├── 📄 firebase-config.js        (with YOUR Firebase credentials)
└── 📄 README.md                 (optional - describe your project)
```

### File Descriptions:

- **index.html** - The webpage (rename from index-firebase.html)
- **app.js** - JavaScript code that uses Firebase (rename from app-firebase.js)
- **app.css** - Styling - no changes needed
- **firebase-config.js** - Firebase configuration - UPDATE THIS with your credentials
- **README.md** - Optional project description

---

## ❌ DO NOT DEPLOY THESE FILES

These files ONLY work with PHP and won't work on GitHub Pages:

```
❌ index.php              (old PHP version)
❌ app-old.js            (backup - not needed)
❌ index-old.html        (backup - not needed)
❌ app-old.js            (backup - not needed)
❌ database.php          (PHP MySQL connection)
❌ expense.php           (PHP Expense class)
❌ budget.php            (PHP Budget class)
❌ expense_tracker.sql   (database dump - not needed)
❌ /api/                 (entire folder - old PHP API)
```

---

## Deployment Steps

### Option A: Clean GitHub Upload

1. Create new folder: `C:\Users\YourName\Desktop\expense-tracker-deploy`
2. Copy ONLY the ✅ files from above into it
3. Open folder in VS Code
4. Initialize Git: `git init`
5. Add files: `git add .`
6. Commit: `git commit -m "Expense tracker app"`
7. Follow GitHub Pages instructions

### Option B: Upload from Current Folder

If uploading from `C:\xampp\htdocs\test_et\`:

1. Add `.gitignore` file:
```
# Don't commit these
index.php
index-old.html
app-old.js
database.php
expense.php
budget.php
expense_tracker.sql
/api/
*.md (if you only want essential files)
```

2. Git commands:
```
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/USERNAME/expense-tracker.git
git branch -M main
git push -u origin main
```

---

## File Size Reference

Total size of deployed files: ~50 KB (very small!)

- `index.html` - ~8 KB
- `app.js` - ~20 KB
- `app.css` - ~3 KB
- `firebase-config.js` - ~0.5 KB
- `README.md` - ~1 KB

All files load instantly ⚡

---

## Before You Push

Checklist:
- [ ] `firebase-config.js` has YOUR Firebase credentials
- [ ] `index.html` is the Firebase version (or renamed from index-firebase.html)
- [ ] `app.js` is the Firebase version (or renamed from app-firebase.js)
- [ ] `app.css` is present
- [ ] No `.php` files are in the folder
- [ ] No `api/` folder is included
- [ ] No `*.sql` files included

---

## GitHub Structure After Deployment

Your GitHub repository will look like:

```
username/expense-tracker/
├── .git/                    (hidden - git manages this)
├── .gitignore              (optional)
├── index.html
├── app.js
├── app.css
├── firebase-config.js
├── README.md              (optional)
└── LICENSE                (optional)
```

And it will be accessible at:
👉 `https://username.github.io/expense-tracker/`

---

## Testing Locally Before GitHub

Optional: Test locally with these renamed files:

```
1. Rename index-firebase.html → index.html
2. Rename app-firebase.js → app.js
3. Open http://localhost/test_et/ in browser
4. Test all features
5. When satisfied, commit to git
```

---

## Common Mistakes ⚠️

❌ **Mistake:** Uploading `index.php` instead of `index.html`
→ **Fix:** Make sure you're uploading the static HTML file, not PHP

❌ **Mistake:** Not updating `firebase-config.js`
→ **Fix:** Add your Firebase credentials before deploying

❌ **Mistake:** Uploading `/api/` folder
→ **Fix:** Leave it out - GitHub Pages doesn't run PHP

❌ **Mistake:** Forgetting to enable GitHub Pages
→ **Fix:** Go to Settings → Pages → Select branch

---

## File Naming Cheat Sheet

| Current File | For GitHub | Command |
|--------------|-----------|---------|
| index-firebase.html | index.html | `mv index-firebase.html index.html` |
| app-firebase.js | app.js | `mv app-firebase.js app.js` |
| app.css | app.css | (no change needed) |

---

**Ready? Start deploying! 🚀**

Questions? Check FIREBASE-SETUP.md or OPTION2-SUMMARY.md
