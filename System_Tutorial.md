# How the App Was Built (Step-by-Step Process)

Instead of typing code line-by-line from scratch, we used a modern approach where I acted as the **Architect** and used AI as the **Lead Developer**. Here are the exact steps we took to build it:

### Step 1: The "Blueprint" (Database Design)
Before writing any code, we first decided what data to save.
*   **What I did:** I told the AI, "We need a database to store students, their scores, and the game status."
*   **What the AI did:** It generated the **SQL Schema** (the structure of the database) for us instantly. It created the tables for `Games` and `Students`.

### Step 2: The "Rulebook" (Backend Logic)
Next, we needed to create the rules of the game.
*   **The Challenge:** We needed a way for phones to "talk" to the main screen.
*   **The Solution:** We built **APIs** (connectors).
    *   I asked the AI: "Create an API where a student can enter a PIN to join."
    *   The AI wrote the **Cloudflare Worker** code that checks if the PIN is correct and adds the student to the list.

### Step 3: The "Face" (Frontend / UI)
This is the part everyone sees (The Host Screen and Player Phone).
*   **What I did:** I imagined the design: "It needs to look like a game show, with big text and distinct colors."
*   **What the AI did:** It wrote the **React & Tailwind CSS** code to build the screens. It created the "Lobby", the "Question Board", and the "Leaderboard" views.

### Step 4: Connecting the Wires (Integration)
This was the most crucial step: making it "Real-Time".
*   **The Logic:** One device (Host) needs to know when another device (Student) does something.
*   **The Build:** We used a technique called **Polling**.
    *   The AI wrote a script that makes the Host screen ask the Database every 2 seconds: *"Is there a new answer?"*
    *   If yes, the screen updates automatically.

### Step 5: Testing & Refining
Finally, we tested it.
*   We found bugs (e.g., scores not updating).
*   I described the error to the AI, and it analyzed the code to find the missing link and fixed it.

---

### Summary
We built the system layer-by-layer:
1.  **Database** (Storage) first.
2.  **Backend** (Rules) second.
3.  **Frontend** (Visuals) last.
4.  **AI** handled the heavy coding, while I focused on the logic and flow.
