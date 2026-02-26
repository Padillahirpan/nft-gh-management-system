# Product Requirements Document (PRD)
## NFT Greenhouse Management System — Selada Bokor

**Versi:** 1.0.0  
**Tanggal:** 26 Februari 2026  
**Status:** Draft  
**Author:** Tim Produk  
**Stakeholder:** Pemilik Greenhouse, Operator Kebun

---

## 1. Executive Summary

NFT Greenhouse Management System adalah platform manajemen kebun selada bokor berbasis teknologi **Nutrient Film Technique (NFT)** di dalam greenhouse. Sistem ini dirancang untuk memonitor parameter lingkungan secara real-time (PPM, pH, suhu), mengelola siklus tanam per talang, serta mencatat dan menganalisis hasil panen secara terukur dan sistematis.

Tujuan utama produk ini adalah meningkatkan efisiensi operasional, meminimalkan kerugian akibat kegagalan nutrisi atau pertumbuhan, dan menghasilkan data historis yang dapat digunakan untuk mengoptimalkan produktivitas kebun secara berkelanjutan.

---

## 2. Latar Belakang & Masalah

### 2.1 Konteks Bisnis

Kebun selada bokor dengan sistem NFT mengandalkan sirkulasi air bernutrisi (AB Mix) yang mengalir tipis di atas talang. Ketidakstabilan PPM, pH, atau suhu dapat menyebabkan kerusakan tanaman dalam waktu singkat. Saat ini, sebagian besar pengelolaan masih dilakukan secara manual — pengecekan dicatat di buku atau spreadsheet terpisah, dan tidak ada sistem notifikasi otomatis.

### 2.2 Pain Points yang Diidentifikasi

| # | Masalah | Dampak |
|---|---------|--------|
| 1 | Pengecekan PPM/pH manual tidak terjadwal | Nutrisi sering tidak optimal, tanaman lambat tumbuh |
| 2 | Tidak ada tracking per talang secara individual | Sulit mengetahui talang mana yang siap panen |
| 3 | Riwayat panen tidak tercatat secara konsisten | Tidak bisa menganalisis tren produktivitas |
| 4 | Tidak ada alert jika parameter keluar rentang | Kerusakan sering baru diketahui setelah parah |
| 5 | Rotasi tanam tidak terencana | Talang sering kosong, kapasitas tidak teroptimalkan |

### 2.3 Kesempatan

Dengan digitalisasi manajemen kebun, operator dapat memangkas waktu monitoring manual hingga **60%**, meningkatkan konsistensi kualitas panen, dan mengoptimalkan utilisasi talang hingga **90%+**.

---

## 3. Tujuan Produk

### 3.1 Goals

- Menyediakan **monitoring real-time** parameter PPM, pH, suhu udara, dan suhu air
- Membangun **sistem manajemen talang** yang melacak setiap talang dari semai hingga panen
- Menciptakan **manajemen panen yang terukur** dengan pencatatan berat, kualitas, dan analitik
- Menghasilkan **alert otomatis** ketika parameter berada di luar rentang optimal
- Menyimpan **riwayat historis** sensor dan panen untuk analisis jangka panjang

### 3.2 Non-Goals (Versi 1.0)

- Integrasi otomatis dengan aktuator (pompa, valve) — dikontrol manual
- Fitur e-commerce atau manajemen penjualan
- Dukungan multi-greenhouse / multi-lokasi
- Analitik prediktif berbasis machine learning

---

## 4. Target Pengguna

### 4.1 Primary User: Operator Kebun

- Usia: 20–45 tahun
- Pengalaman teknis: menengah (familiar dengan smartphone/tablet)
- Frekuensi akses: beberapa kali sehari
- Kebutuhan: monitoring cepat, alert mudah dipahami, aksi koreksi yang jelas

### 4.2 Secondary User: Pemilik / Manajer

- Frekuensi akses: harian atau mingguan
- Kebutuhan: laporan ringkas, tren produktivitas, data panen

---

## 5. Fitur & Requirements

### 5.1 Modul 1: Dashboard Monitoring Real-Time

**Deskripsi:** Halaman utama yang menampilkan kondisi terkini semua parameter penting dan status keseluruhan kebun.

#### Functional Requirements

| ID | Requirement | Prioritas |
|----|-------------|-----------|
| FR-1.1 | Sistem menampilkan nilai PPM terkini dari sensor | P1 |
| FR-1.2 | Sistem menampilkan nilai pH terkini dari sensor | P1 |
| FR-1.3 | Sistem menampilkan suhu udara dan suhu air terkini | P1 |
| FR-1.4 | Setiap parameter menampilkan indikator status: Normal / Peringatan / Bahaya | P1 |
| FR-1.5 | Dashboard menampilkan KPI: total talang aktif, talang siap panen, total yield, avg yield per batch | P2 |
| FR-1.6 | Sistem menampilkan grafik tren 24 jam untuk PPM, pH, dan suhu | P2 |
| FR-1.7 | Data sensor ter-refresh otomatis setiap 5–30 detik | P1 |
| FR-1.8 | Dashboard menampilkan quick overview status semua talang | P2 |

#### Rentang Parameter Optimal

| Parameter | Min | Max | Satuan | Aksi Koreksi |
|-----------|-----|-----|--------|--------------|
| PPM | 800 | 1200 | ppm | < min: tambah AB Mix; > max: encerkan |
| pH | 5.5 | 6.5 | — | < min: tambah pH Up; > max: tambah pH Down |
| Suhu Udara | 18 | 28 | °C | > max: buka ventilasi / cooling |
| Suhu Air | 18 | 24 | °C | > max: chiller / shade tambahan |

---

### 5.2 Modul 2: Manajemen Talang

**Deskripsi:** Pengelolaan setiap talang secara individual, mulai dari planting date hingga siap panen.

#### Functional Requirements

| ID | Requirement | Prioritas |
|----|-------------|-----------|
| FR-2.1 | Sistem menyimpan data setiap talang: ID, nama, batch ID, tanggal tanam, stage, varietas | P1 |
| FR-2.2 | Setiap talang memiliki 4 stage: Semai → Transplant → Vegetatif → Panen | P1 |
| FR-2.3 | Operator dapat naik-stage talang secara manual | P1 |
| FR-2.4 | Sistem otomatis menghitung hari ke-berapa tanam (Day Counter) | P1 |
| FR-2.5 | Sistem menghitung estimasi hari panen berdasarkan tanggal tanam + 28 hari | P1 |
| FR-2.6 | Operator dapat mencatat jumlah slot terisi dan kondisi kesehatan talang | P2 |
| FR-2.7 | Sistem menampilkan visualisasi slot (grid 20 slot) per talang | P3 |
| FR-2.8 | Sistem menampilkan estimasi yield berdasarkan slot terisi | P2 |
| FR-2.9 | Talang yang mencapai hari ke-28 otomatis bertanda "Siap Panen" | P1 |
| FR-2.10 | Operator dapat menambah catatan bebas per talang | P3 |

#### Data Model Talang

```
Talang {
  id: String (T01–T08)
  batchId: String (B-YYYY-NNN)
  variety: String
  plantDate: Date
  harvestDate: Date (plantDate + 28 hari)
  stage: Enum [Semai, Transplant, Vegetatif, Panen]
  daysSincePlant: Number
  slots: Number (default: 20)
  filledSlots: Number
  estimatedYield: Number (gram)
  health: Enum [Baik, Perlu Perhatian, Kritis]
  notes: String
}
```

---

### 5.3 Modul 3: Alert & Notifikasi

**Deskripsi:** Sistem peringatan otomatis ketika parameter di luar rentang optimal.

#### Functional Requirements

| ID | Requirement | Prioritas |
|----|-------------|-----------|
| FR-3.1 | Sistem menampilkan alert in-app ketika PPM < 800 atau > 1200 | P1 |
| FR-3.2 | Sistem menampilkan alert in-app ketika pH < 5.5 atau > 6.5 | P1 |
| FR-3.3 | Sistem menampilkan alert in-app ketika suhu udara > 28°C | P1 |
| FR-3.4 | Setiap alert menyertakan **tindakan koreksi** yang disarankan | P1 |
| FR-3.5 | Alert dibedakan menjadi 2 level: Peringatan (kuning) dan Bahaya (merah) | P2 |
| FR-3.6 | (v1.1) Notifikasi push ke Telegram/WhatsApp | P3 |
| FR-3.7 | (v1.1) Riwayat alert dapat dilihat per tanggal | P3 |

---

### 5.4 Modul 4: Manajemen Panen

**Deskripsi:** Pencatatan hasil panen yang terukur dan analitik performa per batch.

#### Functional Requirements

| ID | Requirement | Prioritas |
|----|-------------|-----------|
| FR-4.1 | Operator dapat memicu "Catat Panen" untuk talang yang siap | P1 |
| FR-4.2 | Form panen mencatat: berat total (gram), jumlah kepala, grade (A/B/C), catatan | P1 |
| FR-4.3 | Sistem otomatis menghitung rata-rata berat per kepala | P1 |
| FR-4.4 | Riwayat panen tersimpan dan dapat dilihat dalam tabel | P1 |
| FR-4.5 | Setelah panen dicatat, talang otomatis direset ke stage Semai | P2 |
| FR-4.6 | Dashboard menampilkan total yield kumulatif (kg) | P2 |
| FR-4.7 | Sistem menampilkan bar chart yield per batch | P2 |
| FR-4.8 | Operator dapat menandai hasil panen sebagai "Terjual" atau "Stok" | P3 |
| FR-4.9 | (v1.1) Export data panen ke CSV/Excel | P3 |

#### Grading Kualitas

| Grade | Kriteria |
|-------|----------|
| A | Daun utuh, warna hijau segar, berat kepala ≥ 120 gram |
| B | Sedikit cacat fisik, berat kepala 80–119 gram |
| C | Cacat/rusak, berat kepala < 80 gram atau tidak layak jual premium |

---

### 5.5 Modul 5: Log Sensor & Historis

**Deskripsi:** Rekap dan visualisasi data sensor untuk analisis operasional.

#### Functional Requirements

| ID | Requirement | Prioritas |
|----|-------------|-----------|
| FR-5.1 | Sistem menyimpan log sensor setiap interval (default: 30 menit) | P1 |
| FR-5.2 | Log menampilkan: timestamp, PPM, pH, suhu udara, suhu air, status | P1 |
| FR-5.3 | Setiap baris log diberi label "Normal" atau "Butuh Koreksi" | P2 |
| FR-5.4 | Grafik tren tersedia untuk rentang waktu: 24 jam, 7 hari, 30 hari | P2 |
| FR-5.5 | Tabel referensi parameter optimal tersedia di dalam modul ini | P3 |

---

## 6. Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-1 | **Performa** — Halaman dashboard load dalam < 2 detik | SLA: 99% request |
| NFR-2 | **Availability** — Sistem dapat diakses 24/7 | Uptime ≥ 99.5% |
| NFR-3 | **Responsif** — Tampilan optimal di tablet dan desktop | Breakpoint: 768px, 1024px, 1440px |
| NFR-4 | **Keamanan** — Akses dilindungi login (username + password) | Auth wajib untuk semua route |
| NFR-5 | **Skalabilitas** — Arsitektur mendukung penambahan talang | Hingga 32 talang tanpa refaktor besar |
| NFR-6 | **Retensi Data** — Log sensor disimpan minimal 1 tahun | Data tidak dihapus otomatis < 12 bulan |

---

## 7. Arsitektur Sistem (High Level)

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React PWA)                 │
│  Dashboard │ Talang │ Sensor Log │ Panen │ Alerts        │
└──────────────────────┬──────────────────────────────────┘
                       │ REST API / WebSocket
┌──────────────────────▼──────────────────────────────────┐
│                  BACKEND (Node.js / Fastify)             │
│  Auth │ Sensor API │ Talang API │ Panen API │ Alert Engine│
└──────────────────────┬──────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
    ┌──────────┐ ┌──────────┐ ┌──────────────┐
    │ Database │ │   MQTT   │ │   Notif      │
    │(Postgres)│ │ Broker   │ │ (Telegram)   │
    └──────────┘ └────┬─────┘ └──────────────┘
                      │
               ┌──────▼──────┐
               │  IoT Device  │
               │ (ESP32)      │
               │ Sensor EC/pH │
               │ DS18B20 Suhu │
               └─────────────┘
```

### Stack Teknologi yang Direkomendasikan

| Layer | Teknologi |
|-------|-----------|
| Frontend | React + Tailwind CSS / Vite |
| Backend | Node.js + Fastify atau Express |
| Database | PostgreSQL (data terstruktur) + TimescaleDB (time-series sensor) |
| IoT | ESP32 + sensor EC, pH analog, DS18B20 |
| Broker | MQTT (Mosquitto) atau HTTP polling |
| Notifikasi | Telegram Bot API |
| Deployment | Railway / Render / VPS murah |

---

## 8. User Stories

### Epic 1: Monitoring Sensor

> **US-01** — Sebagai operator, saya ingin melihat nilai PPM, pH, dan suhu terkini di satu layar, sehingga saya bisa mengetahui kondisi nutrisi tanpa perlu mengecek secara fisik.

> **US-02** — Sebagai operator, saya ingin mendapatkan notifikasi/alert ketika pH keluar dari rentang, sehingga saya bisa segera mengambil tindakan koreksi.

> **US-03** — Sebagai manajer, saya ingin melihat grafik tren 7 hari, sehingga saya bisa mengevaluasi konsistensi pengelolaan nutrisi.

### Epic 2: Manajemen Talang

> **US-04** — Sebagai operator, saya ingin melihat semua talang beserta stage dan hari tanamnya, sehingga saya tahu talang mana yang perlu perhatian hari ini.

> **US-05** — Sebagai operator, saya ingin menaikkan stage talang secara manual, sehingga status talang selalu akurat.

> **US-06** — Sebagai operator, saya ingin melihat countdown hari panen tiap talang, sehingga bisa merencanakan jadwal panen lebih baik.

### Epic 3: Manajemen Panen

> **US-07** — Sebagai operator, saya ingin mencatat berat dan jumlah kepala saat panen, sehingga ada rekap tertulis yang akurat setiap siklus.

> **US-08** — Sebagai manajer, saya ingin melihat total yield bulanan dan rata-rata yield per batch, sehingga bisa mengevaluasi performa kebun.

> **US-09** — Sebagai manajer, saya ingin membandingkan yield antar batch, sehingga bisa mengidentifikasi batch mana yang paling produktif.

---

## 9. Siklus Hidup Tanaman (Business Logic)

```
Hari 0      Hari 1–7       Hari 8–14     Hari 15–28    Hari 28+
Tanam  →    SEMAI      →   TRANSPLANT → VEGETATIF   → PANEN
            PPM: 400–600   PPM: 600–800  PPM: 800–1200
            pH: 5.5–6.0    pH: 5.8–6.2   pH: 5.8–6.5
```

**Aturan Rotasi:**
- Segera setelah panen dicatat → talang direset ke stage Semai
- Talang idealnya tidak kosong lebih dari 3 hari
- Jadwal tanam diatur zig-zag antar talang agar panen tidak serentak semua

---

## 10. Metrik Keberhasilan (KPI Produk)

| Metrik | Baseline (Saat Ini) | Target Setelah 3 Bulan |
|--------|---------------------|------------------------|
| Avg yield per talang per siklus | ~180 gram | ≥ 220 gram |
| % waktu parameter dalam rentang optimal | ~70% | ≥ 90% |
| Utilisasi talang (slot terisi / total slot) | ~75% | ≥ 90% |
| Waktu deteksi masalah nutrisi | > 4 jam | < 30 menit |
| Data panen yang tercatat lengkap | ~50% | 100% |

---

## 11. Rencana Rilis

### v1.0 — MVP (8 minggu)
- Dashboard monitoring (simulasi data / manual input)
- Manajemen talang dasar (CRUD + stage tracking)
- Form pencatatan panen
- Alert in-app
- Tabel riwayat sensor & panen

### v1.1 — IoT Integration (minggu 9–14)
- Koneksi ESP32 + sensor fisik (EC, pH, suhu)
- MQTT / HTTP polling ke backend
- Notifikasi Telegram Bot
- Grafik historis (7 hari, 30 hari)

### v1.2 — Analytics (minggu 15–20)
- Export CSV/Excel data panen
- Laporan bulanan otomatis
- Kalkulasi HPP (Harga Pokok Produksi) dasar
- Manajemen jadwal tanam (planting calendar)

---

## 12. Risiko & Mitigasi

| Risiko | Probabilitas | Dampak | Mitigasi |
|--------|-------------|--------|----------|
| Sensor tidak akurat / drift | Sedang | Tinggi | Kalibrasi sensor rutin 2 minggu sekali; tampilkan tanggal kalibrasi terakhir |
| Koneksi IoT terputus | Sedang | Sedang | Mode manual input sebagai fallback; tampilkan "Last Updated: X menit lalu" |
| Data hilang saat power mati | Rendah | Tinggi | Backup database harian otomatis; ESP32 menyimpan data lokal sementara |
| Operator tidak disiplin input | Tinggi | Sedang | UX sesederhana mungkin; notifikasi reminder pengecekan terjadwal |
| Over-/under-nutrisi tidak terdeteksi | Rendah | Tinggi | Alert threshold ketat + panduan koreksi langsung di layar |

---

## 13. Glosarium

| Istilah | Definisi |
|---------|----------|
| NFT | Nutrient Film Technique — teknik hidroponik di mana air nutrisi mengalir tipis di dasar talang |
| PPM | Parts Per Million — satuan konsentrasi nutrisi dalam larutan |
| EC | Electrical Conductivity — konduktivitas listrik larutan, proxy konsentrasi nutrisi |
| AB Mix | Campuran 2 larutan nutrisi hidroponik (Part A dan Part B) |
| Talang | Saluran tempat tumbuh tanaman dalam sistem NFT |
| Batch | Satu siklus tanam pada satu talang, dari semai hingga panen |
| Grade A/B/C | Klasifikasi kualitas hasil panen berdasarkan berat dan kondisi fisik |
| Day Counter | Hitungan hari sejak tanggal tanam pertama |

---

*Dokumen ini bersifat living document dan akan diperbarui seiring perkembangan produk.*

**Last Updated:** 26 Februari 2026 | **Next Review:** 15 Maret 2026
