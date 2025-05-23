const mongoose = require('mongoose');
const { Schema, model } = mongoose;

// Connect to MongoDB - using environment variable for URI
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/graphstaff';
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Index and performance optimizations built into the schema
const employeeSchema = new Schema({
  name: { 
    type: String, 
    required: true,
    index: true // Indexing for faster searches by name
  },
  age: Number,
  class: {
    type: String,
    index: true // Indexing for faster filtering
  },
  subjects: [String],
  attendance: Number
}, { 
  timestamps: true, // Automatically add createdAt and updatedAt fields
  autoIndex: true // Ensure indexes are created
});

// Compound index for more complex queries
employeeSchema.index({ class: 1, attendance: -1 });

// Add a method to the schema for a simple performance operation
employeeSchema.methods.getPerformanceScore = function() {
  // Simple performance calculation based on attendance
  return this.attendance * 0.1;
};

// Optimize queries with lean option where appropriate
employeeSchema.statics.findByClass = function(employeeClass) {
  return this.find({ class: employeeClass }).lean();
};

// Create the Employee model
const Employee = model('Employee', employeeSchema);

// Export the model
module.exports = { Employee };