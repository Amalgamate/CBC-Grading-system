import { PrismaClient } from '@prisma/client';

const PROD_DATABASE_URL = "postgresql://neondb_owner:npg_8NWxneJvP9Gy@ep-mute-glitter-aiek3582-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: PROD_DATABASE_URL,
        },
    },
});

async function main() {
    console.log('🔍 Searching for Zawadi Academy schools in production...\n');

    // Search for schools with "Zawadi" in the name
    const schools = await prisma.school.findMany({
        where: {
            name: {
                contains: 'Zawadi',
                mode: 'insensitive'
            }
        },
        include: {
            users: {
                where: {
                    role: 'ADMIN'
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                    role: true,
                    status: true
                }
            }
        }
    });

    if (schools.length === 0) {
        console.log('❌ No schools found with "Zawadi" in the name');
        
        // Try searching for "Online Zawadi"
        console.log('\n🔍 Searching for "Online Zawadi"...\n');
        const onlineSchools = await prisma.school.findMany({
            where: {
                name: {
                    contains: 'Online',
                    mode: 'insensitive'
                }
            },
            include: {
                users: {
                    where: {
                        role: 'ADMIN'
                    },
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        role: true,
                        status: true
                    }
                }
            }
        });

        if (onlineSchools.length > 0) {
            console.log(`Found ${onlineSchools.length} school(s) with "Online":\n`);
            onlineSchools.forEach(school => {
                console.log(`📍 School: ${school.name}`);
                console.log(`   ID: ${school.id}`);
                if (school.users.length > 0) {
                    console.log('   Admins:');
                    school.users.forEach(user => {
                        console.log(`     • ${user.firstName} ${user.lastName}`);
                        console.log(`       Email: ${user.email}`);
                        console.log(`       Phone: ${user.phone || 'N/A'}`);
                        console.log(`       Status: ${user.status}`);
                    });
                } else {
                    console.log('   ⚠️  No ADMIN users found');
                }
                console.log('');
            });
        } else {
            console.log('❌ No online schools found');
        }
    } else {
        console.log(`Found ${schools.length} school(s):\n`);
        schools.forEach(school => {
            console.log(`📍 School: ${school.name}`);
            console.log(`   ID: ${school.id}`);
            console.log(`   County: ${school.county || 'N/A'}`);
            console.log(`   Phone: ${school.phone || 'N/A'}`);
            console.log(`   Email: ${school.email || 'N/A'}`);
            
            if (school.users.length > 0) {
                console.log('   Admins:');
                school.users.forEach(user => {
                    console.log(`     • ${user.firstName} ${user.lastName}`);
                    console.log(`       Email: ${user.email}`);
                    console.log(`       Phone: ${user.phone || 'N/A'}`);
                    console.log(`       Status: ${user.status}`);
                    console.log(`       ID: ${user.id}`);
                });
            } else {
                console.log('   ⚠️  No ADMIN users found');
            }
            console.log('');
        });
    }
}

main()
    .catch(e => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
