# Student Triage Tool

An AI-assisted student support triage tool that classifies incoming student requests and routes them to the right outcome — answering common questions using resources, requesting clarification for vague messages, or escalating sensitive cases to staff.

---

## How to Run Locally

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd student-triage
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
DATABASE_URL="postgresql://..." # Neon Postgres Connection String
GOOGLE_GENERATIVE_AI_API_KEY="AQ.Ab..." # Gemini API Key
GROQ_API_KEY="gsk_..." # Groq API Key
DASHBOARD_USER="admin" # Admin username
DASHBOARD_PASSWORD="password" # Admin password
```

### 3. Run Database Migrations
```bash
npx prisma db push
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) for the intake form, and [http://localhost:3000/dashboard](http://localhost:3000/dashboard) to access the staff portal.

---

## Submission Comments

- **Hybrid Triage Pipeline**: Merges AI evaluation (using Gemini 2.0 Flash as primary, with automatic fallback to Groq when primary APIs fail) with deterministic post-AI rules in code. If crisis or immigration requests occur, hardcoded overrides bypass AI logic entirely to guarantee safety.
- **Malicious and Mixed Request Preservation**: Pure prompt injections or promotional spam are immediately discarded and resolved. However, if a message contains a mixed intent (e.g. prompt injection along with a crisis statement), it bypasses automatic deletion, flags the threat, and escalates it to staff for human review.
- **Granular Classification**: Separate database columns and filter queues isolate prompt injections, marketing spam, and abusive/hostile language individually rather than grouping them under a general category.
- **Priority Queue & Analytics**: The queue defaults to an "importance" sort order: Safeguarding first, then critical/high/medium/low urgency, then newest first. The Overview page surfaces all 6 key stats (Total, New, In Progress, Resolved, Safeguarding, Critical).

---

## Response to Key Questions

### 1. If this served 50 organisations and 10,000 requests a day, what in your design would you change?
At this scale, the synchronous call to the Gemini API during submission would become a major bottleneck. We would decouple submission from triage by introducing a message queue (e.g., BullMQ or Inngest) to process AI classifications asynchronously in background workers. We would also implement database connection pooling (using Neon Connection Poolers), rate limiting per organization/IP to prevent abuse, and cache the static resource library to avoid serializing it into prompt configurations on every request.

### 2. This is real students’ personal and welfare data. What would you do differently for privacy and safety in a production version?
For a production system, all Personally Identifiable Information (PII) like names, emails, and message details would be encrypted at rest using column-level encryption (AES-256-GCM) with automated key rotations. We would replace the shared admin account with role-based access control (RBAC) linked to university SSO (SAML/OIDC) and configure strict audit logs tracking every staff access. Finally, we would establish automated data retention policies to anonymize or delete cases after a set period, and obtain a formal Data Processing Agreement (DPA) with Google regarding Gemini data retention.

### 3. In two or three sentences a non-technical colleague would understand, explain how your tool decides what to escalate.
The tool reads every message sent by a student and uses an AI model to evaluate its urgency and category. However, we have built-in safety rules in the code that override the AI: if a student's message indicates they might be in crisis or need immigration help, it is immediately escalated to a staff member. When the tool is in doubt or detects something unsafe, it always opts to hand the issue over to a human rather than risk responding automatically.
