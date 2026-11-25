# Connect the shared leaderboard (about 10 minutes)

Once this is done, every score from every phone and the booth tablet goes into **one Google Sheet**, and everyone sees the same leaderboard. Until then, the leaderboard only shows scores from the device you're using.

You need a Google account.

## 1. Create the Sheet

1. Go to **sheets.google.com** and create a **blank spreadsheet**.
2. Name it **Deposera leaderboard**.

## 2. Add the script

1. In the Sheet, click **Extensions → Apps Script**.
2. Delete everything in the code window.
3. Open `booth/leaderboard-google-apps-script.gs` (in the GitHub repo), copy **all** of it and paste it in.
4. Click the **Save** icon.

## 3. Publish it as a web app

1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**.
5. Google asks you to authorise it: click **Authorise access**, then choose your account.
   - If you see "Google hasn't verified this app", click **Advanced**, then **Go to … (unsafe)**. It's your own script, so this is expected.
6. Copy the **Web app URL**. It starts with `https://script.google.com/macros/s/` and ends in `/exec`.

## 4. Connect the games

Send that URL to Claude, or do it yourself:

1. On GitHub, open `games/config.js` and click the pencil (edit) icon.
2. Paste the URL between the quotes:
   `window.DEPOSERA_SCORES_URL = "https://script.google.com/macros/s/…/exec";`
3. Click **Commit changes**. The website updates within a couple of minutes.

## 5. Test it

1. Open https://francis823.github.io/Deposera/games/ on your phone, play a game and save your name.
2. Tap **Leaderboard** on another device. Your name should appear, and the dot should say **Live**.
3. Open the Google Sheet. You'll see a new tab called **Scores** with your game.

## Good to know

- **To clear test scores** before the event, delete the rows in the **Scores** tab (keep the header row).
- **The Sheet is your full list:** name, game, level, score and time for everyone, ready to show or download.
- **If the Wi-Fi drops,** scores are kept on the phone or tablet and sent automatically when it's back.
- **Anyone could technically send a fake score**, because the games are public. Scores above the maximum possible are capped. If you spot a silly name, just delete that row in the Sheet.
