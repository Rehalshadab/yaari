const https = require("https");
const fs = require("fs");
const path = require("path");

const configPath = path.join(process.env.USERPROFILE, ".config", "configstore", "firebase-tools.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const token = config.tokens.access_token;

// Use Firebase Auth admin endpoint (no API key needed)
const data = JSON.stringify({ localId: "2tdOeUk64Ggv37Nfl2U6IjFKSJ02" });

const opts = {
  hostname: "identitytoolkit.googleapis.com",
  path: "/v1/accounts:delete",
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
};

const req = https.request(opts, (res) => {
  let body = "";
  res.on("data", (c) => (body += c));
  res.on("end", () => {
    console.log("Status:", res.statusCode);
    console.log("Body:", body.slice(0, 500));
  });
});
req.on("error", (e) => console.error("Error:", e.message));
req.write(data);
req.end();
