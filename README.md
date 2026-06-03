# Empty Room Demo

A small Vite, React, Tailwind CSS, and Cloudflare Worker demo for uploading room photos and asking OpenAI image models to remove furniture and loose objects.

The browser app is static and safe to host publicly. The OpenAI API key stays in the Cloudflare Worker.

## Local Setup

1. Create `.env.local` with `OPENAI_API_KEY`.
2. Install dependencies:

```sh
npm install
```

3. Start the local app and Worker:

```sh
make up
```

Open `http://127.0.0.1:5173/#/`.

## Deploy

1. Log in to Cloudflare:

```sh
npx wrangler login
```

2. Set the Worker secret:

```sh
make worker_secret
```

3. Deploy the Worker and GitHub Pages app:

```sh
make deploy WORKER_URL=https://empty-room-demo-api.<your-subdomain>.workers.dev
```

