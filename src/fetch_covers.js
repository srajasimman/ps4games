import fs from "fs";
import https from "https";

const JSON_FILE = "./GAMES.json";
const OUTPUT_DIR = "../public/cover";

// Ensure folder exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

function download(url, dest) {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(dest);

    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        file.close();
        fs.unlink(dest, () => {});
        console.log(`⚠️ Failed: ${url}`);
        return resolve(false);
      }

      res.pipe(file);

      file.on("finish", () => {
        file.close();
        console.log(`⬇️ Saved: ${dest}`);
        resolve(true);
      });
    }).on("error", () => {
      console.log(`❌ Error fetching: ${url}`);
      resolve(false);
    });
  });
}

async function run() {
  if (!fs.existsSync(JSON_FILE)) {
    console.log(`❌ Missing: ${JSON_FILE}`);
    return;
  }

  console.log(`📄 Reading JSON → ${JSON_FILE}\n`);

  const raw = fs.readFileSync(JSON_FILE, "utf-8");
  const parsed = JSON.parse(raw);

  const games = parsed.DATA;

  console.log(`🎮 Games Found: ${Object.keys(games).length}`);
  console.log(`📦 Downloading covers...\n`);

  for (const game of Object.values(games)) {
    const filePath = `${OUTPUT_DIR}/${game.title_id}.png`;

    if (fs.existsSync(filePath)) {
      console.log(`✔ Exists: ${filePath}`);
      continue;
    }

    await download(game.cover_url, filePath);
  }

  console.log(`\n🎉 Done. Covers stored in /cover folder.`);
}

run();
