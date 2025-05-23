# GraphStaff Showcase

A full-stack employee management application built with React, GraphQL, Apollo, and MongoDB.

## Project Overview

GraphStaff Showcase is a modern staff management system that demonstrates best practices in full-stack development. The application provides an intuitive interface for managing employee data with features including authentication, authorization, and different view options for employee records.

### Tech Stack

#### Backend:
- **Node.js** and **Express** - Server framework
- **GraphQL** with **Apollo Server** - API implementation
- **MongoDB** with **Mongoose** - Database and ODM
- **JWT Authentication** - Secure user authentication
- **Performance Monitoring** - Built-in request timing metrics
- **Rate Limiting** - API protection mechanism

#### Frontend:
- **React** - UI library
- **Apollo Client** - GraphQL client
- **Material UI** - Component library for modern UI
- **React Router** - Client-side routing
- **Formik & Yup** - Form management and validation
- **JWT Decode** - Token handling
- **React Toastify** - Notification system

## Features

- **User Authentication** - Secure login and registration system
- **Role-based Access Control** - Admin and Employee roles with different permissions
- **Multiple View Options** - Grid view and Tile view for employee data
- **CRUD Operations** - Complete employee management functionality
- **Responsive Design** - Works on mobile, tablet, and desktop
- **Form Validation** - Client-side validation for all input forms
- **Search & Filter** - Fast data filtering capabilities
- **Performance Optimized** - Database indexing and query optimization

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)
- NPM or Yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm run install:all
   ```
3. Set up environment variables:
   Create a `.env` file in the backend directory with:
   ```
   PORT=4000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secure_jwt_secret
   ```

### Running the Application

1. Seed the database with sample data:
   ```
   npm run seed
   ```

2. Start the development servers:
   ```
   npm run dev
   ```
   This will start both backend and frontend servers concurrently.

3. Open your browser and go to `http://localhost:3000`

### Default Login Credentials

- **Admin User**: admin / password
- **Employee User**: employee / password

## Project Structure

- **/backend** - Server-side code
  - **/src** - Source files
    - **server.js** - Express and Apollo server setup
    - **schema.js** - GraphQL schema definitions
    - **resolvers.js** - GraphQL resolvers
    - **models.js** - Mongoose models
    - **auth.js** - Authentication logic
    - **seed.js** - Database seeding script

- **/frontend** - Client-side code
  - **/public** - Static assets
  - **/src** - React application
    - **/components** - UI components
    - **/context** - React context providers
    - **/styles** - CSS styles

## Available Scripts

- `npm run backend` - Start the backend server
- `npm run frontend` - Start the frontend development server
- `npm run dev` - Start both backend and frontend
- `npm run seed` - Seed the database with sample data