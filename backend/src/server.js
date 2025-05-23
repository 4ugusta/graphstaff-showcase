require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { ApolloServer } = require('apollo-server-express');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { applyMiddleware } = require('graphql-middleware');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const { authenticate } = require('./auth');

// Performance monitoring middleware
const performanceMiddleware = async (resolve, root, args, context, info) => {
  const start = Date.now();
  const result = await resolve(root, args, context, info);
  const end = Date.now();
  const duration = end - start;
  
  // Log operation performance metrics
  console.log(`[Performance] ${info.parentType.name}.${info.fieldName} took ${duration}ms`);
  
  // Could integrate with a monitoring system like Prometheus here
  
  return result;
};

// Rate limiting middleware (simple in-memory implementation)
const rateLimiter = {
  requests: new Map(),
  resetTime: 60000, // 1 minute
  limit: 1000, // Increased to 1000 requests per minute for development
  
  isRateLimited(ip) {
    const now = Date.now();
    const userRequests = this.requests.get(ip) || { count: 0, timestamp: now };
    
    if (now - userRequests.timestamp > this.resetTime) {
      // Reset counter if time has elapsed
      userRequests.count = 1;
      userRequests.timestamp = now;
    } else {
      userRequests.count += 1;
    }
    
    this.requests.set(ip, userRequests);
    return userRequests.count > this.limit;
  }
};

const rateLimitMiddleware = async (resolve, root, args, context, info) => {
  try {
    // Handle case where context or req might be undefined
    const ip = context?.req?.ip || '127.0.0.1';
    
    if (rateLimiter.isRateLimited(ip)) {
      console.warn(`Rate limit exceeded for IP: ${ip}`);
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    return await resolve(root, args, context, info);
  } catch (error) {
    if (error.message.includes('Rate limit')) {
      throw error; // Re-throw rate limit errors
    }
    console.error('Error in rate limit middleware:', error);
    return await resolve(root, args, context, info); // Continue execution despite errors
  }
};

// Combining all middlewares
const middlewares = [
  performanceMiddleware,
  rateLimitMiddleware
];

async function start() {
  // Initialize Express
  const app = express();
  
  // Apply CORS to allow frontend requests
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }));
  
  // Apply security middleware
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false
  }));
  
  // Apply compression for better performance
  app.use(compression());
  
  // JSON body parser
  app.use(express.json());
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/', (req, res) => {
    res.status(200).send('GraphStaff API is running. Use /graphql for GraphQL queries.');
  }
  );
  
  // Create executable schema with middleware
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const schemaWithMiddleware = applyMiddleware(schema, ...middlewares);
  
  // Setup Apollo Server
  const server = new ApolloServer({
    schema: schemaWithMiddleware,
    context: async ({ req }) => {
      // Get user from authentication middleware
      const user = await authenticate(req);
      
      // Return context object with user and request
      return { 
        user,
        req
      };
    },
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      
      // Security: Don't expose internal server errors to clients
      if (error.extensions?.code === 'INTERNAL_SERVER_ERROR') {
        return new Error('Internal server error');
      }
      
      return error;
    },
    plugins: [
      {
        // Simple logging plugin
        requestDidStart(requestContext) {
          console.log(`Request started: ${requestContext.request.operationName || 'anonymous'}`);
          const startTime = Date.now();
          
          return {
            willSendResponse(responseContext) {
              const duration = Date.now() - startTime;
              console.log(`Request completed in ${duration}ms: ${responseContext.operationName || 'anonymous'}`);
            }
          };
        }
      }
    ]
  });
  
  // Start Apollo Server
  await server.start();
  
  // Apply middleware to Express
  server.applyMiddleware({ 
    app, 
    path: '/graphql',
    cors: false // We're handling CORS at the Express level
  });
  
  // Start server
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`🔍 Health check available at http://localhost:${PORT}/health`);
  });
}

// Handle startup errors
start().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});