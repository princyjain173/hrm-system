const { Schema, model } = require('mongoose');
const ref = n => ({ type: Schema.Types.ObjectId, ref: n });
const User = model('User', new Schema({
  name: { type: String, required: true, trim: true }, email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false }, role: { type: String, enum: ['employee', 'manager', 'hr'], default: 'employee' }
}, { timestamps: true }));
const Employee = model('Employee', new Schema({
  user: { ...ref('User'), unique: true }, manager: ref('User'), department: { type: String, default: 'Unassigned', index: true },
  designation: { type: String, default: 'Team Member' }, phone: String, joinDate: { type: Date, default: Date.now }, leaveBalance: { type: Number, default: 18 }
}));
const a = new Schema({ user: ref('User'), date: String, checkIn: Date, checkOut: Date });
a.index({ user: 1, date: 1 }, { unique: true });
const Attendance = model('Attendance', a);
const l = new Schema({
  user: ref('User'), type: { type: String, enum: ['Casual', 'Sick', 'Earned', 'Unpaid'], required: true }, from: { type: Date, required: true },
  to: { type: Date, required: true }, days: Number, reason: { type: String, required: true, maxlength: 400 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }, reviewedBy: ref('User'), note: String
}, { timestamps: true });
l.index({ status: 1, createdAt: -1 });
const Leave = model('Leave', l);
const Announcement = model('Announcement', new Schema({ title: { type: String, required: true }, body: { type: String, required: true }, author: ref('User') }, { timestamps: true }));
const Training = model('Training', new Schema({ title: { type: String, required: true }, description: String, startDate: Date, hours: Number, createdBy: ref('User'), enrolled: [ref('User')] }, { timestamps: true }));
const n = new Schema({ user: ref('User'), message: String, read: { type: Boolean, default: false } }, { timestamps: true });
n.index({ user: 1, read: 1 });
const Notification = model('Notification', n);
module.exports = { User, Employee, Attendance, Leave, Announcement, Training, Notification };
