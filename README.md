# 🌿 NFT Greenhouse Management System

> Platform manajemen kebun selada bokor berbasis **Nutrient Film Technique (NFT)** — monitoring sensor real-time, manajemen talang, dan pencatatan panen yang terukur.

![Version](https://img.shields.io/badge/version-1.0.0-34d399)
![Status](https://img.shields.io/badge/status-in%20development-f59e0b)
![License](https://img.shields.io/badge/license-MIT-60a5fa)

---

## 📋 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Struktur Proyek](#-struktur-proyek)
- [Instalasi & Setup](#-instalasi--setup)
- [Konfigurasi Environment](#-konfigurasi-environment)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [API Documentation](#-api-documentation)
- [ERD & Database](#-erd--database)
- [Parameter Optimal NFT](#-parameter-optimal-nft)
- [Panduan Kontribusi](#-panduan-kontribusi)
- [Roadmap](#-roadmap)
- [Lisensi](#-lisensi)

---

## 🌱 Tentang Proyek

NFT Greenhouse Management System dirancang untuk mengatasi tantangan pengelolaan kebun hidroponik modern secara digital. Dengan sistem ini, operator kebun dapat:

- **Memonitor** parameter nutrisi (PPM, pH, EC) dan suhu secara real-time dari sensor IoT
- **Mengelola** setiap talang secara individual — dari semai hingga siap panen
- **Mencatat** hasil panen dengan terstruktur termasuk berat, jumlah kepala, dan grade kualitas
- **Menerima alert** otomatis ketika parameter keluar dari rentang optimal beserta saran koreksi
- **Menganalisis** tren produktivitas dari data historis sensor dan riwayat panen

---

## ✨ Fitur Utama

### 🔬 Monitoring Real-Time
- Dashboard sensor PPM, pH, suhu udara & suhu air
- Indikator visual status Normal / Peringatan / Bahaya
- Grafik tren 24 jam, 7 hari, dan 30 hari
- Auto-refresh setiap 5–30 detik via WebSocket

### 🪴 Manajemen Talang
- Tracking 8 talang (expandable hingga 32)
- 4 stage: **Semai → Transplant → Vegetatif → Panen**
- Day counter otomatis + countdown estimasi panen
- Visualisasi slot per talang (20 slot/talang)
- Audit trail perubahan stage (siapa, kapan, dari mana ke mana)

### ⚠️ Sistem Alert
- Alert in-app real-time berdasarkan threshold per stage
- 2 level: Peringatan (kuning) dan Bahaya (merah)
- Setiap alert dilengkapi **tindakan koreksi** yang spesifik
- Notifikasi ke Telegram Bot *(v1.1)*

### 🌾 Manajemen Panen
- Form pencatatan: berat total, jumlah kepala, grade A/B/C
- Kalkulasi otomatis rata-rata berat per kepala
- Riwayat panen dengan filter dan sorting
- Manajemen status jual (Stok / Terjual)
- Bar chart perbandingan yield antar batch

### 📊 Analytics & Log
- Log sensor dengan label status setiap baris
- Tabel referensi parameter optimal per stage
- KPI: total yield, avg yield/batch, utilisasi talang
- Export CSV *(v1.2)*

---

## 🛠 Tech Stack

### Frontend
| Teknologi | Versi | Keterangan |
|-----------|-------|------------|
| React | 18.x | UI Framework |
| Vite | 5.x | Build tool |
| Tailwind CSS | 3.x | Styling |
| Recharts | 2.x | Visualisasi grafik |
| React Router | 6.x | Client-side routing |

### Backend
| Teknologi | Versi | Keterangan |
|-----------|-------|------------|
| Node.js | 20.x | Runtime |
| Fastify | 4.x | Web framework |
| Prisma | 5.x | ORM |
| PostgreSQL | 15.x | Database utama |
| TimescaleDB | 2.x | Extension time-series sensor |
| MQTT (Mosquitto) | 2.x | IoT message broker |

### IoT
| Komponen | Keterangan |
|----------|------------|
| ESP32 | Mikrokontroler utama |
| Sensor EC/TDS Analog | Mengukur PPM / konsentrasi nutrisi |
| pH Sensor Analog | Mengukur keasaman larutan |
| DS18B20 | Sensor suhu air (digital, waterproof) |
| DHT22 | Sensor suhu & kelembaban udara |

### DevOps
| Teknologi | Keterangan |
|-----------|------------|
| Docker & Docker Compose | Containerization |
| GitHub Actions | CI/CD pipeline |
| Railway / Render | Cloud deployment |

---

## 🏗 Arsitektur Sistem

```
┌──────────────────────────────────────────────────────────────┐
│                   FRONTEND (React + Vite)                    │
│        Dashboard │ Talang │ Sensor Log │ Panen │ Alerts       │
└───────────────────────────┬──────────────────────────────────┘
                            │ REST API + WebSocket
┌───────────────────────────▼──────────────────────────────────┐
│                  BACKEND (Node.js + Fastify)                  │
│  /auth  │  /sensor  │  /talang  │  /batch  │  /harvest        │
│  Alert Engine │ Notification Service │ MQTT Subscriber        │
└──────────┬────────────────┬─────────────────────────────────-┘
           │                │
   ┌───────▼──────┐  ┌──────▼──────┐  ┌─────────────────┐
   │  PostgreSQL  │  │    MQTT     │  │  Telegram Bot   │
   │ + Timescale  │  │  Mosquitto  │  │  Notification   │
   └──────────────┘  └──────┬──────┘  └─────────────────┘
                            │
                   ┌────────▼────────┐
                   │   IoT Device    │
                   │   ESP32         │
                   │   EC + pH       │
                   │   DS18B20       │
                   │   DHT22         │
                   └─────────────────┘
```

---

## 📁 Struktur Proyek

```
nft-greenhouse/
├── apps/
│   ├── frontend/                  # React app
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── talang/
│   │   │   │   ├── sensor/
│   │   │   │   ├── harvest/
│   │   │   │   └── ui/            # Shared components
│   │   │   ├── hooks/             # Custom React hooks
│   │   │   ├── pages/
│   │   │   ├── services/          # API calls
│   │   │   ├── store/             # State management
│   │   │   └── utils/
│   │   ├── public/
│   │   ├── index.html
│   │   └── vite.config.js
│   │
│   └── backend/                   # Fastify API
│       ├── src/
│       │   ├── routes/
│       │   │   ├── auth.js
│       │   │   ├── sensor.js
│       │   │   ├── talang.js
│       │   │   ├── batch.js
│       │   │   ├── harvest.js
│       │   │   └── alert.js
│       │   ├── services/
│       │   │   ├── alertEngine.js
│       │   │   ├── mqttSubscriber.js
│       │   │   └── notificationService.js
│       │   ├── plugins/           # Fastify plugins
│       │   ├── middlewares/
│       │   └── utils/
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── migrations/
│       └── server.js
│
├── iot/                           # Firmware ESP32
│   ├── src/
│   │   ├── main.cpp
│   │   ├── sensors.cpp
│   │   └── mqtt_client.cpp
│   ├── include/
│   └── platformio.ini
│
├── docs/
│   ├── PRD.md
│   ├── ERD.mermaid
│   ├── README.md
│   └── api/                       # API spec (OpenAPI)
│
├── docker-compose.yml
├── docker-compose.dev.yml
├── .env.example
├── .gitignore
└── package.json                   # Monorepo root (pnpm workspace)
```

---

## 🚀 Instalasi & Setup

### Prerequisites

Pastikan sudah terinstall:
- **Node.js** v20+ — [nodejs.org](https://nodejs.org)
- **pnpm** v8+ — `npm install -g pnpm`
- **Docker & Docker Compose** — [docker.com](https://docker.com)
- **Git**

### 1. Clone Repository

```bash
git clone https://github.com/your-org/nft-greenhouse.git
cd nft-greenhouse
```

### 2. Install Dependencies

```bash
# Install semua dependencies (monorepo)
pnpm install
```

### 3. Setup Environment Variables

```bash
# Copy file env example
cp .env.example .env

# Edit sesuai kebutuhan
nano .env
```

### 4. Jalankan Database & Broker via Docker

```bash
# Start PostgreSQL + TimescaleDB + MQTT Mosquitto
docker-compose -f docker-compose.dev.yml up -d

# Verifikasi container berjalan
docker-compose ps
```

### 5. Jalankan Database Migration

```bash
cd apps/backend

# Generate Prisma client
pnpm prisma generate

# Jalankan migrasi
pnpm prisma migrate dev --name init

# (Opsional) Seed data awal
pnpm prisma db seed
```

---

## ⚙️ Konfigurasi Environment

Buat file `.env` di root project berdasarkan `.env.example`:

```env
# ========================
# DATABASE
# ========================
DATABASE_URL="postgresql://postgres:password@localhost:5432/nft_greenhouse"

# ========================
# BACKEND
# ========================
NODE_ENV=development
PORT=3001
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

# ========================
# MQTT BROKER
# ========================
MQTT_HOST=localhost
MQTT_PORT=1883
MQTT_USERNAME=greenhouse
MQTT_PASSWORD=your_mqtt_password
MQTT_TOPIC_SENSOR=greenhouse/+/sensor
MQTT_TOPIC_STATUS=greenhouse/+/status

# ========================
# TELEGRAM BOT (Opsional)
# ========================
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# ========================
# FRONTEND
# ========================
VITE_API_BASE_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

---

## ▶️ Menjalankan Aplikasi

### Mode Development

```bash
# Jalankan frontend dan backend bersamaan
pnpm dev

# Atau jalankan terpisah:
pnpm --filter frontend dev      # Frontend → http://localhost:5173
pnpm --filter backend dev       # Backend  → http://localhost:3001
```

### Mode Production (Docker)

```bash
# Build dan jalankan semua service
docker-compose up --build -d

# Cek log
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Akses Aplikasi

| Service | URL |
|---------|-----|
| Frontend Dashboard | http://localhost:5173 |
| Backend API | http://localhost:3001 |
| API Docs (Swagger) | http://localhost:3001/docs |
| MQTT Broker | mqtt://localhost:1883 |

### Default Login (Development)

```
Email    : admin@greenhouse.local
Password : admin123
```

> ⚠️ **Ganti password default sebelum deploy ke production!**

---

## 📡 API Documentation

API lengkap tersedia di Swagger UI: `http://localhost:3001/docs`

### Endpoint Utama

#### Auth
```
POST   /api/auth/login          Login & dapatkan JWT token
POST   /api/auth/logout         Logout
GET    /api/auth/me             Info user yang sedang login
```

#### Sensor
```
GET    /api/sensor/latest       Baca nilai sensor terkini
GET    /api/sensor/history      Riwayat sensor (query: from, to, interval)
POST   /api/sensor/manual       Input manual (jika tidak ada IoT)
```

#### Talang & Batch
```
GET    /api/talang              Daftar semua talang
GET    /api/talang/:id          Detail talang + batch aktif
POST   /api/batch               Buat batch baru di talang
PATCH  /api/batch/:id/stage     Naik stage batch
PATCH  /api/batch/:id           Update data batch
```

#### Panen
```
GET    /api/harvest             Riwayat panen (filter: talang, grade, date)
POST   /api/harvest             Catat hasil panen baru
PATCH  /api/harvest/:id/sell    Tandai sebagai terjual
GET    /api/harvest/stats       Statistik yield & KPI
```

#### Alert
```
GET    /api/alert               Daftar alert aktif & riwayat
PATCH  /api/alert/:id/resolve   Tandai alert sebagai resolved
GET    /api/alert/config        Baca konfigurasi threshold
PUT    /api/alert/config        Update threshold parameter
```

### Contoh Response Sensor

```json
{
  "data": {
    "id": "uuid-...",
    "ppm": 1050,
    "ph": 6.1,
    "temp_air_c": 24.5,
    "temp_water_c": 21.3,
    "humidity_pct": 72,
    "ec_ms": 1.52,
    "ppm_status": "normal",
    "ph_status": "normal",
    "temp_status": "normal",
    "recorded_at": "2026-02-26T10:30:00Z"
  }
}
```

---

## 🗄 ERD & Database

Lihat file [`docs/ERD.mermaid`](./docs/ERD.mermaid) untuk Entity Relationship Diagram lengkap.

### Entitas Utama

| Tabel | Deskripsi |
|-------|-----------|
| `users` | Akun pengguna & role (admin, operator, viewer) |
| `greenhouses` | Master data greenhouse |
| `talangs` | Fisik talang per greenhouse |
| `batches` | Siklus tanam — semai hingga panen |
| `batch_stage_logs` | Audit trail perubahan stage |
| `sensor_readings` | Time-series data sensor IoT |
| `iot_devices` | Registry perangkat ESP32 |
| `alerts` | Peringatan parameter + status resolved |
| `harvests` | Hasil panen per batch |
| `harvest_sales` | Transaksi penjualan hasil panen |
| `nutrient_logs` | Log penambahan nutrisi manual |
| `parameter_configs` | Konfigurasi threshold per stage |
| `notifications` | Log pengiriman notifikasi |

---

## 🌡 Parameter Optimal NFT

### Selada Bokor — Rentang Optimal per Stage

| Parameter | Semai (1–7 hr) | Transplant (8–14 hr) | Vegetatif (15–28 hr) |
|-----------|----------------|----------------------|----------------------|
| PPM | 400 – 600 | 600 – 800 | 800 – 1200 |
| pH | 5.5 – 6.0 | 5.8 – 6.2 | 5.8 – 6.5 |
| Suhu Air | 18 – 22°C | 18 – 23°C | 18 – 24°C |
| Suhu Udara | 20 – 26°C | 20 – 27°C | 18 – 28°C |
| Kelembaban | 65 – 80% | 65 – 80% | 60 – 75% |
| EC | 0.8 – 1.2 | 1.0 – 1.4 | 1.2 – 1.8 |

### Panduan Koreksi Nutrisi (AB Mix)

| Kondisi | Tindakan |
|---------|----------|
| PPM terlalu rendah | Tambahkan AB Mix Part A + B (5ml/L per part) |
| PPM terlalu tinggi | Encerkan dengan air bersih |
| pH terlalu rendah (asam) | Tambahkan pH Up (KOH) — 1ml/10L, tunggu 10 menit, cek ulang |
| pH terlalu tinggi (basa) | Tambahkan pH Down (H₃PO₄) — 1ml/10L, tunggu 10 menit, cek ulang |
| Suhu air > 24°C | Gunakan chiller atau tambahkan es batu food grade |
| Ganti larutan total | Setiap 7–10 hari atau EC naik tidak wajar |

---

## 🤝 Panduan Kontribusi

Kami menyambut kontribusi dalam bentuk apapun — bug report, fitur baru, atau perbaikan dokumentasi.

### Alur Kontribusi

```bash
# 1. Fork repository ini

# 2. Buat branch baru
git checkout -b feat/nama-fitur-kamu

# 3. Commit dengan format Conventional Commits
git commit -m "feat(harvest): tambah filter by grade kualitas"
git commit -m "fix(sensor): perbaiki kalkulasi status pH"
git commit -m "docs(readme): update panduan instalasi"

# 4. Push ke fork kamu
git push origin feat/nama-fitur-kamu

# 5. Buat Pull Request ke branch main
```

### Konvensi Commit

| Prefix | Penggunaan |
|--------|------------|
| `feat` | Fitur baru |
| `fix` | Bug fix |
| `docs` | Perubahan dokumentasi |
| `style` | Formatting, tidak ada perubahan logika |
| `refactor` | Refaktor kode tanpa fitur baru |
| `test` | Menambah atau memperbaiki test |
| `chore` | Update dependencies, config |

### Code Style

- **Frontend:** ESLint + Prettier (config ada di `.eslintrc.js`)
- **Backend:** ESLint + standar Fastify
- **Gunakan bahasa Indonesia** untuk komentar dan variabel domain bisnis
- **Gunakan bahasa Inggris** untuk variabel teknis dan fungsi utilitas

---

## 🗺 Roadmap

### ✅ v1.0 — MVP (Target: Q1 2026)
- [x] Dashboard monitoring dengan simulasi data
- [x] Manajemen talang + stage tracking
- [x] Form pencatatan panen
- [x] Alert in-app
- [x] Tabel riwayat sensor & panen
- [ ] Autentikasi user
- [ ] Koneksi ke database PostgreSQL

### 🚧 v1.1 — IoT Integration (Target: Q2 2026)
- [ ] Koneksi ESP32 + sensor fisik (EC, pH, suhu)
- [ ] MQTT subscriber di backend
- [ ] WebSocket untuk update real-time
- [ ] Notifikasi Telegram Bot
- [ ] Kalibrasi sensor + reminder

### 📅 v1.2 — Analytics (Target: Q3 2026)
- [ ] Export CSV / Excel data panen
- [ ] Laporan bulanan otomatis (PDF)
- [ ] Kalkulasi HPP dasar
- [ ] Planting calendar & jadwal rotasi talang
- [ ] Grafik historis 30 hari

### 💡 v2.0 — Advanced (TBD)
- [ ] Multi-greenhouse support
- [ ] Analitik prediktif yield
- [ ] Integrasi otomatis aktuator (pompa dosing)
- [ ] Mobile app (React Native)

---

## 📄 Dokumentasi Terkait

| Dokumen | Deskripsi |
|---------|-----------|
| [`docs/PRD.md`](./docs/PRD.md) | Product Requirements Document lengkap |
| [`docs/ERD.mermaid`](./docs/ERD.mermaid) | Entity Relationship Diagram database |
| [`docs/api/openapi.yaml`](./docs/api/) | Spesifikasi API (OpenAPI 3.0) |

---

## 📬 Kontak & Support

- **Issues:** Gunakan [GitHub Issues](https://github.com/your-org/nft-greenhouse/issues) untuk bug report
- **Diskusi:** Gunakan [GitHub Discussions](https://github.com/your-org/nft-greenhouse/discussions) untuk pertanyaan umum

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah **MIT License** — lihat file [LICENSE](./LICENSE) untuk detail lengkap.

---

<div align="center">
  <sub>Dibuat dengan ❤️ untuk petani hidroponik Indonesia</sub>
</div>
