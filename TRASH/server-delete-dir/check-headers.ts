
import * as path from 'path';
import * as XLSX from 'xlsx';

const DATA_DIR = path.join(__dirname, '..', 'data');

function checkHeaders() {
    const files = [
        'PP1_student_grades.xlsx',
        'PP2_student_grades-PP2.xlsx'
    ];

    files.forEach(file => {
        const filePath = path.join(DATA_DIR, file);
        const workbook = XLSX.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

        let headerRow: any[] = [];
        for (let i = 0; i < rows.length; i++) {
            if (rows[i] && rows[i].includes('No.') && rows[i].includes('Math')) {
                headerRow = rows[i];
                break;
            }
        }

        console.log(`\n📋 Headers in ${file}:`);
        console.log(headerRow.filter(h => h).map((h, i) => `${i}: ${h}`).join(' | '));
    });
}

checkHeaders();
