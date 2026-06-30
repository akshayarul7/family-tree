# Family Tree

An interactive family tree web app — no frameworks, no build step. Just open `index.html` in a browser.

## Project structure

```
family-tree/
├── index.html        # App shell & markup
├── src/
│   ├── data.js       # 👈 Edit this to add/rename people
│   ├── app.js        # Rendering & interaction logic
│   └── style.css     # All styles
└── README.md
```

## How to run

Open `index.html` directly in any modern browser — no server needed.

Or serve it locally:
```bash
npx serve .
# or
python3 -m http.server 8080
```

## How to add a family member

1. Open `src/data.js`
2. Add a new object to the `people` array:

```js
{ id:'cousin5', name:'Cousin 5', rel:'Cousin (dad side)', gen:0, col:6, avatar:'C5', color:'other', year:'1995', notes:'' }
```

3. Add edges (connections) to the `edges` array:

```js
['paunt', 'cousin5'],   // parent → child
['puncle', 'cousin5'],
```

### Key fields

| Field  | Description |
|--------|-------------|
| `id`   | Unique string, no spaces |
| `gen`  | Generation: `0` = you, `1` = parents, `2` = grandparents, `-1` = kids |
| `col`  | Horizontal column (0 = center, negative = left, positive = right) |
| `color`| `'you'` / `'parent'` / `'grand'` / `'other'` — controls node tint |

## Planned features

- [ ] Relationship calculator (tap two people → see how they're related)
- [ ] User login so each family member sees themselves at the center
- [ ] Search by name
- [ ] Export to PDF / share link
- [ ] Backend to persist edits across devices

## Git setup (if starting fresh)

```bash
git init
git add .
git commit -m "Initial family tree"
# Push to GitHub:
git remote add origin https://github.com/YOUR_USERNAME/family-tree.git
git push -u origin main
```

## Deployment

Drop the folder into [Vercel](https://vercel.com) or [Netlify](https://netlify.com) — both detect static sites automatically and deploy on every push to `main`.
