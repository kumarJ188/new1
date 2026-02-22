const { z } = require('zod');
const User = require('../models/User');
const { signAccessToken } = require('../utils/tokens');

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(200),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(200),
});

async function register(req, res) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input', errors: parsed.error.issues });

  const { name, email, password } = parsed.data;
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: 'Email already in use' });

  const user = new User({ name, email, passwordHash: 'tmp' });
  await user.setPassword(password);
  await user.save();

  const token = signAccessToken(user);
  return res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
}

async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input', errors: parsed.error.issues });

  const { email, password } = parsed.data;
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  if (user.status === 'banned') return res.status(403).json({ message: 'Account is banned' });

  const ok = await user.comparePassword(password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = signAccessToken(user);
  return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
}

async function me(req, res) {
  const user = await User.findById(req.auth.sub);
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json({ id: user._id, name: user.name, email: user.email, role: user.role, status: user.status });
}

module.exports = { register, login, me };
