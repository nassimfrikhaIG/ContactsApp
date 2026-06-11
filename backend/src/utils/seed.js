require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Contact = require('../models/Contact');

const seed = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not set in .env');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  await User.deleteMany({});
  await Contact.deleteMany({});

  // Admin account
  const admin = await User.create({
    name: 'Administrateur', email: 'admin@contacts.com', password: 'admin1234', role: 'admin'
  });

  // Demo user
  const demo = await User.create({
    name: 'Demo User', email: 'demo@contacts.com', password: 'demo1234', role: 'user'
  });

  // Second user
  const user2 = await User.create({
    name: 'Marie Dupont', email: 'marie@contacts.com', password: 'marie1234', role: 'user'
  });

  const contacts1 = [
    { firstName: 'Alice', lastName: 'Martin', email: 'alice@example.com', phone: '+33 1 23 45 67 89', company: 'TechCorp', jobTitle: 'CTO', tags: ['vip', 'tech'], groups: ['Work'], isFavorite: true },
    { firstName: 'Bob', lastName: 'Dupont', email: 'bob@example.com', mobile: '+33 6 12 34 56 78', company: 'StartupXYZ', jobTitle: 'CEO', tags: ['partner'], groups: ['Work', 'Partners'] },
    { firstName: 'Claire', lastName: 'Leblanc', email: 'claire@example.com', company: 'Design Studio', jobTitle: 'Lead Designer', tags: ['design'], groups: ['Freelancers'] },
    { firstName: 'David', lastName: 'Bernard', email: 'david@example.com', company: 'Finance Co', jobTitle: 'CFO', tags: ['finance', 'vip'], groups: ['Work'] },
    { firstName: 'Emma', lastName: 'Petit', email: 'emma@example.com', mobile: '+33 7 23 45 67 89', tags: ['friend'], groups: ['Friends'], isFavorite: true },
    { firstName: 'François', lastName: 'Moreau', email: 'francois@example.com', company: 'Consulting Group', jobTitle: 'Consultant', tags: ['consultant'], groups: ['Work'] },
    { firstName: 'Gabrielle', lastName: 'Simon', email: 'gabrielle@example.com', company: 'Marketing Agency', jobTitle: 'Marketing Manager', tags: ['marketing'], groups: ['Work'] },
    { firstName: 'Hugo', lastName: 'Laurent', email: 'hugo@example.com', mobile: '+33 6 55 44 33 22', tags: ['friend', 'tech'], groups: ['Friends'] }
  ];

  const contacts2 = [
    { firstName: 'Jean', lastName: 'Rousseau', email: 'jean@example.com', company: 'Agence Web', jobTitle: 'Développeur', tags: ['tech'], groups: ['Work'] },
    { firstName: 'Sophie', lastName: 'Blanc', email: 'sophie@example.com', phone: '+33 1 44 55 66 77', company: 'RH Solutions', jobTitle: 'DRH', tags: ['rh'], groups: ['Work'], isFavorite: true },
    { firstName: 'Lucas', lastName: 'Noir', email: 'lucas@example.com', tags: ['ami'], groups: ['Friends'] }
  ];

  for (const c of contacts1) await Contact.create({ ...c, owner: demo._id, source: 'manual' });
  for (const c of contacts2) await Contact.create({ ...c, owner: user2._id, source: 'manual' });

  console.log('\n✅ Seed terminé !');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 Admin    : admin@contacts.com  / admin1234');
  console.log('👤 Demo     : demo@contacts.com   / demo1234');
  console.log('👤 Marie    : marie@contacts.com  / marie1234');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
