// filepath: /Users/sars/Desktop/task/GraphStaff Showcase/backend/src/debug.js
require('dotenv').config();
const mongoose = require('mongoose');
const { Employee } = require('./models');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/graphstaff', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('MongoDB connected for debugging');
  
  try {
    // Check if employees exist in the database
    const count = await Employee.countDocuments();
    console.log(`Found ${count} employees in the database`);
    
    if (count > 0) {
      // Get a sample employee to examine the structure
      const employee = await Employee.findOne().lean();
      console.log('Sample employee document:', employee);
      
      // Check if the _id can be correctly converted to a string id
      const formattedEmployee = {
        id: employee._id.toString(),
        ...employee,
        _id: undefined
      };
      
      console.log('Formatted for GraphQL:', formattedEmployee);
    } else {
      console.log('No employees found. Database might be empty.');
    }
    
  } catch (error) {
    console.error('Error during debugging:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}).catch(err => console.error('MongoDB connection error:', err));
