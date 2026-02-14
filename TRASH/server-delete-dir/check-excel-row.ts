
import * as path from 'path';
import * as XLSX from 'xlsx';

const DATA_DIR = path.join(__dirname, '..', 'data');

function checkScores() {
    const filePath = path.join(DATA_DIR, 'PP1_student_grades.xlsx');
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    // Find Header Row
    let headerRowIndex = -1;
    for (let i = 0; i < rows.length; i++) {
        if (rows[i] && rows[i].includes('No.') && rows[i].includes('Math')) {
            headerRowIndex = i;
            break;
        }
    }

    const dataStartIndex = headerRowIndex + 1;
    console.log(`\n📊 Row data for row 36 (Abdihakim):`);
    console.log(JSON.stringify(rows[dataStartIndex + 35], null, 2));
}

checkScores();
