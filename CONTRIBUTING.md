# Contributing to Grocery Share

## Branching Strategy

- `main` → Production
- `dev` → Staging / Integration
- Feature branches → Created from `dev`, merged back via PR into `dev`

### Naming Convention

- `feature/` – new features
- `fix/` – bug fixes
- `chore/` – tooling, deps, config
- `docs/` – documentation only
- `refactor/` – code improvements without behavior change

## Pull Request Process

1. Create branch from latest `dev`
2. Make small, focused commits
3. Open PR targeting `dev`
4. Fill the PR template
5. Ensure CI is green
6. Self-review using the checklist below
7. Request review (or self-approve if solo after checklist)

## PR Checklist

- [ ] Code follows project style (TypeScript strict, ESLint clean)
- [ ] No `any` types without justification
- [ ] Sensitive data / secrets not committed
- [ ] RLS policies considered for any new DB access
- [ ] Realtime subscriptions cleaned up (useEffect cleanup)
- [ ] Loading / error / empty states handled
- [ ] Mobile responsive
- [ ] No console.logs left in production code

## Security Checklist (before merging to main)

- [ ] Only public anon key used on client
- [ ] All tables have RLS enabled
- [ ] Policies tested for both owner and public share access
- [ ] No elevated privileges exposed
- [ ] Share links are unguessable (UUID)
