# Installation & Setup Guide (`v0.1.0-beta`)

## System Requirements

- **Node.js:** `>= 22.0.0`
- **pnpm / npm:** `>= 11.0.0` / `>= 10.0.0`
- **Git:** `>= 2.30.0`
- **Ollama (Optional for 100% Local Inference):** `http://localhost:11434`

---

## Step 1: Clone Repository

```bash
git clone https://github.com/Antigravity/zoro.git
cd zoro
```

## Step 2: Install Dependencies

```bash
pnpm install
```

## Step 3: Build Monorepo

```bash
npm run build
```

## Step 4: Configure Local Ollama (Optional)

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull recommended model
ollama pull llama3
```

## Step 5: Launch Services

```bash
# Start API Server
npm run start --prefix services/api

# Start Web UI
npm run dev --prefix apps/web
```

Open `http://localhost:3001` in your browser.
