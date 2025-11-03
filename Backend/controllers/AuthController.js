import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sql, pool, query } from '../config/db.js';

// Authentication helper functions
const validateCredentials = (username, password) => {
  if (!username || !password) {
    return { isValid: false, error: 'Missing fields' };
  }
  return { isValid: true };
};

const findUserByUsername = async (username) => {
  const result = await query(
    'SELECT AdminID, Username, Password, Email, Role FROM Admins WHERE Username = @username',
    [username]
  );
  return result.recordset[0];
};

const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

const generateAuthToken = (username, role, AdminID) => {
  return jwt.sign(
    { username, role, AdminID },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Controller functions
const loginController = async (request, response) => {
  const { username, password } = request.body;

  // Validate input
  const validation = validateCredentials(username, password);
  if (!validation.isValid) {
    return response.status(400).json({ error: validation.error });
  }

  try {
    // Find user
    const user = await findUserByUsername(username);
    if (!user) {
      return response.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.Password);
    if (!isPasswordValid) {
      return response.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token with role and AdminID
    const token = generateAuthToken(user.Username, user.Role, user.AdminID);
    response.json({ token, role: user.Role });
  } catch (error) {
    console.error('Login error:', error.message);
    response.status(500).json({ error: 'Login failed' });
  }
};

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const registerController = async (request, response) => {
  // Only allow registration if the requester is an admin
  if (!request.user || request.user.role !== 'admin') {
    return response.status(403).json({ error: 'Only existing admins can register new admins' });
  }

  const { username, password, email } = request.body;

  // Validate input
  const validation = validateCredentials(username, password);
  if (!validation.isValid) {
    return response.status(400).json({ error: validation.error });
  }

  if (!email || !email.includes('@')) {
    return response.status(400).json({ error: 'Valid email is required' });
  }

  try {
    // Check for existing user
    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return response.status(409).json({ error: 'Username already exists' });
    }

    // Create new user with admin role
    const hashedPassword = await hashPassword(password);
    await query(
      'INSERT INTO Admins (Username, Password, Email, Role) VALUES (@username, @password, @email, @role)',
      [username, hashedPassword, email, 'admin']
    );

    response.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    console.error('Registration error:', error.message);
    response.status(500).json({ error: 'Registration failed' });
  }
};

const dashboardController = async (request, response) => {
  response.json({ message: `Welcome, ${request.user.username}` });
};

export { loginController, registerController, dashboardController };