require('dotenv').config();
const mongoose = require('mongoose');
const { Employee } = require('./models');
const { User } = require('./auth');
const bcrypt = require('bcrypt');

// First, drop the collections to ensure clean seeding
async function dropCollections() {
  try {
    const collections = Object.keys(mongoose.connection.collections);
    for (const collectionName of collections) {
      const collection = mongoose.connection.collections[collectionName];
      await collection.drop();
    }
  } catch (error) {
    // This error might occur when the collection doesn't exist yet
    console.log('Error dropping collections (may be harmless):', error.message);
  }
}

const employeeSeedData = [
  {
    name: 'John Smith',
    age: 35,
    class: 'Senior Faculty',
    subjects: ['Mathematics', 'Computer Science'],
    attendance: 98.5
  },
  {
    name: 'Sarah Johnson',
    age: 28,
    class: 'Junior Faculty',
    subjects: ['English Literature', 'Creative Writing'],
    attendance: 95.2
  },
  {
    name: 'Michael Chen',
    age: 42,
    class: 'Department Head',
    subjects: ['Physics', 'Astronomy'],
    attendance: 99.1
  },
  {
    name: 'Emily Davis',
    age: 31,
    class: 'Mid-level Faculty',
    subjects: ['History', 'Political Science'],
    attendance: 92.8
  },
  {
    name: 'Robert Wilson',
    age: 45,
    class: 'Senior Faculty',
    subjects: ['Chemistry', 'Biology'],
    attendance: 97.3
  },
  {
    name: 'Jennifer Lee',
    age: 29,
    class: 'Junior Faculty',
    subjects: ['Psychology', 'Sociology'],
    attendance: 94.6
  },
  {
    name: 'David Martinez',
    age: 39,
    class: 'Mid-level Faculty',
    subjects: ['Economics', 'Business Studies'],
    attendance: 91.5
  },
  {
    name: 'Lisa Thompson',
    age: 33,
    class: 'Mid-level Faculty',
    subjects: ['Art History', 'Studio Art'],
    attendance: 89.9
  },
  {
    name: 'James Wilson',
    age: 47,
    class: 'Department Head',
    subjects: ['Music Theory', 'Composition'],
    attendance: 96.7
  },
  {
    name: 'Patricia Rodriguez',
    age: 36,
    class: 'Senior Faculty',
    subjects: ['Spanish', 'French'],
    attendance: 93.2
  }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('MongoDB connected for seeding');
  
  try {
    // Drop existing collections to ensure clean slate
    await dropCollections();
    
    // Insert employee data
    const employees = await Employee.insertMany(employeeSeedData);
    console.log(`${employees.length} employees inserted`);
    
    // Create admin and employee users
    // No need to pre-hash passwords; the User schema will hash them
    
    // Create admin user
    await User.create({
      username: 'admin',
      password: 'admin123', // Will be hashed by the pre-save hook
      role: 'ADMIN',
      email: 'admin@graphstaff.com',
      name: 'Admin User'
    });
    
    // Create employee user linked to a real employee
    await User.create({
      username: 'john',
      password: 'employee123', // Will be hashed by the pre-save hook
      role: 'EMPLOYEE',
      email: 'john@graphstaff.com',
      name: 'John Smith',
      employeeId: employees[0]._id
    });
    
    console.log('Users created: admin (admin123), john (employee123)');
    
    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding data:', error);
    mongoose.connection.close();
  }
}).catch(err => console.error('MongoDB connection error:', err));