# Grocery Share

Realtime shareable grocery / todo list application.

Users can create lists, own them after login, and share disposable public links so anyone can view and collaborate in realtime.

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS
- **Backend / Auth / Realtime / DB**: Supabase
- **Hosting**: Netlify
- **CI/CD**: GitHub Actions

## Environments

| Branch | Environment | Purpose |
|--------|-------------|---------|
| `main` | Production | Stable, production-ready code |
| `dev` | Staging / Development | Integration branch for features |

## Development Workflow (Strict)

We follow a disciplined process:

1. **Planning** → Break feature into small tasks (GitHub Issues + Project board)
2. **Task Breakdown** → Each task completable in < 1 day
3. **Branching**:
 - Always create feature branches from `dev`
 - Naming: `feature/short-description`, `fix/...`, `chore/...`
4. **Development** → Follow coding standards & security checklist
5. **Pull Request** → PR from feature branch → `dev`
 - Must pass CI
 - Self-review + checklist required
6. **Merge to `dev`** → Staging environment
7. **Release** → PR from `dev` → `main` for production

### Creating a new feature

```bash
git checkout dev
git pull origin dev
git checkout -b feature/your-feature-name
# ... work ...
git push -u origin feature/your-feature-name
# Open PR targeting `dev`
```

## Getting Started (Local)

```bash
npm install
cp .env.example .env.local
# Fill Supabase URL and anon key
npm run dev
```

## Scripts

- `npm run dev` – Start development server
- `npm run build` – Production build
- `npm run lint` – ESLint
- `npm run typecheck` – TypeScript check
- `npm run preview` – Preview production build

## Security

- All database access goes through Supabase Row Level Security (RLS)
- No secrets in client code (only public anon key)
- Shared lists are intentionally public (by design)
- Security checklist before merging to `main`

## License

Private / Personal project
