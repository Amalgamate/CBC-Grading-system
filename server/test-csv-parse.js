const fs = require('fs');
const csvParser = require('csv-parser');
const { Readable } = require('stream');

const filePath = '../templates/Students Database.csv';

const buffer = fs.readFileSync(filePath);
const stream = Readable.from(buffer.toString());

let lineNumber = 0;
const results = [];
const errors = [];

stream
  .pipe(csvParser())
  .on('data', (data) => {
    lineNumber++;
    results.push({
      line: lineNumber,
      admNo: data['Adm No'],
      name: data['Leaner Name'] || data['Learner Name'] || data['Name'],
      class: data['Class']
    });
  })
  .on('end', () => {
    console.log(`Total rows parsed: ${lineNumber}`);
    console.log(`First 10 rows:`);
    results.slice(0, 10).forEach(r => {
      console.log(`  Line ${r.line}: ${r.admNo} | ${r.name} | ${r.class}`);
    });
    console.log(`...\nLast 5 rows:`);
    results.slice(-5).forEach(r => {
      console.log(`  Line ${r.line}: ${r.admNo} | ${r.name} | ${r.class}`);
    });
  })
  .on('error', (err) => {
    console.error('CSV parse error:', err.message);
  });
