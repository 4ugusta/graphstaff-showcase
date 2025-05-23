const { Employee } = require('./models');
const { User, checkRole, generateToken } = require('./auth');
const { AuthenticationError, ForbiddenError, ApolloError } = require('apollo-server-express');
const bcrypt = require('bcrypt');

// Authentication check middleware
const requireAuth = (user) => {
  if (!user) throw new AuthenticationError('You must be logged in');
  return user;
};

// Role-based authorization middleware
const requireRole = (user, roles) => {
  if (!checkRole(user, roles)) {
    throw new ForbiddenError(`You don't have permission to perform this action`);
  }
  return user;
};

// Cache implementation for frequently accessed data
const cache = {
  employees: new Map(), // Simple in-memory cache
  ttl: 60000, // 1 minute TTL
  set(key, value) {
    this.employees.set(key, { 
      value, 
      timestamp: Date.now() 
    });
  },
  get(key) {
    const entry = this.employees.get(key);
    if (!entry) return null;
    
    // Check if cache has expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.employees.delete(key);
      return null;
    }
    
    return entry.value;
  },
  invalidate(key) {
    this.employees.delete(key);
  },
  invalidateAll() {
    this.employees.clear();
  }
};

module.exports = {
  Query: {
    // Enhanced employees query with pagination, sorting, and caching
    employees: async (_, { page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc', filterName }, context) => {
      try {
        console.log('Processing employees query:', { page, limit, sortBy, sortOrder, filterName });
        
        if (!context) {
          console.error('Context is undefined in employees query');
          throw new Error('Invalid GraphQL context');
        }
        
        console.log('Context user:', context.user ? `Authenticated as ${context.user.username}` : 'Not authenticated');
        
        // Authentication is optional for this endpoint
        const user = context?.user;
        
        // Build cache key based on query parameters
        const cacheKey = `${page}_${limit}_${sortBy}_${sortOrder}_${filterName || ''}`;
        const cachedResult = cache.get(cacheKey);
        
        if (cachedResult) {
          console.log('Cache hit for employees query');
          return cachedResult;
        }
        
        console.log('Cache miss for employees query');
        
        // Safe sort field (prevent injection)
        const safeSortBy = ['name', 'age', 'class', 'attendance', 'createdAt', 'updatedAt'].includes(sortBy) 
          ? sortBy 
          : 'name';
        
        // Safe sort order
        const safeSortOrder = sortOrder === 'desc' ? -1 : 1;
        
        // Build filter
        const filter = filterName ? { name: new RegExp(filterName, 'i') } : {};
        
        // Count total employees for pagination info
        const totalCount = await Employee.countDocuments(filter);
        const totalPages = Math.ceil(totalCount / limit);
        
        // Execute query with optimizations
        const query = Employee.find(filter)
          .sort({ [safeSortBy]: safeSortOrder })
          .skip((page-1)*limit)
          .limit(limit)
          .lean(); // Return plain objects instead of Mongoose documents for better performance
        
        const employees = await query;
        console.log(`Found ${employees.length} employees for page ${page}`);
        
        // Transform MongoDB _id to GraphQL id and ensure all fields are properly formatted
        const formattedEmployees = employees.map(emp => ({
          id: emp._id.toString(), // Convert ObjectId to string
          ...emp,
          _id: undefined // Remove the _id field to avoid duplication
        }));
        
        // Format response with pagination info
        const result = {
          employees: formattedEmployees,
          pageInfo: {
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
            totalPages,
            totalCount,
            currentPage: page
          }
        };
        
        // Store in cache
        cache.set(cacheKey, result);
        
        return result;
      } catch (error) {
        console.error('Error in employees query:', error);
        throw error; // Let Apollo Server handle the error formatting
      }
    },
    
    // Get a single employee by ID
    employee: async (_, { id }, context) => {
      try {
        console.log(`Fetching employee with ID: ${id}`);
        
        // Check if authentication is required (uncomment if needed)
        // if (!context.user) {
        //   throw new AuthenticationError('Authentication required');
        // }
        
        const cacheKey = `employee_${id}`;
        const cachedEmployee = cache.get(cacheKey);
        
        if (cachedEmployee) {
          console.log('Cache hit for employee query');
          return cachedEmployee;
        }
        
        console.log('Cache miss for employee query');
        
        const employee = await Employee.findById(id).lean();
        if (employee) {
          // Transform MongoDB _id to GraphQL id
          const formattedEmployee = {
            id: employee._id.toString(),
            ...employee,
            _id: undefined // Remove the _id field
          };
          cache.set(cacheKey, formattedEmployee);
          return formattedEmployee;
        } else {
          console.log(`No employee found with ID: ${id}`);
          return null;
        }
      } catch (error) {
        console.error(`Error in employee query for ID ${id}:`, error);
        throw error; // Let Apollo Server handle the error formatting
      }
    },
    
    // Get current user (requires authentication)
    me: async (_, __, { user }) => {
      requireAuth(user);
      return user;
    },
    
    // Get all users (admin only)
    users: async (_, { role }, { user }) => {
      requireAuth(user);
      requireRole(user, ['ADMIN']);
      
      const filter = role ? { role } : {};
      return User.find(filter).lean();
    }
  },
  
  Mutation: {
    // Add a new employee (requires admin role)
    addEmployee: async (_, args, context) => {
      const user = context?.user;
      requireAuth(user);
      requireRole(user, ['ADMIN']);
      
      const employee = await new Employee(args).save();
      // Transform MongoDB _id to GraphQL id
      const formattedEmployee = {
        id: employee._id.toString(),
        ...employee.toObject(),
        _id: undefined
      };
      cache.invalidateAll(); // Invalidate all employee-related caches
      return formattedEmployee;
    },
    
    // Update an existing employee (requires admin role)
    updateEmployee: async (_, { id, ...updates }, context) => {
      const user = context?.user;
      requireAuth(user);
      requireRole(user, ['ADMIN']);
      
      const employee = await Employee.findByIdAndUpdate(
        id, 
        updates, 
        { new: true, runValidators: true }
      );
      
      if (!employee) {
        throw new Error(`Employee with ID ${id} not found`);
      }
      
      // Transform MongoDB _id to GraphQL id
      const formattedEmployee = {
        id: employee._id.toString(),
        ...employee.toObject(),
        _id: undefined
      };
      
      // Invalidate specific cache entries
      cache.invalidate(`employee_${id}`);
      cache.invalidateAll();
      
      return formattedEmployee;
    },
    
    // Delete an employee (requires admin role)
    deleteEmployee: async (_, { id }, { user }) => {
      requireAuth(user);
      requireRole(user, ['ADMIN']);
      
      const doc = await Employee.findByIdAndDelete(id);
      
      if (!doc) {
        throw new Error(`Employee with ID ${id} not found`);
      }
      
      // Invalidate specific cache entries
      cache.invalidate(`employee_${id}`);
      cache.invalidateAll();
      
      return Boolean(doc);
    },
    
    // User authentication - login
    login: async (_, { username, password }) => {
      const user = await User.findOne({ username });
      
      if (!user) {
        throw new AuthenticationError('Invalid username or password');
      }
      
      const valid = await bcrypt.compare(password, user.password);
      
      if (!valid) {
        throw new AuthenticationError('Invalid username or password');
      }
      
      const token = generateToken(user._id);
      
      return {
        token,
        user
      };
    },
    
    // User registration
    register: async (_, { username, password, email, name, role = 'EMPLOYEE' }, { user }) => {
      // Check if admin role is requested - requires existing admin
      if (role === 'ADMIN') {
        if (!user || user.role !== 'ADMIN') {
          throw new ForbiddenError('Only admins can create admin accounts');
        }
      }
      
      // Check if username or email already exists
      const existingUser = await User.findOne({ 
        $or: [{ username }, { email }] 
      });
      
      if (existingUser) {
        throw new Error('Username or email already in use');
      }
      
      // Create the new user
      const newUser = await User.create({
        username,
        password, // Will be hashed by the pre-save hook
        email,
        name,
        role
      });
      
      const token = generateToken(newUser._id);
      
      return {
        token,
        user: newUser
      };
    },
    
    // Assign an employee to a user account (admin only)
    assignEmployeeToUser: async (_, { userId, employeeId }, { user }) => {
      requireAuth(user);
      requireRole(user, ['ADMIN']);
      
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { employeeId },
        { new: true }
      );
      
      if (!updatedUser) {
        throw new Error(`User with ID ${userId} not found`);
      }
      
      return updatedUser;
    },
    
    // Update a user's role (admin only)
    updateUserRole: async (_, { userId, role }, { user }) => {
      requireAuth(user);
      requireRole(user, ['ADMIN']);
      
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true }
      );
      
      if (!updatedUser) {
        throw new Error(`User with ID ${userId} not found`);
      }
      
      return updatedUser;
    }
  },
  
  // Resolve references between types
  User: {
    employee: async (user) => {
      if (!user.employeeId) return null;
      return Employee.findById(user.employeeId);
    }
  }
};