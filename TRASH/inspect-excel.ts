import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const dataDir = path.join(__dirname, '..', 'data');
const targets = [
    { name: 'Grade1.xlsx' },
    { name: 'Grade2.xlsx' },
    { name: 'Grade3.xlsx' }
];

targets.forEach(target => {
    const filePath = path.join(dataDir, target.name);
    if (!fs.existsSync(filePath)) return;

    const workbook = XLSX.readFile(filePath);
    console.log(`\n=== ${target.name} ===`);
    console.log('Sheet Names:', workbook.SheetNames);

    workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
        if (rows.length === 0) return;

        console.log(`\n--- Sheet: ${sheetName} ---`);
        console.log('Headers:', JSON.stringify(rows[0]));
        console.log('Sample Row 1:', JSON.stringify(rows[1]));
        if (rows.length > 5) {
            console.log('Sample Row 5:', JSON.stringify(rows[5]));
        }
    });
});
