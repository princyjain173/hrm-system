require('dotenv').config();
const mongoose = require('mongoose'), bcrypt = require('bcryptjs');
const { User, Employee, Announcement, Training } = require('./models');
(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hrm');
  await Promise.all([User.deleteMany(), Employee.deleteMany(), Announcement.deleteMany(), Training.deleteMany()]);
  const password = await bcrypt.hash('Pass@123', 10);
  const [hr, mgr, emp] = await User.create([
    { name: 'Anita Verma', email: 'hr@hrm.com', password, role: 'hr' },
    { name: 'Rohan Mehta', email: 'mgr@hrm.com', password, role: 'manager' },
    { name: 'Priya Sharma', email: 'emp@hrm.com', password, role: 'employee' }]);
  await Employee.create([
    { user: hr._id, department: 'People Operations', designation: 'HR Lead' },
    { user: mgr._id, department: 'Engineering', designation: 'Engineering Manager', manager: hr._id },
    { user: emp._id, department: 'Engineering', designation: 'Software Engineer', manager: mgr._id }]);
  await Announcement.create({ title: 'Welcome to the new HR portal', body: 'Mark attendance, apply for leave and join training programs from one place.', author: hr._id });
  await Training.create({ title: 'Secure Coding Basics', description: 'Practical habits for safer code reviews.', startDate: new Date(Date.now() + 7 * 864e5), hours: 4, createdBy: mgr._id });
  console.log('Seeded.'); process.exit();
})();
