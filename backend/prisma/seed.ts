import { PrismaClient, AccountKind, UserRole, OfferStatus, Frequency, VerificationStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const CATEGORIES = [
  { slug: 'ripetizioni',       name: 'Ripetizioni',          icon: '📚', sortOrder: 1 },
  { slug: 'aiuto-anziani',     name: 'Aiuto anziani',        icon: '🌿', sortOrder: 2 },
  { slug: 'spesa-commissioni', name: 'Spesa e commissioni',  icon: '🛒', sortOrder: 3 },
  { slug: 'trasporti',         name: 'Trasporti',            icon: '🚗', sortOrder: 4 },
  { slug: 'supporto-tech',     name: 'Supporto tech',        icon: '💻', sortOrder: 5 },
  { slug: 'babysitting',       name: 'Babysitting',          icon: '🧸', sortOrder: 6 },
  { slug: 'scambio-linguistico', name: 'Scambio linguistico', icon: '🗣️', sortOrder: 7 },
  { slug: 'supporto-emotivo',  name: 'Supporto emotivo',     icon: '💚', sortOrder: 8 },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Categories
  for (const c of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }
  console.log(`  ✓ ${CATEGORIES.length} categories`);

  // Demo users
  const passwordHash = await bcrypt.hash('demo1234', 10);

  const marco = await prisma.user.upsert({
    where: { email: 'marco@vicini.it' },
    update: {},
    create: {
      email: 'marco@vicini.it',
      passwordHash,
      emailVerifiedAt: new Date(),
      accountKind: AccountKind.OFFERER,
      acceptedCodeOfCareAt: new Date(),
      profile: {
        create: {
          firstName: 'Marco',
          lastName: 'Rossi',
          bio: 'Professore di matematica in pensione. Mi piace aiutare i ragazzi a superare la paura dei numeri.',
          city: 'Roma',
          zipCode: '00153',
          latitude: 41.8902,
          longitude: 12.4922,
          verificationStatus: VerificationStatus.VERIFIED,
          ratingAverage: 4.9,
          ratingCount: 12,
          helpsCompleted: 47,
        },
      },
    },
  });

  const sofia = await prisma.user.upsert({
    where: { email: 'sofia@vicini.it' },
    update: {},
    create: {
      email: 'sofia@vicini.it',
      passwordHash,
      emailVerifiedAt: new Date(),
      accountKind: AccountKind.REQUESTER,
      acceptedCodeOfCareAt: new Date(),
      profile: {
        create: {
          firstName: 'Sofia',
          lastName: 'Marini',
          bio: 'Mamma con un bambino piccolo, a volte mi serve una mano.',
          city: 'Roma',
          zipCode: '00153',
          latitude: 41.8919,
          longitude: 12.4869,
          verificationStatus: VerificationStatus.VERIFIED,
          ratingAverage: 5.0,
          ratingCount: 4,
        },
      },
    },
  });

  const giulia = await prisma.user.upsert({
    where: { email: 'giulia@vicini.it' },
    update: {},
    create: {
      email: 'giulia@vicini.it',
      passwordHash,
      emailVerifiedAt: new Date(),
      role: UserRole.MODERATOR,
      accountKind: AccountKind.BOTH,
      acceptedCodeOfCareAt: new Date(),
      profile: {
        create: {
          firstName: 'Giulia',
          lastName: 'Verdi',
          bio: 'Moderatrice Vicini · adoro la community.',
          city: 'Roma',
          zipCode: '00152',
          latitude: 41.8810,
          longitude: 12.4673,
          verificationStatus: VerificationStatus.VERIFIED,
          ratingAverage: 4.8,
          ratingCount: 8,
          helpsCompleted: 21,
        },
      },
    },
  });

  console.log(`  ✓ 3 demo users (password for all: demo1234)`);

  // Sample offers
  const cats = await prisma.category.findMany();
  const byslug = (s: string) => cats.find(c => c.slug === s)!;

  const offers = [
    {
      offererId: marco.id,
      categoryId: byslug('ripetizioni').id,
      title: 'Ripetizioni di matematica per liceo scientifico',
      description: 'Posso coprire qualsiasi argomento: algebra, geometria, analisi, trigonometria. 35 anni di esperienza.',
      frequency: Frequency.WEEKLY,
      availableDays: ['TUE', 'THU', 'SAT'],
      timeFrom: '16:00', timeTo: '19:00',
      zone: 'Trastevere', city: 'Roma', zipCode: '00153',
      latitude: 41.8902, longitude: 12.4922,
      status: OfferStatus.APPROVED,
      approvedAt: new Date(),
    },
    {
      offererId: giulia.id,
      categoryId: byslug('aiuto-anziani').id,
      title: 'Compagnia per pomeriggi',
      description: 'Posso fare visita una volta a settimana per una chiacchierata o una passeggiata.',
      frequency: Frequency.WEEKLY,
      availableDays: ['MON', 'WED', 'FRI'],
      timeFrom: '15:00', timeTo: '18:00',
      zone: 'Monteverde', city: 'Roma', zipCode: '00152',
      latitude: 41.8810, longitude: 12.4673,
      status: OfferStatus.APPROVED,
      approvedAt: new Date(),
    },
    {
      offererId: marco.id,
      categoryId: byslug('scambio-linguistico').id,
      title: 'Conversazione in italiano',
      description: 'Aiuto con la conversazione per chi sta imparando l\'italiano.',
      frequency: Frequency.FLEXIBLE,
      availableDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
      zone: 'Trastevere', city: 'Roma', zipCode: '00153',
      latitude: 41.8902, longitude: 12.4922,
      status: OfferStatus.PENDING_REVIEW,
    },
  ];

  for (const o of offers) {
    await prisma.offer.create({ data: o });
  }
  console.log(`  ✓ ${offers.length} sample offers`);

  // Sample requests (one pending so the moderation queue isn't empty)
  const { RequestStatus, Urgency } = await import('@prisma/client');
  await prisma.request.create({
    data: {
      requesterId: sofia.id,
      categoryId: byslug('spesa-commissioni').id,
      title: 'Aiuto con la spesa settimanale',
      description: 'Sto recuperando da un intervento e per qualche settimana non posso portare pesi. Mi servirebbe una mano con la spesa il sabato mattina.',
      urgency: Urgency.HIGH,
      frequency: Frequency.WEEKLY,
      preferredDays: ['SAT'],
      timeFrom: '09:00', timeTo: '12:00',
      zone: 'Trastevere', city: 'Roma', zipCode: '00153',
      status: RequestStatus.PENDING_REVIEW,
    },
  });
  await prisma.request.create({
    data: {
      requesterId: sofia.id,
      categoryId: byslug('supporto-tech').id,
      title: 'Configurare il tablet di mia madre',
      description: 'Vorrei che mia madre imparasse a fare videochiamate con i nipoti. Serve qualcuno paziente!',
      urgency: Urgency.NORMAL,
      frequency: Frequency.ONE_TIME,
      preferredDays: ['MON', 'WED'],
      zone: 'Monteverde', city: 'Roma', zipCode: '00152',
      status: RequestStatus.WAITING_MATCH,
      approvedAt: new Date(),
    },
  });
  console.log('  ✓ 2 sample requests (1 pending review)');

  // Sample flag so the segnalazioni page has content
  await prisma.flag.create({
    data: {
      reporterId: sofia.id,
      reportedUserId: marco.id,
      reason: 'Esempio di segnalazione — profilo incompleto (dato di test)',
      severity: 'LOW',
    },
  });
  console.log('  ✓ 1 sample flag');

  console.log('\n✅ Done. Try logging in as marco@vicini.it / demo1234');
  console.log('   Admin panel: log in as giulia@vicini.it / demo1234 → click "Admin" in the header');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
