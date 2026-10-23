VRAJ AGRO PLAST - STOCK APP  (deploy on Vercel, free)

1. Put this folder on GitHub (new repo, upload all files), OR run `npx vercel` inside this folder.
2. vercel.com > Add New > Project > import the repo > Deploy.
3. In the project: Storage > Create Database > Upstash Redis (free plan) > Connect to this project.
   Then Deployments > Redeploy (so the database keys are picked up).
4. Optional PIN: Settings > Environment Variables > APP_PIN = 1234 > Redeploy.
   Each phone asks for the PIN once.
5. Open your site, go to the Labels tab, print the QR labels. Scanning a label
   with any phone camera opens that product directly.
   (Print labels AFTER you have your final vercel.app / custom domain, because the QR holds the site address.)

Without step 3 the app still works, but each phone keeps its own separate stock.
