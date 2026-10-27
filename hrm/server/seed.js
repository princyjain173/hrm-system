require('dotenv').config();
const mongoose = require('mongoose'), bcrypt = require('bcryptjs');
const { User, Employee, Attendance, Leave, Announcement, Training, Notification } = require('./models');

async function seedData(clearExisting = true) {
  try {
    if (clearExisting) {
      console.log('Resetting existing database collections...');
      await Promise.all([
        User.deleteMany(),
        Employee.deleteMany(),
        Attendance.deleteMany(),
        Leave.deleteMany(),
        Announcement.deleteMany(),
        Training.deleteMany(),
        Notification.deleteMany()
      ]);
    }

    const password = await bcrypt.hash('Pass@123', 10);

    // Create Core Users
    const users = await User.create([
      { name: 'Anita Verma', email: 'hr@hrm.com', password, role: 'hr' },
      { name: 'Rohan Mehta', email: 'mgr@hrm.com', password, role: 'manager' },
      { name: 'Priya Sharma', email: 'emp@hrm.com', password, role: 'employee' },
      { name: 'Alex Chen', email: 'alex@hrm.com', password, role: 'employee' },
      { name: 'Sarah Jenkins', email: 'sarah@hrm.com', password, role: 'manager' },
      { name: 'David Kim', email: 'david@hrm.com', password, role: 'employee' },
      { name: 'Neha Patel', email: 'neha@hrm.com', password, role: 'employee' },
      { name: 'Marcus Vance', email: 'marcus@hrm.com', password, role: 'employee' }
    ]);

    const [hr, mgr, emp, alex, sarah, david, neha, marcus] = users;

    // Create Employee Profiles
    await Employee.create([
      { user: hr._id, department: 'People Operations', designation: 'HR Lead & Director', phone: '+1 (555) 234-5678', leaveBalance: 24 },
      { user: mgr._id, department: 'Engineering', designation: 'Engineering Manager', manager: hr._id, phone: '+1 (555) 345-6789', leaveBalance: 20 },
      { user: emp._id, department: 'Engineering', designation: 'Senior Frontend Developer', manager: mgr._id, phone: '+1 (555) 456-7890', leaveBalance: 16 },
      { user: alex._id, department: 'Engineering', designation: 'Backend Node.js Engineer', manager: mgr._id, phone: '+1 (555) 567-8901', leaveBalance: 14 },
      { user: sarah._id, department: 'Product Management', designation: 'Principal Product Lead', manager: hr._id, phone: '+1 (555) 678-9012', leaveBalance: 19 },
      { user: david._id, department: 'Product Design', designation: 'Senior UI/UX Designer', manager: sarah._id, phone: '+1 (555) 789-0123', leaveBalance: 15 },
      { user: neha._id, department: 'Quality Assurance', designation: 'Lead QA Automation Engineer', manager: mgr._id, phone: '+1 (555) 890-1234', leaveBalance: 17 },
      { user: marcus._id, department: 'DevOps & Cloud', designation: 'Site Reliability Engineer', manager: mgr._id, phone: '+1 (555) 901-2345', leaveBalance: 18 }
    ]);

    // Create Announcements
    await Announcement.create([
      {
        title: 'StaffSync Modern HRM Platform Goes Live!',
        body: 'Welcome to our next-generation Human Resource Management solution. Streamline attendance tracking, instant leave management, and company-wide skill development from a single unified portal.',
        author: hr._id
      },
      {
        title: 'Q4 Performance Appraisals & Development Pathways',
        body: 'Managers are invited to schedule one-on-one reviews with team members. Please check the Training section for leadership and tech skills tracks open for enrollment.',
        author: hr._id
      },
      {
        title: 'Company Hackathon 2026 Announced',
        body: 'Get ready for our annual innovation hackathon on the 15th of next month! Great prizes, cross-functional collaboration, and exciting new product ideas.',
        author: mgr._id
      }
    ]);

    // Create Trainings
    const t1 = await Training.create({
      title: 'Full-Stack Architecture & Microservices',
      description: 'In-depth best practices for scalable backend APIs, containerization, and modern frontend performance optimization.',
      startDate: new Date(Date.now() + 5 * 864e5),
      hours: 8,
      createdBy: mgr._id,
      enrolled: [emp._id, alex._id, marcus._id]
    });

    const t2 = await Training.create({
      title: 'Agile Leadership & Cross-Functional Mentorship',
      description: 'Tactical approaches to team building, constructive 1-on-1s, and fostering high-trust engineering culture.',
      startDate: new Date(Date.now() + 10 * 864e5),
      hours: 4,
      createdBy: hr._id,
      enrolled: [mgr._id, sarah._id]
    });

    const t3 = await Training.create({
      title: 'Enterprise Security & OWASP Top 10',
      description: 'Zero-trust architecture, secure token validation, and proactive defensive security engineering.',
      startDate: new Date(Date.now() + 14 * 864e5),
      hours: 6,
      createdBy: mgr._id,
      enrolled: [emp._id, alex._id, neha._id]
    });

    // Attendance Records
    const todayStr = new Date().toLocaleDateString('en-CA');
    const yesterday = new Date(Date.now() - 864e5);
    const yesterdayStr = yesterday.toLocaleDateString('en-CA');
    const twoDaysAgo = new Date(Date.now() - 2 * 864e5);
    const twoDaysAgoStr = twoDaysAgo.toLocaleDateString('en-CA');

    const inTime1 = new Date();
    inTime1.setHours(9, 12, 0, 0);

    const inTime2 = new Date();
    inTime2.setHours(8, 45, 0, 0);
    const outTime2 = new Date();
    outTime2.setHours(17, 30, 0, 0);

    await Attendance.create([
      { user: emp._id, date: todayStr, checkIn: inTime1 },
      { user: mgr._id, date: todayStr, checkIn: inTime2, checkOut: outTime2 },
      { user: alex._id, date: todayStr, checkIn: inTime2 },
      { user: hr._id, date: todayStr, checkIn: inTime1 },
      { user: emp._id, date: yesterdayStr, checkIn: new Date(yesterday.setHours(9, 5, 0)), checkOut: new Date(yesterday.setHours(17, 45, 0)) },
      { user: mgr._id, date: yesterdayStr, checkIn: new Date(yesterday.setHours(8, 50, 0)), checkOut: new Date(yesterday.setHours(18, 0, 0)) },
      { user: emp._id, date: twoDaysAgoStr, checkIn: new Date(twoDaysAgo.setHours(9, 0, 0)), checkOut: new Date(twoDaysAgo.setHours(17, 30, 0)) }
    ]);

    // Leave Requests
    const nextWeekStart = new Date(Date.now() + 3 * 864e5);
    const nextWeekEnd = new Date(Date.now() + 5 * 864e5);

    await Leave.create([
      {
        user: alex._id,
        type: 'Sick',
        from: nextWeekStart,
        to: new Date(Date.now() + 4 * 864e5),
        days: 2,
        reason: 'Undergoing minor dental surgery and recovery.',
        status: 'pending'
      },
      {
        user: david._id,
        type: 'Casual',
        from: nextWeekStart,
        to: nextWeekEnd,
        days: 3,
        reason: 'Attending family wedding ceremony out of town.',
        status: 'pending'
      },
      {
        user: emp._id,
        type: 'Earned',
        from: new Date(Date.now() - 10 * 864e5),
        to: new Date(Date.now() - 8 * 864e5),
        days: 3,
        reason: 'Annual family retreat in the mountains.',
        status: 'approved',
        reviewedBy: mgr._id,
        note: 'Approved. Enjoy your time off Priya!'
      }
    ]);

    // Notifications
    await Notification.create([
      { user: emp._id, message: 'Welcome to StaffSync! Explore your new attendance and leave dashboard.', read: false },
      { user: emp._id, message: 'Your Earned leave request was approved.', read: true },
      { user: mgr._id, message: 'You have 2 pending team leave requests waiting for your review.', read: false },
      { user: hr._id, message: 'Welcome Anita! You have full HR admin privileges configured.', read: false }
    ]);

    console.log('✅ StaffSync Database Seeded with comprehensive demo workforce data!');
  } catch (err) {
    console.error('❌ Seeding error:', err);
    throw err;
  }
}

if (require.main === module) {
  mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hrm')
    .then(async () => {
      await seedData(true);
      process.exit(0);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { seedData };
