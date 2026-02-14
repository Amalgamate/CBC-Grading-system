
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
const files = ['PP1_student_grades.xlsx', 'PP2_student_grades-PP2.xlsx'];

files.forEach(file => {
    const filePath = path.join(dataDir, file);
    if (fs.existsSync(filePath)) {
        console.log(`\n--- Reading ${file} ---`);
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Print first 15 rows to find the header
        const rowsStats = data.length < 15 ? data.length : 15;
        for (let i = 0; i < rowsStats; i++) {
            console.log(`Row ${i}:`, JSON.stringify(data[i]));
        }
    } else {
        console.log(`File not found: ${filePath}`);
    }
});
