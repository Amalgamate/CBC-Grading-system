import puppeteer from 'puppeteer';

export class PdfService {
    /**
     * Generates a high-quality PDF from HTML content
     * @param html The full HTML string to render
     * @param options Puppeteer PDF options
     */
    async generatePdf(html: string, options: any = {}): Promise<Buffer> {
        const memoryBefore = process.memoryUsage().heapUsed / 1024 / 1024;
        console.log(`📄 PDF Service: Starting PDF generation... (Heap: ${Math.round(memoryBefore)}MB, HTML: ${html.length} chars)`);

        let browser;
        try {
            console.log('🌐 Launching browser...');
            browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu', // Recommended for Windows headless
                    '--font-render-hinting=none', // Cleaner fonts in PDF
                ],
            });

            const page = await browser.newPage();

            // Log console messages from the page for better debugging
            page.on('console', msg => console.log('PAGE LOG:', msg.text()));

            console.log('📝 Setting page content...');
            // networkidle2 is often safer than networkidle0 as it allows up to 2 active connections
            await page.setContent(html, {
                waitUntil: ['domcontentloaded'], // Faster start
                timeout: 10000 // 10s is plenty for local content
            });

            // If we have network resources, wait a bit longer for them specifically
            // but don't block the whole process if a few icons fail
            try {
                await page.waitForNetworkIdle({ timeout: 5000 }).catch(() => null);
            } catch (e) { }

            console.log('🖨️ Generating PDF buffer...');
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '10mm',
                    right: '10mm',
                    bottom: '10mm',
                    left: '10mm',
                },
                ...options,
            });

            console.log(`✅ PDF Service: Success! Buffer size: ${pdfBuffer.length} bytes`);
            const memoryAfter = process.memoryUsage().heapUsed / 1024 / 1024;
            console.log(`📊 Memory after generation: ${Math.round(memoryAfter)}MB (Diff: ${Math.round(memoryAfter - memoryBefore)}MB)`);

            return Buffer.from(pdfBuffer);
        } catch (error) {
            console.error('❌ PDF Service Error:', error);
            throw error;
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }
}

export default new PdfService();
