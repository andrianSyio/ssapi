// File: api/screenshot.js

// Import library yang diperlukan
const { chromium } = require('playwright-core');
const { get};

// Handler utama untuk Vercel Serverless Function
module.exports = async (req, res) => {
    // Mengambil parameter 'url' dari query string, misalnya /api/screenshot?url=https://google.com
    const targetUrl = req.query.url;

    // Set header agar respons berupa gambar PNG
    res.setHeader('Content-Type', 'image/png');

    // Cek apakah URL disediakan
    if (!targetUrl) {
        // Jika tidak ada URL, kirim pesan kesalahan
        res.status(400).send('Parameter "url" wajib disertakan. Contoh: /api/screenshot?url=https://example.com');
        return;
    }

    let browser;
    let screenshot;

    try {
        // 1. Dapatkan jalur executable Chromium yang kompatibel dengan Lambda/Vercel
        const executablePath = await getExecutablePath();

        // 2. Luncurkan browser Chromium
        browser = await chromium.launch({
            executablePath,
            args: chromium.args,
            headless: chromium.headless,
        });

        // 3. Buka halaman baru
        const page = await browser.newPage();
        
        // Atur viewport (resolusi)
        await page.setViewportSize({ width: 1280, height: 720 });

        // 4. Navigasi ke URL yang ditargetkan
        await page.goto(targetUrl, {
             // Tunggu hingga jaringan benar-benar idle (opsional, dapat diganti 'load' jika ingin lebih cepat)
             waitUntil: 'networkidle', 
             timeout: 10000 // Timeout setelah 10 detik
        });

        // 5. Ambil screenshot halaman penuh (fullPage: true)
        screenshot = await page.screenshot({ 
            type: 'png',
            fullPage: true
        });

        // 6. Kirim screenshot sebagai respons
        res.status(200).send(screenshot);

    } catch (error) {
        // Tangani error dan kirim respons 500
        console.error('Error saat mengambil screenshot:', error);
        res.status(500).send(`Gagal mengambil screenshot: ${error.message}`);
    } finally {
        // Pastikan browser ditutup setelah selesai atau terjadi error
        if (browser) {
            await browser.close();
        }
    }
};
