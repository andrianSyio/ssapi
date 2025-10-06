# 📸 Website Screenshot API (Vercel Serverless)

**API *Serverless* yang sangat cepat** untuk mengambil *screenshot* halaman penuh (*full page*) dari *website* mana pun menggunakan URL. Dibangun dengan **Node.js** dan **Playwright**, di-*deploy* dengan Vercel Serverless Functions.

Respons yang dikembalikan adalah **gambar PNG mentah** (`Content-Type: image/png`).

---

## 💡 Cara Penggunaan API

API Anda menerima satu parameter *query* wajib: `url`.

### Format Endpoint Utama

Gunakan URL proyek Vercel Anda, lalu tambahkan *endpoint* `/api/screenshot`.
