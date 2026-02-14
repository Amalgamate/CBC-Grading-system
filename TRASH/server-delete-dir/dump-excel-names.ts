
import * as path from 'path';
import * as XLSX from 'xlsx';

const DATA_DIR = path.join(__dirname, '..', 'data');

function dumpExcelNames() {
    const files = [
        { name: 'PP1_student_grades.xlsx', grade: 'PP1' },
        { name: 'PP2_student_grades-PP2.xlsx', grade: 'PP2' }
    ];

    files.forEach(file => {
        const filePath = path.join(DATA_DIR, file.name);
        console.log(`\n📄 Names in ${file.name} (${file.grade}):`);

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

        if (headerRowIndex === -1) {
            console.error('   ❌ Header not found.');
            return;
        }

        const dataStartIndex = headerRowIndex + 1;
        for (let i = dataStartIndex; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length < 3) continue;

            const no = row[0];
            const firstName = (row[1]?.toString() || '').trim();
            const lastName = (row[2]?.toString() || '').trim();

            if (firstName || lastName) {
                console.log(`  - ${no}: ${firstName} ${lastName} (ADM-${file.grade}-${String(no).padStart(3, '0')})`);
            }
        }
    });
}

dumpExcelNames();
