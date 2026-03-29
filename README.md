# 🐋 Whale Radar

**Track and analyze whale wallets with Mobula API** — Real-time monitoring, PnL tracking, win rates, and smart money labels.

Ever wonder what the best traders are buying before it pumps? This tool gives you **complete wallet intelligence** in seconds using Mobula's powerful wallet APIs.

## 🚀 Features

- **📊 Complete Wallet Profiles** — Net worth, realized/unrealized PnL, win rate, trade count
- **🏷️ Smart Labels** — Identify proTraders, whales, smartMoney, snipers, and more
- **🎯 Win Rate Analysis** — See exact distribution of 10x, 5x, 2x trades
- **🪙 Live Positions** — Current holdings with PnL per token
- **⚡ Real-time Monitoring** — Get alerted when whales make moves
- **📈 Side-by-side Comparison** — Compare multiple wallets instantly
- **🌐 Multi-chain Support** — Solana, Ethereum, Base, BSC, and 30+ chains

## 🆚 Why Mobula > Moralis

| Feature | Moralis | Mobula |
|---------|---------|--------|
| Portfolio multi-chain | ✅ | ✅ |
| Win rate calculator | ❌ | ✅ |
| Wallet labels (whale, smartMoney) | ❌ | ✅ |
| Solana memecoins | ❌ | ✅ |
| PnL per token with avg buy price | Partial | ✅ |
| Market cap distribution of trades | ❌ | ✅ |

## 📦 Installation

```bash
# Clone the repo
git clone https://github.com/Flotapponnier/whales-wallet-tracker.git
cd whales-wallet-tracker

# Install dependencies
npm install

# Configure your API key
cp .env.example .env
# Edit .env and add your MOBULA_API_KEY
```

**Get your free API key:** [https://admin.mobula.io](https://admin.mobula.io)

## 🎮 Usage

### 1️⃣ Profile Mode — Deep Analysis

Analyze a single wallet with complete metrics:

```bash
npm run profile <WALLET_ADDRESS> [blockchain]
```

**Example:**
```bash
npm run profile 7xK9F3mK2Z8pQ4nR5vL6wT9hU3f8a solana
```

**Output:**
```
══════════════════════════════════════════════════════════
 WHALE PROFILE  —  7xK9...3f8a  (solana)
══════════════════════════════════════════════════════════

🏷  IDENTITY
   Labels:      proTrader  smartMoney  whale
   Entity:      Unknown wallet

💰 NET WORTH (30d)
   Total:       $1,240,392
   Realized:    +$84,200   (+420%)
   Unrealized:  +$38,000

📊 TRADING PERFORMANCE (30d)
   Win Rate:    73.4%   (34 wins / 47 trades)
   Avg Hold:    1h 0m
   Buys:        47
   Sells:       41

🎯 WIN RATE DISTRIBUTION
   >500%    ████░░  3 trades
   200-500% ███████ 7 trades
   50-200%  ████████████ 12 trades

🔬 TOKEN SIZE PREFERENCE
   <$100k mcap   ████████  8 tokens  ← degen
   $100k-$1M     ██████████████ 14 tokens
   $1M-$10M      █████████ 9 tokens

🪙 TOP POSITIONS (current)
   WIF    $24,500   PnL: +$12,300 (+100.8%)
   BONK   $18,200   PnL:  +$6,100  (+50.4%)
   SOL    $12,000   PnL:  +$1,200   (+11.1%)

📋 RECENT ACTIVITY (last 5 swaps)
   29/03 14:22  SOL → WIF    10.00 → 50,000  ($1,420)
   29/03 11:05  SOL → BONK   5.00 → 5,000,000  ($710)

══════════════════════════════════════════════════════════
🐋 WHALE SCORE: 8.4/10
   proTrader + smartMoney + 73.4% win rate + $1,240,392 portfolio
══════════════════════════════════════════════════════════
```

### 2️⃣ Compare Mode — Multi-Wallet Analysis

Compare multiple wallets side-by-side:

```bash
npm run compare <WALLET1> <WALLET2> [WALLET3] ...
```

**Example:**
```bash
npm run compare 7xK9...3f8a 5nL2...9kPq 3mR8...4vZx
```

**Output:**
```
══════════════════════════════════════════════════════════
 WHALE COMPARISON
══════════════════════════════════════════════════════════

Metric               │ 7xK9...3f8a      │ 5nL2...9kPq      │ 3mR8...4vZx
─────────────────────────────────────────────────────────────────────────
Labels               │ proTrader,whale  │ smartMoney       │ —
Net Worth            │ $1,240,392       │ $892,450         │ $45,200
Win Rate             │ 73.4%            │ 68.2%            │ 51.0%
Realized PnL         │ $84,200          │ $62,100          │ $8,400
Unrealized PnL       │ $38,000          │ $21,300          │ $2,100
Trades (30d)         │ 41               │ 38               │ 12
Avg Hold             │ 1h 0m            │ 2h 15m           │ 6h 30m

🏆 Best performer: 7xK9...3f8a (Whale Score: 8.4/10)
```

### 3️⃣ Watch Mode — Real-Time Monitoring

Monitor a wallet for live activity:

```bash
npm run watch <WALLET_ADDRESS> [blockchain]
```

**Example:**
```bash
npm run watch 7xK9F3mK2Z8pQ4nR5vL6wT9hU3f8a solana
```

**Output:**
```
👀 Watching 7xK9...3f8a  |  poll: 60s
──────────────────────────────────────────────────────────
[14:22:00] Net worth: $1,240,392  stable
[14:23:00] Net worth: $1,241,800  +$1,408
           NEW BUY: 10.00 SOL → WIF  ($1,420) 🟢
[14:24:00] Net worth: $1,239,200  -$2,600
           NEW SELL: BONK $2,600 profit 💸
[14:25:00] Net worth: $1,265,000  +$25,800
           🚨 LARGE BUY: $25,560
```

## 🛠️ Configuration

Edit `.env`:

```bash
# Your Mobula API key (required)
MOBULA_API_KEY=your_api_key_here

# Watch mode polling interval in milliseconds (default: 60000 = 1 min)
WATCH_INTERVAL_MS=60000
```

## 📡 Mobula API Endpoints Used

This tool leverages 6 powerful Mobula endpoints:

1. **`GET /api/1/wallet/portfolio`** — Complete portfolio + realized/unrealized PnL
2. **`GET /api/2/wallet/analysis`** — Win rate, trade performance, period stats
3. **`GET /api/2/wallet/labels`** — Wallet labels (whale, proTrader, smartMoney...)
4. **`GET /api/2/wallet/activity`** — Real-time activity feed (swaps, transfers)
5. **`GET /api/2/wallet/positions`** — Current positions with PnL per token
6. **`GET /api/2/wallet/history`** — Historical net worth over time

**Full API docs:** [https://docs.mobula.io](https://docs.mobula.io)

## 🎬 Demo Video

Watch the full demo on YouTube: [Coming soon]

## 💡 Use Cases

- **Copy Trading** — Find and follow top performers before they pump
- **Whale Alerts** — Get notified when smart money makes moves
- **Portfolio Research** — Analyze successful trading strategies
- **Due Diligence** — Verify if a wallet is actually profitable
- **Competition Analysis** — Benchmark your performance vs whales

## 🌐 Supported Blockchains

Solana, Ethereum, Base, Polygon, BSC, Arbitrum, Optimism, Avalanche, Fantom, and 30+ more.

## 📄 License

MIT

## 🤝 Contributing

PRs welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

## 🔗 Links

- **Mobula API:** [https://mobula.io](https://mobula.io)
- **Docs:** [https://docs.mobula.io](https://docs.mobula.io)
- **Discord:** [https://discord.gg/mobula](https://discord.gg/mobula)
- **Twitter:** [@MobulaIO](https://twitter.com/MobulaIO)

---

Built with ❤️ using [Mobula API](https://mobula.io)
