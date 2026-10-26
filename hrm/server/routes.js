const router = require('express').Router(), jwt = require('jsonwebtoken'), bcrypt = require('bcryptjs');
const { User, Employee, Attendance, Leave, Announcement, Training, Notification } = require('./models');
const SECRET = () => process.env.JWT_SECRET || 'dev-secret';
const h = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const fail = (status, message) => { const e = new Error(message); e.status = status; throw e; };
const today = () => new Date().toLocaleDateString('en-CA');
const esc = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const protect = h(async (req, res, next) => {
  const t = (req.headers.authorization || '').replace('Bearer ', '');
  try { const { id } = jwt.verify(t, SECRET()); req.user = await User.findById(id); } catch { fail(401, 'Please sign in again'); }
  if (!req.user) fail(401, 'Account not found');
  next();
});
const allow = (...roles) => (req, res, next) => roles.includes(req.user.role) ? next() : next(Object.assign(new Error('You do not have access to this'), { status: 403 }));
const teamIds = req => req.user.role === 'hr' ? null : Employee.find({ manager: req.user.id }).distinct('user');
async function paginate(M, filter, req, populate) {
  const page = Math.max(+req.query.page || 1, 1), limit = Math.min(+req.query.limit || 8, 50);
  let q = M.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
  if (populate) q = q.populate(populate);
  const [items, total] = await Promise.all([q.lean(), M.countDocuments(filter)]);
  return { items, total, page, pages: Math.max(Math.ceil(total / limit), 1) };
}
const notify = (user, message) => Notification.create({ user, message });

// Auth
const token = u => jwt.sign({ id: u.id }, SECRET(), { expiresIn: '7d' });
router.post('/auth/register', h(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name?.trim() || !/^\S+@\S+\.\S+$/.test(email || '')) fail(400, 'Enter your name and a valid email');
  if ((password || '').length < 6) fail(400, 'Password needs at least 6 characters');
  if (await User.findOne({ email })) fail(409, 'That email is already registered');
  const u = await User.create({ name: name.trim(), email, password: await bcrypt.hash(password, 10) });
  await Employee.create({ user: u._id });
  res.status(201).json({ token: token(u), user: { id: u.id, name: u.name, email: u.email, role: u.role } });
}));
router.post('/auth/login', h(async (req, res) => {
  const u = await User.findOne({ email: String(req.body.email || '').toLowerCase() }).select('+password');
  if (!u || !(await bcrypt.compare(req.body.password || '', u.password))) fail(401, 'Email or password is incorrect');
  res.json({ token: token(u), user: { id: u.id, name: u.name, email: u.email, role: u.role } });
}));
router.get('/auth/me', protect, h(async (req, res) => {
  const employee = await Employee.findOne({ user: req.user.id }).populate('manager', 'name').lean();
  res.json({ id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role, employee });
}));
router.patch('/me', protect, h(async (req, res) => {
  if (req.body.name?.trim()) await User.findByIdAndUpdate(req.user.id, { name: req.body.name.trim() });
  await Employee.findOneAndUpdate({ user: req.user.id }, { phone: String(req.body.phone || '').slice(0, 20) });
  res.json({ ok: true });
}));

// Employees
router.get('/employees', protect, allow('hr', 'manager'), h(async (req, res) => {
  const f = {}; const ids = await teamIds(req); if (ids) f.user = { $in: ids };
  if (req.query.q) { const m = await User.find({ name: new RegExp(esc(req.query.q), 'i') }).distinct('_id'); f.user = { ...(f.user || {}), $in: ids ? m.filter(x => ids.some(i => i.equals(x))) : m }; }
  res.json(await paginate(Employee, f, req, [{ path: 'user', select: 'name email role' }, { path: 'manager', select: 'name' }]));
}));
router.get('/managers', protect, allow('hr'), h(async (req, res) => res.json(await User.find({ role: { $in: ['manager', 'hr'] } }).select('name').lean())));
router.patch('/employees/:id', protect, allow('hr'), h(async (req, res) => {
  const { department, designation, manager, role } = req.body;
  const e = await Employee.findByIdAndUpdate(req.params.id, { department, designation, manager: manager || null }, { new: true });
  if (!e) fail(404, 'Employee not found');
  if (['employee', 'manager', 'hr'].includes(role)) await User.findByIdAndUpdate(e.user, { role });
  res.json(e);
}));

// Attendance
router.post('/attendance/check-in', protect, h(async (req, res) => {
  if (await Attendance.findOne({ user: req.user.id, date: today() })) fail(409, 'You already checked in today');
  res.status(201).json(await Attendance.create({ user: req.user.id, date: today(), checkIn: new Date() }));
}));
router.post('/attendance/check-out', protect, h(async (req, res) => {
  const a = await Attendance.findOne({ user: req.user.id, date: today() });
  if (!a) fail(400, 'Check in first'); if (a.checkOut) fail(409, 'You already checked out today');
  a.checkOut = new Date(); res.json(await a.save());
}));
router.get('/attendance/mine', protect, h(async (req, res) => {
  const [list, current] = await Promise.all([paginate(Attendance, { user: req.user.id }, req), Attendance.findOne({ user: req.user.id, date: today() }).lean()]);
  res.json({ ...list, today: current });
}));
router.get('/attendance/team', protect, allow('hr', 'manager'), h(async (req, res) => {
  const f = { date: req.query.date || today() }; const ids = await teamIds(req); if (ids) f.user = { $in: ids };
  res.json(await paginate(Attendance, f, req, { path: 'user', select: 'name' }));
}));

// Leaves
router.post('/leaves', protect, h(async (req, res) => {
  const { type, from, to, reason } = req.body, f = new Date(from), t = new Date(to);
  if (!type || isNaN(f) || isNaN(t) || !reason?.trim()) fail(400, 'Fill in leave type, dates and reason');
  if (t < f) fail(400, 'End date cannot be before start date');
  res.status(201).json(await Leave.create({ user: req.user.id, type, from: f, to: t, reason: reason.trim(), days: Math.round((t - f) / 864e5) + 1 }));
}));
router.get('/leaves/mine', protect, h(async (req, res) => res.json(await paginate(Leave, { user: req.user.id }, req))));
router.get('/leaves/review', protect, allow('hr', 'manager'), h(async (req, res) => {
  const f = { status: req.query.status || 'pending' }; const ids = await teamIds(req); if (ids) f.user = { $in: ids };
  res.json(await paginate(Leave, f, req, { path: 'user', select: 'name' }));
}));
router.patch('/leaves/:id', protect, allow('hr', 'manager'), h(async (req, res) => {
  const { status, note } = req.body; if (!['approved', 'rejected'].includes(status)) fail(400, 'Choose approve or reject');
  const l = await Leave.findById(req.params.id); if (!l) fail(404, 'Request not found');
  if (l.status !== 'pending') fail(409, 'This request was already reviewed');
  if (l.user.equals(req.user._id)) fail(403, 'You cannot review your own request');
  if (req.user.role === 'manager' && !(await Employee.exists({ user: l.user, manager: req.user.id }))) fail(403, 'This person is not on your team');
  if (status === 'approved') {
    const e = await Employee.findOne({ user: l.user });
    if (l.type !== 'Unpaid') { if (e.leaveBalance < l.days) fail(400, 'Not enough leave balance'); e.leaveBalance -= l.days; await e.save(); }
  }
  Object.assign(l, { status, note, reviewedBy: req.user.id }); await l.save();
  await notify(l.user, `Your ${l.type} leave request was ${status}.`);
  res.json(l);
}));

// Announcements, trainings, notifications
router.get('/announcements', protect, h(async (req, res) => res.json(await Announcement.find().sort({ createdAt: -1 }).limit(+req.query.limit || 20).populate('author', 'name').lean())));
router.post('/announcements', protect, allow('hr'), h(async (req, res) => {
  if (!req.body.title?.trim() || !req.body.body?.trim()) fail(400, 'Add a title and a message');
  res.status(201).json(await Announcement.create({ title: req.body.title, body: req.body.body, author: req.user.id }));
}));
router.delete('/announcements/:id', protect, allow('hr'), h(async (req, res) => { await Announcement.findByIdAndDelete(req.params.id); res.json({ ok: true }); }));
router.get('/trainings', protect, h(async (req, res) => {
  const list = await Training.find().sort({ startDate: 1 }).populate('createdBy', 'name').lean();
  res.json(list.map(t => ({ ...t, count: t.enrolled.length, joined: t.enrolled.some(i => i.equals(req.user._id)), enrolled: undefined })));
}));
router.post('/trainings', protect, allow('hr', 'manager'), h(async (req, res) => {
  if (!req.body.title?.trim()) fail(400, 'Add a training title');
  res.status(201).json(await Training.create({ ...req.body, createdBy: req.user.id }));
}));
router.post('/trainings/:id/enroll', protect, h(async (req, res) => { await Training.findByIdAndUpdate(req.params.id, { $addToSet: { enrolled: req.user.id } }); res.json({ ok: true }); }));
router.get('/notifications', protect, h(async (req, res) => res.json(await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(10).lean())));
router.post('/notifications/read', protect, h(async (req, res) => { await Notification.updateMany({ user: req.user.id }, { read: true }); res.json({ ok: true }); }));

// Dashboard stats
router.get('/stats', protect, h(async (req, res) => {
  const d = today(), now = new Date(), me = req.user.id;
  if (req.user.role === 'hr') {
    const [a, b, c, e, departments] = await Promise.all([Employee.countDocuments(), Leave.countDocuments({ status: 'pending' }), Attendance.countDocuments({ date: d }),
      Leave.countDocuments({ status: 'approved', from: { $lte: now }, to: { $gte: now } }), Employee.aggregate([{ $group: { _id: '$department', n: { $sum: 1 } } }, { $sort: { n: -1 } }])]);
    return res.json({ cards: [['Headcount', a], ['Pending leave requests', b], ['Present today', c], ['On leave today', e]], departments });
  }
  if (req.user.role === 'manager') {
    const ids = await teamIds(req);
    const [b, c, t] = await Promise.all([Leave.countDocuments({ user: { $in: ids }, status: 'pending' }), Attendance.countDocuments({ user: { $in: ids }, date: d }), Training.countDocuments({ createdBy: me })]);
    return res.json({ cards: [['Team members', ids.length], ['Approvals waiting', b], ['Team present today', c], ['Trainings you run', t]] });
  }
  const [e, p, tr, pending] = await Promise.all([Employee.findOne({ user: me }), Attendance.countDocuments({ user: me, date: { $regex: '^' + d.slice(0, 7) } }), Training.countDocuments({ enrolled: me }), Leave.countDocuments({ user: me, status: 'pending' })]);
  res.json({ cards: [['Days present this month', p], ['Leave balance', e?.leaveBalance ?? 0], ['Leave requests pending', pending], ['Trainings joined', tr]] });
}));
module.exports = router;
