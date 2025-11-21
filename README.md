# rotaptcha-node

A modern, gamified CAPTCHA solution for Node.js — no distorted text, no annoyance, just fun interactive challenges that users actually enjoy.

## Features

- **Truly engaging challenges** – mini-games instead of unreadable text  
- **Zero external dependencies** – pure, lightweight TypeScript/JavaScript  
- **Framework-agnostic** – works seamlessly with Express, Fastify, Next.js API routes, Hono, Elysia, and any Node.js server  
- **Simple token-based verification** – generate on frontend, verify on backend in one line  
- **Blazing fast** – sub-millisecond verification, tiny bundle size  
- **Fully customizable** – adjust difficulty, appearance, and game types  

## Installation

```bash
npm install rotaptcha-node
```

```bash
yarn add rotaptcha-node
```

```bash
pnpm add rotaptcha-node
```

```bash
bun add rotaptcha-node
```

## Quick Start

```ts
// 1. Backend – verify the token
import { verifyRotaptchaToken } from 'rotaptcha-node';

app.post('/submit', async (req, res) => {
  const { rotaptchaToken } = req.body;

  const result = await verifyRotaptchaToken(rotaptchaToken);

  if (!result.success) {
    return res.status(400).json({ error: 'Invalid CAPTCHA' });
  }

  // Proceed with your logic
  res.json({ message: 'Success!' });
});
```

Frontend integration is just as simple (React, Vue, Svelte, vanilla JS all supported).  
Check the full documentation at **rotaptcha.com/docs** for client-side setup and styling options.

## Why rotaptcha?

Because traditional CAPTCHAs frustrate users and hurt conversion rates.  
rotaptcha turns security into a delightful micro-interaction that users love to complete.

Start protecting your users today — no more “I can’t read this squiggly text” support tickets.

Made with care for modern web applications.