import prisma from '../config/database'

const arg = (name: string) => {
  const v = process.argv.find(a => a.startsWith(name + '='))
  return v ? v.split('=')[1] : undefined
}

async function purgeTemplateData(templateSchoolId: string) {
  await prisma.summativeResult.deleteMany({ where: { test: { schoolId: templateSchoolId } } })
  await prisma.summativeTest.deleteMany({ where: { schoolId: templateSchoolId } })
  await prisma.formativeAssessment.deleteMany({ where: { schoolId: templateSchoolId } })
  await prisma.class.deleteMany({ where: { branch: { schoolId: templateSchoolId } } })
  await prisma.learner.deleteMany({ where: { schoolId: templateSchoolId } })
  await prisma.branch.deleteMany({ where: { schoolId: templateSchoolId } })
}

async function cloneConfigs(sourceSchoolId: string, targetSchoolId: string, createdByUserId?: string) {
  const termConfigs = await prisma.termConfig.findMany({ where: { schoolId: sourceSchoolId } })
  for (const c of termConfigs) {
    await prisma.termConfig.create({ data: {
      schoolId: targetSchoolId,
      academicYear: c.academicYear,
      term: c.term,
      startDate: c.startDate,
      endDate: c.endDate,
      formativeWeight: c.formativeWeight,
      summativeWeight: c.summativeWeight,
      isActive: false,
      isClosed: false,
      createdBy: createdByUserId || c.createdBy,
    } })
  }
  const aggConfigs = await prisma.aggregationConfig.findMany({ where: { schoolId: sourceSchoolId } })
  for (const a of aggConfigs) {
    await prisma.aggregationConfig.create({ data: {
      schoolId: targetSchoolId,
      grade: a.grade,
      learningArea: a.learningArea,
      type: a.type,
      strategy: a.strategy,
      nValue: a.nValue,
      weight: a.weight,
      createdBy: createdByUserId || a.createdBy,
    } })
  }
  const streams = await prisma.streamConfig.findMany({ where: { schoolId: sourceSchoolId } })
  for (const s of streams) {
    await prisma.streamConfig.create({ data: {
      schoolId: targetSchoolId,
      name: s.name,
      active: s.active,
    } })
  }
  const systems = await prisma.gradingSystem.findMany({ where: { schoolId: sourceSchoolId }, include: { ranges: true } })
  for (const sys of systems) {
    const newSys = await prisma.gradingSystem.create({ data: {
      schoolId: targetSchoolId,
      name: sys.name,
      type: sys.type,
      active: sys.active,
      isDefault: sys.isDefault,
    } })
    for (const r of sys.ranges) {
      await prisma.gradingRange.create({ data: {
        systemId: newSys.id,
        label: r.label,
        minPercentage: r.minPercentage,
        maxPercentage: r.maxPercentage,
        summativeGrade: r.summativeGrade,
        rubricRating: r.rubricRating,
        points: r.points,
        color: r.color,
        description: r.description,
      } })
    }
  }
}

async function createSchoolFromTemplate(templateSchoolId: string, name: string, createdByUserId?: string) {
  const template = await prisma.school.findUnique({ where: { id: templateSchoolId } })
  if (!template) throw new Error('Template school not found')
  const school = await prisma.school.create({ data: {
    name,
    admissionFormatType: template.admissionFormatType,
    branchSeparator: template.branchSeparator,
    curriculumType: template.curriculumType,
    assessmentMode: template.assessmentMode,
    active: true,
    status: 'TRIAL',
    trialStart: new Date(),
    trialDays: 30,
  } })
  await cloneConfigs(templateSchoolId, school.id, createdByUserId)
  return school
}

async function main() {
  const templateSchoolId = process.argv[2]
  const newSchoolName = process.argv[3]
  const createdByUserId = arg('--createdBy')
  const purge = process.argv.includes('--purge-template')
  if (!templateSchoolId || !newSchoolName) throw new Error('Usage: ts-node provision-school.ts <templateSchoolId> <newSchoolName> [--createdBy=<userId>] [--purge-template]')
  if (purge) await purgeTemplateData(templateSchoolId)
  const school = await createSchoolFromTemplate(templateSchoolId, newSchoolName, createdByUserId)
  process.stdout.write(JSON.stringify({ success: true, school }, null, 2))
}

main().catch(async (e) => { console.error(e); process.exitCode = 1 }).finally(async () => { await prisma.$disconnect() })

