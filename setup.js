const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const run = (cmd) => {
  try {
    return execSync(cmd, { stdio: "inherit", cwd: __dirname });
  } catch {}
};

console.log(`
╔══════════════════════════════════════════╗
║        Yaari App - Firebase Setup       ║
╚══════════════════════════════════════════╝
`);

// 1. Install dependencies
console.log("\n[1/5] Installing dependencies...");
run("npm install");

// 2. Check Firebase CLI
console.log("\n[2/5] Checking Firebase CLI...");
try {
  execSync("firebase --version", { stdio: "pipe" });
  console.log("  Firebase CLI found");
} catch {
  console.log("  Installing Firebase CLI...");
  run("npm install -g firebase-tools");
}

// 3. Try to login and create project
console.log("\n[3/5] Trying to create Firebase project...");
try {
  const result = execSync(
    'firebase projects:create yaari-app --display-name "Yaari App" --json',
    { stdio: "pipe", encoding: "utf8", timeout: 30000 }
  );
  const data = JSON.parse(result);
  const projectId = data.projectId || "yaari-app";
  console.log(`  Project created: ${projectId}`);

  // Enable services
  console.log("\n[4/5] Enabling Firebase services...");
  run(`firebase firestore:databases:create --project ${projectId}`);
  run(`firebase storage:bucket:create --project ${projectId}`);
  run(`firebase auth:enable --project ${projectId}`);

  // Get config
  console.log("\n[5/5] Generating env file...");
  const configResult = execSync(
    `firebase apps:create web "Yaari Web" --project ${projectId} --json`,
    { stdio: "pipe", encoding: "utf8" }
  );
  const appData = JSON.parse(configResult);
  const apiKey = appData.apiKey || "";

  const envContent = `NEXT_PUBLIC_FIREBASE_API_KEY=${apiKey}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${projectId}.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${projectId}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${projectId}.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
`;

  fs.writeFileSync(path.join(__dirname, ".env.local"), envContent);
  console.log("  .env.local generated successfully!");
  console.log("\n✅ Setup complete! Run: npm run dev");
} catch (err) {
  // Manual setup needed
  console.log(`
  ⚠ Could not auto-create Firebase project.
  This requires a Google account login.

  ─────────────────────────────────────────
  MANUAL SETUP (2 minutes):
  ─────────────────────────────────────────

  1. Go to: https://console.firebase.google.com
  2. Click "Create a project" → name it "yaari-app"
  3. Go to Project Settings → General → Your apps
  4. Click "Add app" → "Web" → register app
  5. Copy the firebaseConfig object values
  6. Paste them into .env.local file:

  ─────────────────────────────────────────

  Open .env.local and replace the values:

  NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
  NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

  ─────────────────────────────────────────

  7. In Firebase Console, enable:
     • Authentication → Sign-in method → Email/Password (ENABLE)
     • Firestore Database → Create database → Start in test mode
     • Storage → Get started → Start in test mode

  8. Run: npm run dev
  `);
}
