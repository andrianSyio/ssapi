// File: api/screenshot.js

// Import library yang diperlukan:
// 1. playwright-core untuk fungsionalitas browser utama
const { chromium } = require('playwright-core');
// 2. playwright-aws-lambda untuk mendapatkan path executable Chromium yang kompatibel dengan Lambda/Vercel
const { getExecutablePath } = require('playwright-aws-lambda'); 

// Handler utama untuk Vercel Serverless Function
module.exports = async (req, res) => {
    // Mengambil parameter 'url' dari query string
    const targetUrl = req.query.url;

    // Set header agar respons berupa gambar PNG
    res.setHeader('Content-Type', 'image/png');

    // --- Validasi Input ---
    if (!targetUrl) {
        // Jika tidak ada URL, kirim pesan kesalahan 400
        res.status(400).send('Parameter "url" wajib disertakan. Contoh: /api/screenshot?url=https://example.com');
        return;
    }

    let browser;
    let screenshot;

    try {
        // 1. Dapatkan jalur executable Chromium yang kompatibel dengan Lambda/Vercel
        const executablePath = await getExecutablePath();

        // 2. Luncurkan browser Chromium (menggunakan executable path yang didapat)
        browser = await chromium.launch({
            executablePath,
            args: chromium.args,
            headless: chromium.headless,
        });

        // 3. Buka halaman baru dan atur viewport
        const page = await browser.newPage();
        
        // Mengatur resolusi layar simulasi
        await page.setViewportSize({ width: 1280, height: 720 });

        // 4. Navigasi ke URL yang ditargetkan
        await page.goto(targetUrl, {
             // Tunggu hingga jaringan benar-benar idle (maksimal 10 detik)
             waitUntil: 'networkidle', 
             timeout: 10000 
        });

        // 5. Ambil screenshot halaman penuh (fullPage: true)
        screenshot = await page.screenshot({ 
            type: 'png',
            fullPage: true
        });

        // 6. Kirim screenshot sebagai respons sukses (200 OK)
        res.status(200).send(screenshot);

    } catch (error) {
        // Tangani error, misalnya jika navigasi gagal (timeout) atau error Playwright lainnya
        console.error('Error saat mengambil screenshot:', error);
        res.status(500).send(`Gagal mengambil screenshot: Pastikan URL valid dan dapat diakses. Detail Error: ${error.message}`);
    } finally {
        // 7. Pastikan browser ditutup untuk membebaskan sumber daya
        if (browser) {
            await browser.close();
        }
    }
};
