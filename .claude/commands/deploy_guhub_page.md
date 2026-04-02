Deploy this project to GitHub Pages. Follow these steps exactly:

## Step 1 — Check prerequisites

Run `git remote -v` to check if a GitHub remote exists.

- If no remote exists, ask the user to provide their GitHub repo URL, then run:
  ```
  git remote add origin <URL>
  ```
- If a remote exists, extract the repo name (the part after the last `/`, without `.git`) for use in Step 2.

## Step 2 — Set the correct base path for GitHub Pages

GitHub Pages serves the site at `https://<username>.github.io/<repo-name>/`, so Vite must know the base path.

Read `vite.config.ts` and check if `base` is already set. If not, add `base: '/<repo-name>/',` inside `defineConfig({...})`.

Example:
```ts
export default defineConfig({
  base: '/my-repo-name/',
  ...
})
```

## Step 3 — Build the project

Run:
```
npm run build
```

If the build fails, show the error and stop.

## Step 4 — Push source code to GitHub

Stage and commit all changes (source code, not the build output):
```
git add -A
git commit -m "Deploy to GitHub Pages"
git push -u origin main
```

If `main` branch push fails, try `master`.

## Step 5 — Deploy build output to gh-pages branch

Use the `gh-pages` package to publish the `build/` directory:

```
npx gh-pages -d build
```

If `gh-pages` is not installed, it will be fetched automatically via `npx`.

## Step 6 — Enable GitHub Pages (if not already enabled)

Run the following to enable Pages via GitHub CLI (requires `gh` to be authenticated):
```
gh api repos/{owner}/{repo} --method PATCH -f "has_pages=true" 2>/dev/null || true
gh api repos/{owner}/{repo}/pages --method POST -H "Accept: application/vnd.github+json" -f "source[branch]=gh-pages" -f "source[path]=/" 2>/dev/null || true
```

Replace `{owner}` and `{repo}` with the values from the remote URL.

## Step 7 — Report the live URL

The site will be available at:
```
https://<username>.github.io/<repo-name>/
```

Tell the user this URL. Note that GitHub Pages may take 1–2 minutes to go live after the first deploy.

## Important notes

- The `base` change in `vite.config.ts` is permanent — do not revert it after deployment.
- If the user also deploys to Vercel, the Vercel deployment uses its own domain so the `base` setting does not affect it.
- If `git push` is rejected due to unrelated histories, run: `git push -u origin main --allow-unrelated-histories`
