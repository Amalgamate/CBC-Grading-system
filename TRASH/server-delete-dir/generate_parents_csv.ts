
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { Parser } from 'json2csv';

const inputPath = path.join(__dirname, '../../templates/Students Database.csv');
const outputPath = path.join(__dirname, '../../templates/parents_upload_corrected.csv');

interface StudentRow {
  ID: string;
  'Leaner Name': string;
  'Adm No': string;
  'Class': string;
  'Term': string;
  'Year': string;
  'Parent/Guardian': string;
  'Phone 1': string;
  'Phone 2': string;
  'Reg Date': string;
  'Bal Due': string;
}

interface ParentOutput {
  'First Name': string;
  'Last Name': string;
  'Email': string;
  'Phone': string;
  'Phone 2': string;
  'WhatsApp Number': string;
  'Student Admission Numbers': string;
  'Status': string;
}

const parentsMap = new Map<string, ParentOutput & { admissionNumbers: string[] }>();

console.log(`Reading from: ${inputPath}`);

fs.createReadStream(inputPath)
  .pipe(csv())
  .on('data', (row: StudentRow) => {
    const phone = row['Phone 1'] ? row['Phone 1'].trim() : '';
    const admNo = row['Adm No'] ? row['Adm No'].trim() : '';
    const parentName = row['Parent/Guardian'] ? row['Parent/Guardian'].trim() : '';

    if (!phone) {
      // console.warn(`Skipping row with no phone number: ${row['Leaner Name']}`);
      return;
    }

    if (!parentsMap.has(phone)) {
      // Split name
      const nameParts = parentName.split(' ');
      const firstName = nameParts[0] || 'Unknown';
      const lastName = nameParts.slice(1).join(' ') || 'Parent';

      // Generate dummy email
      // Clean phone for email usage
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const email = `parent${cleanPhone}@zawadi.com`;

      parentsMap.set(phone, {
        'First Name': firstName,
        'Last Name': lastName,
        'Email': email,
        'Phone': phone,
        'Phone 2': row['Phone 2'] || '',
        'WhatsApp Number': '',
        'Student Admission Numbers': '', // Will populate later
        'Status': 'ACTIVE',
        admissionNumbers: []
      });
    }

    const parentEntry = parentsMap.get(phone)!;
    if (admNo && !parentEntry.admissionNumbers.includes(admNo)) {
      parentEntry.admissionNumbers.push(admNo);
    }
  })
  .on('end', () => {
    console.log(`Processed ${parentsMap.size} unique parents.`);

    const outputData: ParentOutput[] = Array.from(parentsMap.values()).map(p => ({
      'First Name': p['First Name'],
      'Last Name': p['Last Name'],
      'Email': p['Email'],
      'Phone': p['Phone'],
      'Phone 2': p['Phone 2'],
      'WhatsApp Number': p['WhatsApp Number'],
      'Student Admission Numbers': p.admissionNumbers.join(','),
      'Status': p['Status']
    }));

    try {
      const parser = new Parser({
        fields: [
          'First Name', 'Last Name', 'Email', 'Phone', 'Phone 2', 
          'WhatsApp Number', 'Student Admission Numbers', 'Status'
        ]
      });
      const csvOutput = parser.parse(outputData);

      fs.writeFileSync(outputPath, csvOutput);
      console.log(`Successfully wrote to: ${outputPath}`);
    } catch (err) {
      console.error('Error writing CSV:', err);
    }
  });
