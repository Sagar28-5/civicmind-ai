require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Department = require('./models/Department');
const Complaint = require('./models/Complaint');
const AuditLog = require('./models/AuditLog');

const CITIES = [
  { address: 'MG Road, Bengaluru', lat: 12.9716, lng: 77.5946 },
  { address: 'Connaught Place, New Delhi', lat: 28.6328, lng: 77.2197 },
  { address: 'Marine Drive, Mumbai', lat: 18.9438, lng: 72.8233 },
  { address: 'Park Street, Kolkata', lat: 22.5535, lng: 88.3517 },
  { address: 'Anna Salai, Chennai', lat: 13.0569, lng: 80.2425 },
  { address: 'Banjara Hills, Hyderabad', lat: 17.4156, lng: 78.4347 },
  { address: 'Civil Lines, Jaipur', lat: 26.9124, lng: 75.7873 },
  { address: 'Gomti Nagar, Lucknow', lat: 26.8467, lng: 80.9462 },
  { address: 'Aundh, Pune', lat: 18.5596, lng: 73.8080 },
  { address: 'Salt Lake, Kolkata', lat: 22.5697, lng: 88.4184 },
  { address: 'Whitefield, Bengaluru', lat: 12.9698, lng: 77.7499 },
  { address: 'Dwarka, New Delhi', lat: 28.5921, lng: 77.0460 },
  { address: 'Andheri, Mumbai', lat: 19.1136, lng: 72.8697 },
  { address: 'Vadapalani, Chennai', lat: 13.0524, lng: 80.2120 },
  { address: 'Hitech City, Hyderabad', lat: 17.4500, lng: 78.3808 },
];

const DEPARTMENTS = [
  { name: 'PWD', code: 'PWD', description: 'Public Works Department', head: 'Rajesh Kumar', email: 'pwd@civicmind.in', color: '#F59E0B', icon: '🏗️' },
  { name: 'Water Board', code: 'WATER', description: 'Water Supply & Sewerage', head: 'Priya Sharma', email: 'water@civicmind.in', color: '#06B6D4', icon: '💧' },
  { name: 'Electricity Board', code: 'ELEC', description: 'Power Distribution', head: 'Amit Verma', email: 'elec@civicmind.in', color: '#EAB308', icon: '⚡' },
  { name: 'Municipal Corporation', code: 'MUNI', description: 'Solid Waste & Sanitation', head: 'Sunita Rao', email: 'muni@civicmind.in', color: '#22C55E', icon: '🗑️' },
  { name: 'Health Department', code: 'HEALTH', description: 'Public Health Services', head: 'Dr. Meera Nair', email: 'health@civicmind.in', color: '#EF4444', icon: '🏥' },
  { name: 'Traffic Police', code: 'TRAFFIC', description: 'Road Safety & Traffic', head: 'SP Arun Singh', email: 'traffic@civicmind.in', color: '#7C3AED', icon: '🚦' },
];

const COMPLAINT_TEMPLATES = [
  { title: 'Large pothole on main road causing accidents', description: 'A very large pothole has formed on the main road near the bus stop. Two bikes have already had accidents because of this.', category: 'road', priority: 'critical', priorityScore: 92 },
  { title: 'Street lights not working for 3 weeks', description: 'The street lights on our road have been non-functional for the past 3 weeks. It is very dangerous at night for residents.', category: 'electricity', priority: 'high', priorityScore: 78 },
  { title: 'No water supply since 2 days', description: 'Our entire colony has not received water supply for the past 2 days. Women and children are suffering badly.', category: 'water', priority: 'critical', priorityScore: 95 },
  { title: 'Garbage not collected for a week', description: 'The garbage collection vehicle has not visited our street for over a week. Garbage is piling up and causing smell.', category: 'garbage', priority: 'high', priorityScore: 75 },
  { title: 'Open manhole cover dangerous for pedestrians', description: 'There is an open manhole cover on the footpath near school. Children are at serious risk of falling in.', category: 'road', priority: 'critical', priorityScore: 88 },
  { title: 'Water pipe burst flooding the road', description: 'A main water pipe has burst near the market area. The entire road is flooded and traffic is severely disrupted.', category: 'water', priority: 'critical', priorityScore: 96 },
  { title: 'Illegal dumping of waste near park', description: 'Unknown persons are dumping industrial waste near the public park. It is creating health hazards for children playing there.', category: 'garbage', priority: 'high', priorityScore: 80 },
  { title: 'Traffic signal not working at busy junction', description: 'The traffic signal at the main junction has been malfunctioning since morning. Causing major traffic jams and near-miss accidents.', category: 'traffic', priority: 'high', priorityScore: 85 },
  { title: 'Broken footpath tiles causing injuries', description: 'Multiple footpath tiles near the market are broken and sticking out. An elderly person fell yesterday and was injured.', category: 'road', priority: 'medium', priorityScore: 65 },
  { title: 'Mosquito breeding in stagnant water', description: 'Stagnant water has accumulated in the empty plot next to our society for weeks. Mosquito breeding is causing health concerns.', category: 'health', priority: 'high', priorityScore: 72 },
  { title: 'Road divider damaged after accident', description: 'The road divider near the school zone was damaged in an accident 4 days ago. It is still not repaired and is a hazard.', category: 'road', priority: 'medium', priorityScore: 60 },
  { title: 'Low water pressure in pipes', description: 'Water pressure in our area is extremely low. We barely get any water even during supply hours. Problem persists for 2 months.', category: 'water', priority: 'medium', priorityScore: 55 },
  { title: 'Overflowing drainage blocking road', description: 'The main drainage canal near our area is overflowing due to heavy rain. The road is completely blocked.', category: 'water', priority: 'critical', priorityScore: 91 },
  { title: 'Electricity fluctuations damaging appliances', description: 'We are experiencing severe voltage fluctuations which have already damaged our refrigerator and TV. Others in area face the same issue.', category: 'electricity', priority: 'high', priorityScore: 76 },
  { title: 'Dead trees on road posing danger', description: 'Two large dead trees on the main road are leaning dangerously and could fall any time. Urgent action needed.', category: 'other', priority: 'high', priorityScore: 82 },
];

const STATUSES = ['pending', 'assigned', 'in_progress', 'resolved', 'resolved', 'resolved'];

const seed = async () => {
  try {
    await connectDB();
    console.log('🗑️  Clearing existing data...');
    await Promise.all([User.deleteMany(), Department.deleteMany(), Complaint.deleteMany(), AuditLog.deleteMany()]);

    console.log('🏛️  Creating departments...');
    const depts = await Department.insertMany(DEPARTMENTS);

    console.log('👤  Creating users...');
    const passwordHash = await bcrypt.hash('Demo@123', 12);

    const [citizen, officer, admin] = await User.insertMany([
      { name: 'Arjun Mehta', email: 'citizen@demo.com', passwordHash, role: 'citizen', phone: '9876543210', location: 'Bengaluru', rewardPoints: 340, badge: 'Community Hero' },
      { name: 'Priya Sharma', email: 'officer@demo.com', passwordHash, role: 'officer', department: depts[0]._id, phone: '9876543211', location: 'Bengaluru', badge: 'Top Officer' },
      { name: 'Admin Kaila', email: 'admin@demo.com', passwordHash, role: 'admin', phone: '9876543212', location: 'Bengaluru', badge: 'System Admin' },
    ]);

    // Create more officers
    const extraOfficers = await User.insertMany([
      { name: 'Rahul Verma', email: 'officer2@demo.com', passwordHash, role: 'officer', department: depts[1]._id, rewardPoints: 280 },
      { name: 'Sneha Patel', email: 'officer3@demo.com', passwordHash, role: 'officer', department: depts[2]._id, rewardPoints: 190 },
      { name: 'Kiran Kumar', email: 'officer4@demo.com', passwordHash, role: 'officer', department: depts[3]._id, rewardPoints: 145 },
    ]);

    // Create more citizens
    const extraCitizens = await User.insertMany([
      { name: 'Meera Singh', email: 'citizen2@demo.com', passwordHash, role: 'citizen', rewardPoints: 120 },
      { name: 'Rohan Gupta', email: 'citizen3@demo.com', passwordHash, role: 'citizen', rewardPoints: 85 },
    ]);

    const allOfficers = [officer, ...extraOfficers];
    const allCitizens = [citizen, ...extraCitizens];

    console.log('📋  Creating complaints...');
    const complaints = [];
    const deptMap = { road: depts[0], water: depts[1], electricity: depts[2], garbage: depts[3], health: depts[4], traffic: depts[5], other: depts[3] };

    for (let i = 0; i < 50; i++) {
      const template = COMPLAINT_TEMPLATES[i % COMPLAINT_TEMPLATES.length];
      const loc = CITIES[i % CITIES.length];
      const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
      const assignedOfficer = status !== 'pending' ? allOfficers[Math.floor(Math.random() * allOfficers.length)] : null;
      const citizenUser = allCitizens[Math.floor(Math.random() * allCitizens.length)];
      const dept = deptMap[template.category] || depts[0];

      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      complaints.push({
        ...template,
        aiSummary: `AI Analysis: ${template.title}. This has been categorized as ${template.category} with ${template.priority} priority. Estimated resolution in ${Math.ceil(Math.random() * 5)} days.`,
        aiKeywords: template.title.toLowerCase().split(' ').slice(0, 4),
        sentimentScore: ['frustrated', 'urgent', 'angry', 'neutral'][Math.floor(Math.random() * 4)],
        location: { ...loc, lat: loc.lat + (Math.random() - 0.5) * 0.05, lng: loc.lng + (Math.random() - 0.5) * 0.05 },
        department: dept._id,
        citizen: citizenUser._id,
        assignedOfficer: assignedOfficer?._id,
        status,
        estimatedResolutionDays: Math.ceil(Math.random() * 7),
        resolvedAt: status === 'resolved' ? new Date() : undefined,
        timeline: [
          { status: 'pending', note: 'Complaint submitted by citizen', by: citizenUser._id, timestamp: createdAt },
          ...(status !== 'pending' ? [{ status: 'assigned', note: 'Officer assigned by admin', by: admin._id, timestamp: new Date(createdAt.getTime() + 3600000) }] : []),
          ...(status === 'resolved' ? [{ status: 'resolved', note: 'Issue resolved by field officer', by: assignedOfficer?._id || admin._id, timestamp: new Date() }] : []),
        ],
        createdAt,
      });
    }

    await Complaint.insertMany(complaints);

    console.log('📝  Creating audit logs...');
    await AuditLog.insertMany([
      { userEmail: 'citizen@demo.com', action: 'LOGIN', resource: 'User', timestamp: new Date() },
      { userEmail: 'admin@demo.com', action: 'LOGIN', resource: 'User', timestamp: new Date() },
      { userEmail: 'officer@demo.com', action: 'UPDATE_STATUS', resource: 'Complaint', metadata: { status: 'resolved' }, timestamp: new Date() },
      { userEmail: 'admin@demo.com', action: 'ASSIGN_OFFICER', resource: 'Complaint', timestamp: new Date() },
    ]);

    console.log(`
✅ Seed complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Citizen:  citizen@demo.com
📧 Officer:  officer@demo.com
📧 Admin:    admin@demo.com
🔑 Password: Demo@123 (all accounts)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 50 complaints created
🏛️  6 departments
👤  7 users
`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();
