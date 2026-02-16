// Grade 5 Scores Data from handwritten records
const grade5Scores = [
  { name: "Seraphine Kawera", scores: [77, 96, 86, 77, 32, 70, 60], subjects: ['ENG', 'MAT', 'KIS', 'MPAS', 'SS', 'SCI', 'CRA'] },
  { name: "Reviey Abdi", scores: [70, 82, 82, 82, 80, 82, 71], subjects: ['ENG', 'MAT', 'KIS', 'MPAS', 'SS', 'SCI', 'CRA'] },
  { name: "Habiba Said", scores: [80, 84, 82, 84, 80, 88, 84], subjects: ['ENG', 'MAT', 'KIS', 'MPAS', 'SS', 'SCI', 'CRA'] },
  { name: "Ridhwan Adeni", scores: [72, 78, 26, 76, 77, 76, 84], subjects: ['ENG', 'MAT', 'KIS', 'MPAS', 'SS', 'SCI', 'CRA'] },
  { name: "Ruweidha Dalry", scores: [77, 70, 82, 28, 73, 68, 80], subjects: ['ENG', 'MAT', 'KIS', 'MPAS', 'SS', 'SCI', 'CRA'] },
  { name: "Abdi Zueick Ibrahim", scores: [90, 92, 70, 84, 33, 64, 60], subjects: ['ENG', 'MAT', 'KIS', 'MPAS', 'SS', 'SCI', 'CRA'] },
  { name: "Shulehe Ibrahim", scores: [60, 62, 82, 72, 80, 80, 72], subjects: ['ENG', 'MAT', 'KIS', 'MPAS', 'SS', 'SCI', 'CRA'] },
  { name: "Muud ABDI", scores: [60, 60, 74, 38, 73, 52, 76], subjects: ['ENG', 'MAT', 'KIS', 'MPAS', 'SS', 'SCI', 'CRA'] },
  { name: "Mutolih Dahiry", scores: [70, 68, 68, 34, 70, 60, 30], subjects: ['ENG', 'MAT', 'KIS', 'MPAS', 'SS', 'SCI', 'CRA'] },
  { name: "Fayhiya Mohamed", scores: [67, 84, 63, 60, 70, 63, 76], subjects: ['ENG', 'MAT', 'KIS', 'MPAS', 'SS', 'SCI', 'CRA'] },
  { name: "Haneen Mohamed", scores: [67, 72, 70, 70, 70, 53, 76], subjects: ['ENG', 'MAT', 'KIS', 'MPAS', 'SS', 'SCI', 'CRA'] },
  { name: "Somiya Shukri", scores: [57, 26, 54, 60, 67, 72, 60], subjects: ['ENG', 'MAT', 'KIS', 'MPAS', 'SS', 'SCI', 'CRA'] },
  { name: "Ruweidhe Mohamed", scores: [67, 66, 72, 77, 60, 76, 68], subjects: ['ENG', 'MAT', 'KIS', 'MPAS', 'SS', 'SCI', 'CRA'] },
  { name: "Abdula Abdi", scores: [70, 58, 60, 34, 62, 66, 76], subjects: ['ENG', 'MAT', 'KIS', 'MPAS', 'SS', 'SCI', 'CRA'] },
  { name: "Ilrah Hussein", scores: [73, 12, 64, 56, 67, 64, 30], subjects: ['ENG', 'MAT', 'KIS', 'MPAS', 'SS', 'SCI', 'CRA'] },
  { name: "Shureyim Mustafa", scores: [63, 44, 44, 72, 65, 60, 60], subjects: ['ENG', 'MAT', 'KIS', 'MPAS', 'SS', 'SCI', 'CRA'] },
  { name: "Uthmari Hassan", scores: [63, 56, 62, 80, 87, 54, 52], subjects: ['ENG', 'MAT', 'KIS', 'MPAS', 'SS', 'SCI', 'CRA'] },
  { name: "Yasmin Ribog", scores: [73, 68, 52, 87, 84, 54, 32], subjects: ['ENG', 'MAT', 'KIS', 'MPAS', 'SS', 'SCI', 'CRA'] },
  { name: "Rayann Adams", scores: [63, 74, 70, 62, 57, 64, 64], subjects: ['ENG', 'MAT', 'KIS', 'MPAS', 'SS', 'SCI', 'CRA'] },
  { name: "Tudis Nassir", scores: [37, 72, 56, 56, 63, 68, 52], subjects: ['ENG', 'MAT', 'KIS', 'MPAS', 'SS', 'SCI', 'CRA'] },
  { name: "Siuella Bushiry", scores: [53, 60, 60, 70, 72, 56, 60], subjects: ['ENG', 'MAT', 'KIS', 'MPAS', 'SS', 'SCI', 'CRA'] },
  { name: "Naimy Abdullahi", scores: [63, 56, 56, 70, 72, 52, 48], subjects: ['ENG', 'MAT', 'KIS', 'MPAS', 'SS', 'SCI', 'CRA'] },
  { name: "Jally Kahya", scores: [53, 50, 76, 76, 57, 42, 52], subjects: ['ENG', 'MAT', 'KIS', 'MPAS', 'SS', 'SCI', 'CRA'] },
  { name: "Andi Hussein", scores: [53, 54, 64, 48, 73, 48, 44], subjects: ['ENG', 'MAT', 'KIS', 'MPAS', 'SS', 'SCI', 'CRA'] },
  { name: "Buubacide Issack", scores: [53, 56, 60, 56, 47, 4, 60], subjects: ['ENG', 'MAT', 'KIS', 'MPAS', 'SS', 'SCI', 'CRA'] },
  { name: "Bilal Koba", scores: [53, 50, 52, 72, 60, 36, 52], subjects: ['ENG', 'MAT', 'KIS', 'MPAS', 'SS', 'SCI', 'CRA'] },
  { name: "Mohamed Farah", scores: [53, 54, 32, 12, 43, 44, 56], subjects: ['ENG', 'MAT', 'KIS', 'MPAS', 'SS', 'SCI', 'CRA'] },
  { name: "Suleiman Barke", scores: [53, 46, 42, 62, 47, 52, 60], subjects: ['ENG', 'MAT', 'KIS', 'MPAS', 'SS', 'SCI', 'CRA'] },
  { name: "Seeme Abdi", scores: [23, 50, 42, 12, 47, 52, 60], subjects: ['ENG', 'MAT', 'KIS', 'MPAS', 'SS', 'SCI', 'CRA'] },
  { name: "Hudheifa Shaban", scores: [27, 46, 26, 68, 63, 54, 40], subjects: ['ENG', 'MAT', 'KIS', 'MPAS', 'SS', 'SCI', 'CRA'] },
  { name: "Abdi Bey Ali", scores: [57, 10, 46, 80, 37, 42, 43], subjects: ['ENG', 'MAT', 'KIS', 'MPAS', 'SS', 'SCI', 'CRA'] },
  { name: "Amirha Guyo", scores: [37, 24, 46, 28, 50, 20, 60], subjects: ['ENG', 'MAT', 'KIS', 'MPAS', 'SS', 'SCI', 'CRA'] }
];

console.log(JSON.stringify(grade5Scores, null, 2));
console.log(`\nTotal students: ${grade5Scores.length}`);
