Deploy the current project to Vercel and return the live URL. Follow these steps exactly:

1. Check if the Vercel CLI is installed by running `vercel --version`. If it is not installed, install it globally with `npm install -g vercel`.

2. Build the project with `npm run build`. If the build fails, show the error and stop.

3. Deploy to Vercel production using `vercel --prod --yes`. Pass `--yes` to accept all default prompts automatically.

4. After deployment completes, extract and display the production URL from the output.

5. Report the final live URL to the user so they can open it in a browser.

Note: If the user is not logged into Vercel, prompt them to run `vercel login` first (or `! vercel login` in this session).
