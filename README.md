# Family Tree

An interactive family tree web app — React + Vite frontend, Supabase backend (Postgres + Auth + Storage). Works on any device, persists to the cloud.

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite |
| Backend / DB | Supabase (Postgres) |
| Auth | Supabase Auth (email/password) |
| Photo storage | Supabase Storage |
| Deployment | Vercel (recommended) |

---

## Project structure

```
family-tree/
├── index.html
├── vite.config.js
├── package.json
├── .env.example          ← copy to .env.local
├── supabase/
│   └── schema.sql        ← run this in Supabase SQL editor
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── lib/
    │   ├── supabaseClient.js
    │   ├── defaultFamilyData.js
    │   └── uploadPhoto.js
    ├── hooks/
    │   ├── useAuth.jsx
    │   └── useFamilyData.js
    └── components/
        ├── Login.jsx
        ├── TreeCanvas.jsx
        ├── PersonNode.jsx
        ├── EdgeLines.jsx
        ├── EditPanel.jsx
        └── AddPersonModal.jsx
```

---

## Setup guide

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/family-tree.git
cd family-tree
npm install
```

### 2. Create your Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Choose a name, region, and database password → click **Create new project**
3. Wait ~1 minute for provisioning

### 3. Run the schema

1. In your Supabase dashboard → **SQL Editor** → **New query**
2. Paste the entire contents of `supabase/schema.sql`
3. Click **Run** — this creates the `people` and `relationships` tables, RLS policies, and the `avatars` storage bucket

### 4. Get your API keys

In Supabase → **Project Settings** → **API**:
- Copy **Project URL**
- Copy **anon public** key

### 5. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — sign up for an account and your placeholder family tree will be seeded automatically.

---

## Deploy to Vercel

1. Push your code to GitHub (`.env.local` is git-ignored — don't commit it)
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo
3. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Click **Deploy** — done. Every push to `main` auto-deploys.

> **Tip:** Also go to your Supabase project → **Authentication → URL Configuration** and add your Vercel domain to **Site URL** and **Redirect URLs** so email confirmation links work correctly.

---

## How to use

### Editing a person
Click any node → edit panel opens on the right. Change their name, birth year, notes, or upload a photo. Click **Save changes**.

### Adding a person
Click **+ Add member** in the toolbar → fill in the form. You can optionally connect them as a child or partner of an existing person.

### Navigating the tree
- **Pan:** click and drag the background
- **Zoom:** scroll wheel, or use the +/− buttons
- **Reset view:** toolbar button

### Adding more people later via code
Edit `src/lib/defaultFamilyData.js` — but note this only seeds on first login. For existing accounts, use the **Add member** button in the UI, or insert rows directly in the Supabase Table Editor.

---

## Roadmap

- [ ] Relationship calculator (tap two people → see exactly how they're related)
- [ ] Invite family members to view/edit their own nodes
- [ ] Search by name
- [ ] Export tree as image / PDF
- [ ] Mobile-optimised touch pan/zoom
