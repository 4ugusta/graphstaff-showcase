const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

// Define User schema with role-based access control
const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'EMPLOYEE'], default: 'EMPLOYEE' },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee' }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = model('User', userSchema);

// Authentication middleware
const authenticate = async (req) => {
  try {
    const authHeader = req.headers.authorization || '';
    console.log('Auth header:', authHeader);
    
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : '';
      
    if (!token) {
      console.log('No token provided');
      return null;
    }
    
    try {
      console.log('Verifying token with secret:', process.env.JWT_SECRET ? 'JWT_SECRET is set' : 'JWT_SECRET is missing');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded:', decoded);
      
      const user = await User.findById(decoded.userId);
      if (!user) {
        console.log(`User with ID ${decoded.userId} not found`);
      } else {
        console.log(`Authenticated as user: ${user.username}, role: ${user.role}`);
      }
      
      return user;
    } catch (err) {
      console.error('Token verification error:', err.message);
      return null;
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return null;
  }
};

// Check if user has required role
const checkRole = (user, requiredRoles) => {
  if (!user) return false;
  if (!requiredRoles || requiredRoles.length === 0) return true;
  return requiredRoles.includes(user.role);
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

module.exports = {
  User,
  authenticate,
  checkRole,
  generateToken
};