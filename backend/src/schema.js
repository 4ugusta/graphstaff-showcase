const { gql } = require('apollo-server-express');

module.exports = gql`
  enum Role { ADMIN EMPLOYEE }

  type Employee {
    id: ID!
    name: String!
    age: Int
    class: String
    subjects: [String!]
    attendance: Float
    createdAt: String
    updatedAt: String
  }

  type User {
    id: ID!
    username: String!
    role: Role!
    email: String!
    name: String!
    employeeId: ID
    employee: Employee
    createdAt: String
    updatedAt: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    totalPages: Int!
    totalCount: Int!
    currentPage: Int!
  }

  type EmployeePage {
    employees: [Employee!]!
    pageInfo: PageInfo!
  }

  type Query {
    # Employee queries
    employees(page: Int, limit: Int, sortBy: String, sortOrder: String, filterName: String): EmployeePage!
    employee(id: ID!): Employee
    
    # User queries
    me: User
    users(role: Role): [User!]!
  }

  type Mutation {
    # Employee mutations - require authentication
    addEmployee(name: String!, age: Int, class: String, subjects: [String!], attendance: Float): Employee!
    updateEmployee(id: ID!, name: String, age: Int, class: String, subjects: [String!], attendance: Float): Employee
    deleteEmployee(id: ID!): Boolean!
    
    # Auth mutations
    login(username: String!, password: String!): AuthPayload!
    register(username: String!, password: String!, email: String!, name: String!, role: Role): AuthPayload!
    
    # User management - admin only
    assignEmployeeToUser(userId: ID!, employeeId: ID!): User
    updateUserRole(userId: ID!, role: Role!): User
  }

  # Directive for role-based access control
  directive @auth(requires: [Role!]) on FIELD_DEFINITION
`;