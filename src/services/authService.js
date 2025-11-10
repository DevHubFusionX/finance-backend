import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

class AuthService {
  constructor() {
    this.users = [];
  }

  generateToken(user) {
    return jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  async signup(userData) {
    const errors = User.validate(userData);
    if (errors.length > 0) {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.details = errors;
      throw error;
    }

    // Check if user already exists
    const existingUser = this.users.find(u => u.email === userData.email);
    if (existingUser) {
      const error = new Error('User already exists');
      error.name = 'ConflictError';
      throw error;
    }

    const user = new User(userData);
    this.users.push(user);
    
    const token = this.generateToken(user);
    
    return {
      user: user.toJSON(),
      token
    };
  }

  async login(email, password) {
    const user = this.users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      const error = new Error('Invalid credentials');
      error.name = 'AuthenticationError';
      throw error;
    }

    const token = this.generateToken(user);
    
    return {
      user: user.toJSON(),
      token
    };
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  getUserById(id) {
    const user = this.users.find(u => u.id == id);
    return user ? user.toJSON() : null;
  }

  updateUser(id, data) {
    const user = this.users.find(u => u.id == id);
    if (!user) {
      const error = new Error('User not found');
      error.name = 'NotFoundError';
      throw error;
    }
    user.update(data);
    return user.toJSON();
  }
}

export default new AuthService();