# CampusFlow 🎓
> *"Learn a skill. Teach a skill. Grow together."*

CampusFlow is a full-stack student skill-exchange platform where students can teach skills they know and learn skills they need using a fair, credit-based economy.

---

## 🚀 Live Local URLs
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Backend Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🛠️ Technology Stack
- **Frontend**: React 19, Vite, React Router DOM, Modern CSS (Design System), Lucide React icons, Recharts, Socket.IO Client.
- **Backend**: Node.js, Express.js, MongoDB Atlas (Cloud), Mongoose, JWT (JSON Web Tokens), bcryptjs, Socket.IO.

---

## 🌟 Implemented Features

1. **Authentication & Security**:
   - Strict `@gmail.com` student verification.
   - Salted and hashed passwords with `bcryptjs`.
   - JWT token authorization on all protected routes.
   - **One Device → One Account Protection**: Stores active session device ID; detects access from another browser/device and safely invalidates conflicting sessions.

2. **Student Profile & Dashboard**:
   - Full student profile (Name, Academic Year, College, Bio, Skills to Teach, Skills to Learn).
   - Starter bonus of 50 credits.
   - **7-Day Free Trial countdown** calculated dynamically on the backend.
   - Interactive student dashboard with stats, daily learning streak counter, and Recharts learning progress graph.

3. **Core Skill Exchange & Smart Matching**:
   - Browse skills offered by peers with search and filters (by skill, year, minimum rating).
   - **Intelligent Skill Matching**: Algorithmic compatibility scoring (e.g., "94% Skill Match") with transparent matching rationale.
   - Send, accept, and reject swap proposals.
   - Credit reward of **+20 credits to both students** upon completing a swap.

4. **Ratings & Reviews**:
   - 1 to 5 star peer ratings with written feedback after completed swaps.
   - Dynamic user average rating calculation and anti-duplicate review locks.
   - +10 bonus credits for receiving 5-star feedback.

5. **Curated Video Hub & 5-Video Milestone**:
   - Library of bite-sized, high-yield technical masterclasses.
   - Individual watch tracking.
   - **Automatic 50-credit milestone reward** upon completing 5 distinct videos.

6. **Interactive Skill Quizzes**:
   - Multiple-choice questions with answer tracking and score calculations.
   - +25 credit bonus for scoring 60%+ passing marks.
   - Detailed answer explanations to reinforce concepts.

7. **Real-time Peer Chat (Socket.IO)**:
   - Instant 1-on-1 messaging between students.
   - Online status indicators, timestamps, and database message persistence.

8. **Unlimited Doubts Forum**:
   - Student Q&A platform for asking doubts with code snippets and category tags.
   - Post peer answers, upvote helpful explanations, and add threaded comments.

9. **Academic Planner Suite**:
   - **Todo List**: Priority-based task tracking with completion checkboxes.
   - **Deadlines Tracker**: Assignment & exam countdown clocks.
   - **Lab Practicals**: Record and track practical experiments and submission statuses.
   - **Weekly Timetable**: Interactive class schedule organized by day of the week.

10. **Study Notes**:
    - Personal revision notes repository with tag-based search and color coding.

11. **Safety & Growth**:
    - **Help & Dispute Reports**: Confidential reporting for inappropriate behavior or swap issues.
    - **Invite Friends / Referral Program**: Unique referral links awarding +25 bonus credits to both students.

---

## ⚡ How to Run the Project Locally

### 1. Start the Backend Server:
```bash
cd server
npm start
```
*(Runs on `http://localhost:5000` and automatically connects to MongoDB Atlas)*

### 2. Start the Frontend React App:
```bash
cd client
npm run dev
```
*(Runs on `http://localhost:5173`)*

---

## 🧪 Demo Login Credentials (Ready to Test)
For quick evaluation without manual registration, you can use any of these pre-seeded demo accounts on the login screen:
- **Aarav Sharma (3rd Yr CS)**: `aarav.sharma@gmail.com` / `student123`
- **Priya Patel (2nd Yr UI/UX)**: `priya.patel@gmail.com` / `student123`
- **Rohan Verma (4th Yr Fullstack)**: `rohan.verma@gmail.com` / `student123`
- **Sneha Iyer (1st Yr Math)**: `sneha.iyer@gmail.com` / `student123`
*(Or click any of the "Quick Demo Login" buttons directly on the login page!)*

---

## 🛡️ Note on Single Device Protection
*The single-device session protection uses unique client device tokens. While this provides effective session management and prevents concurrent usage, in modern web development device identifiers can be cleared by resetting browser cookies. This provides strong basic protection for student accounts.*
