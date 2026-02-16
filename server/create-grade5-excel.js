const XLSX = require('xlsx');
const path = require('path');

// Grade 5 Scores Data
const grade5ScoresData = [
  { name: "Seraphine Kawera", scores: { ENG: 77, MAT: 96, KISWA: 86, AGRI: 77, SST: 32, SCI: 70, CA: 60, RE: 83 } },
  { name: "Reviey Abdi", scores: { ENG: 70, MAT: 82, KISWA: 82, AGRI: 82, SST: 80, SCI: 82, CA: 71, RE: 84 } },
  { name: "Habiba Said", scores: { ENG: 80, MAT: 84, KISWA: 82, AGRI: 84, SST: 80, SCI: 88, CA: 84, RE: 93 } },
  { name: "Ridhwan Adeni", scores: { ENG: 72, MAT: 78, KISWA: 26, AGRI: 76, SST: 77, SCI: 76, CA: 84, RE: 90 } },
  { name: "Ruweidha Dalry", scores: { ENG: 77, MAT: 70, KISWA: 82, AGRI: 28, SST: 73, SCI: 68, CA: 80, RE: 87 } },
  { name: "Abdi Zueick Ibrahim", scores: { ENG: 90, MAT: 92, KISWA: 70, AGRI: 84, SST: 33, SCI: 64, CA: 60, RE: 89 } },
  { name: "Shulehe Ibrahim", scores: { ENG: 60, MAT: 62, KISWA: 82, AGRI: 72, SST: 80, SCI: 80, CA: 72, RE: 76 } },
  { name: "Muud ABDI", scores: { ENG: 60, MAT: 60, KISWA: 74, AGRI: 38, SST: 73, SCI: 52, CA: 76, RE: 80 } },
  { name: "Mutolih Dahiry", scores: { ENG: 70, MAT: 68, KISWA: 68, AGRI: 34, SST: 70, SCI: 60, CA: 30, RE: 70 } },
  { name: "Fayhiya Mohamed", scores: { ENG: 67, MAT: 84, KISWA: 63, AGRI: 60, SST: 70, SCI: 63, CA: 76, RE: 85 } },
  { name: "Haneen Mohamed", scores: { ENG: 67, MAT: 72, KISWA: 70, AGRI: 70, SST: 70, SCI: 53, CA: 76, RE: 84 } },
  { name: "Somiya Shukri", scores: { ENG: 57, MAT: 26, KISWA: 54, AGRI: 60, SST: 67, SCI: 72, CA: 60, RE: 87 } },
  { name: "Ruweidhe Mohamed", scores: { ENG: 67, MAT: 66, KISWA: 72, AGRI: 77, SST: 60, SCI: 76, CA: 68, RE: 72 } },
  { name: "Abdula Abdi", scores: { ENG: 70, MAT: 58, KISWA: 60, AGRI: 34, SST: 62, SCI: 66, CA: 76, RE: 82 } },
  { name: "Ilrah Hussein", scores: { ENG: 73, MAT: 12, KISWA: 64, AGRI: 56, SST: 67, SCI: 64, CA: 30, RE: 84 } },
  { name: "Shureyim Mustafa", scores: { ENG: 63, MAT: 44, KISWA: 44, AGRI: 72, SST: 65, SCI: 60, CA: 60, RE: 80 } },
  { name: "Uthmari Hassan", scores: { ENG: 63, MAT: 56, KISWA: 62, AGRI: 80, SST: 87, SCI: 54, CA: 52, RE: 84 } },
  { name: "Yasmin Ribog", scores: { ENG: 73, MAT: 68, KISWA: 52, AGRI: 87, SST: 84, SCI: 54, CA: 32, RE: 67 } },
  { name: "Rayann Adams", scores: { ENG: 63, MAT: 74, KISWA: 70, AGRI: 62, SST: 57, SCI: 64, CA: 64, RE: 64 } },
  { name: "Tudis Nassir", scores: { ENG: 37, MAT: 72, KISWA: 56, AGRI: 56, SST: 63, SCI: 68, CA: 52, RE: 80 } },
  { name: "Siuella Bushiry", scores: { ENG: 53, MAT: 60, KISWA: 60, AGRI: 70, SST: 72, SCI: 56, CA: 60, RE: 73 } },
  { name: "Naimy Abdullahi", scores: { ENG: 63, MAT: 56, KISWA: 56, AGRI: 70, SST: 72, SCI: 52, CA: 48, RE: 73 } },
  { name: "Jally Kahya", scores: { ENG: 53, MAT: 50, KISWA: 76, AGRI: 76, SST: 57, SCI: 42, CA: 52, RE: 64 } },
  { name: "Andi Hussein", scores: { ENG: 53, MAT: 54, KISWA: 64, AGRI: 48, SST: 73, SCI: 48, CA: 44, RE: 64 } },
  { name: "Buubacide Issack", scores: { ENG: 53, MAT: 56, KISWA: 60, AGRI: 56, SST: 47, SCI: 4, CA: 60, RE: 60 } },
  { name: "Bilal Koba", scores: { ENG: 53, MAT: 50, KISWA: 52, AGRI: 72, SST: 60, SCI: 36, CA: 52, RE: 87 } },
  { name: "Mohamed Farah", scores: { ENG: 53, MAT: 54, KISWA: 32, AGRI: 12, SST: 43, SCI: 44, CA: 56, RE: 93 } },
  { name: "Suleiman Barke", scores: { ENG: 53, MAT: 46, KISWA: 42, AGRI: 62, SST: 47, SCI: 52, CA: 60, RE: 70 } },
  { name: "Seeme Abdi", scores: { ENG: 23, MAT: 50, KISWA: 42, AGRI: 12, SST: 47, SCI: 52, CA: 60, RE: 52 } },
  { name: "Hudheifa Shaban", scores: { ENG: 27, MAT: 46, KISWA: 26, AGRI: 68, SST: 63, SCI: 54, CA: 40, RE: 40 } },
  { name: "Abdi Bey Ali", scores: { ENG: 57, MAT: 10, KISWA: 46, AGRI: 80, SST: 37, SCI: 42, CA: 43, RE: 73 } },
  { name: "Amirha Guyo", scores: { ENG: 37, MAT: 24, KISWA: 46, AGRI: 28, SST: 50, SCI: 20, CA: 60, RE: 35 } }
];

// Convert data to worksheet format
const worksheetData = [
  ['#', 'STUDENT NAME', 'English', 'Mathematics', 'Kiswahili', 'Agriculture', 'Social Studies', 'Science', 'Creative Activities', 'Religious Education']
];

grade5ScoresData.forEach((record, index) => {
  worksheetData.push([
    index + 1,
    record.name,
    record.scores.ENG,
    record.scores.MAT,
    record.scores.KISWA,
    record.scores.AGRI,
    record.scores.SST,
    record.scores.SCI,
    record.scores.CA,
    record.scores.RE
  ]);
});

// Add legend sheet
const legendData = [
  ['Subject Code', 'Full Name'],
  ['ENG', 'English'],
  ['MAT', 'Mathematics'],
  ['KISWA', 'Kiswahili'],
  ['AGRI', 'Agriculture'],
  ['SST', 'Social Studies'],
  ['SCI', 'Science'],
  ['C/A', 'Creative Activities'],
  ['RE', 'Religious Education (Islamic + Christian)']
];

// Create workbook
const wb = XLSX.utils.book_new();

// Create main sheet
const ws = XLSX.utils.aoa_to_sheet(worksheetData);
ws['!cols'] = [
  { wch: 5 },   // # column
  { wch: 25 },  // Name column
  { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 12 }, { wch: 18 }, { wch: 18 }
];

// Add header styling
for (let i = 0; i < 10; i++) {
  const cell = ws[XLSX.utils.encode_cell({ r: 0, c: i })];
  if (cell) {
    cell.s = {
      fill: { fgColor: { rgb: 'FF2C3E50' } },
      font: { color: { rgb: 'FFFFFFFF' }, bold: true },
      alignment: { horizontal: 'center', vertical: 'center' }
    };
  }
}

XLSX.utils.book_append_sheet(wb, ws, 'Grade 5 Scores');

// Create legend sheet
const wsLegend = XLSX.utils.aoa_to_sheet(legendData);
wsLegend['!cols'] = [
  { wch: 15 },
  { wch: 40 }
];

// Add legend header styling
for (let i = 0; i < 2; i++) {
  const cell = wsLegend[XLSX.utils.encode_cell({ r: 0, c: i })];
  if (cell) {
    cell.s = {
      fill: { fgColor: { rgb: 'FF34495E' } },
      font: { color: { rgb: 'FFFFFFFF' }, bold: true },
      alignment: { horizontal: 'center', vertical: 'center' }
    };
  }
}

XLSX.utils.book_append_sheet(wb, wsLegend, 'Legend');

// Save file
const outputPath = path.join(__dirname, '..', 'Grade5_Scores.xlsx');
XLSX.writeFile(wb, outputPath);

console.log('✅ Excel file created successfully!');
console.log(`📁 File location: ${outputPath}`);
console.log(`📊 Sheets created:`);
console.log(`   1. Grade 5 Scores (32 students with 8 subjects)`);
console.log(`   2. Legend (Subject code reference)`);
