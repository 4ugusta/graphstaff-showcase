import React, { createContext, useState, useContext, useEffect } from 'react';
import { useMutation, gql, ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

// GraphQL mutations for login and registration
const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user {
        id
        username
        role
        name
      }
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($username: String!, $password: String!, $email: String!, $name: String!) {
    register(username: $username, password: $password, email: $email, name: $name) {
      token
      user {
        id
        username
        role
        name
      }
    }
  }
`;

// Create the authentication context
const AuthContext = createContext();

// Provider component that wraps the app and makes auth available to any child component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  
  // Create Apollo Client instance with authentication
  const client = new ApolloClient({
    uri: process.env.REACT_APP_GRAPHQL_URL || 'http://localhost:4000/graphql',
    cache: new InMemoryCache(),
    headers: {
      authorization: token ? `Bearer ${token}` : '',
    },
  });

  // Check if user is logged in on mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        // If token exists, decode it or verify with backend
        if (token) {
          // Here you might want to validate the token with your backend
          // For now, we'll just use a simple check if token exists
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (error) {
        // If token is invalid, clear user data
        console.error('Error verifying token', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  // Login function
  const login = async (username, password) => {
    try {
      setLoading(true);
      const result = await client.mutate({
        mutation: LOGIN_MUTATION,
        variables: { username, password },
      });
      
      const { token, user } = result.data.login;
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setToken(token);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'Login failed. Please check your credentials.'
      };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      const result = await client.mutate({
        mutation: REGISTER_MUTATION,
        variables: userData,
      });
      
      const { token, user } = result.data.register;
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setToken(token);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.message || 'Registration failed.'
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    // Force a reload of Apollo client to clear cache
    client.resetStore();
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    if (!user) return false;
    return user.role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        user,
        loading,
        login,
        register,
        logout,
        hasRole,
        isAdmin: user?.role === 'ADMIN',
      }}
    >
      <ApolloProvider client={client}>
        {children}
      </ApolloProvider>
    </AuthContext.Provider>
  );
}

// Custom hook for easy context use
export const useAuth = () => useContext(AuthContext);

// HOC for protected routes
export const withAuth = (Component) => (props) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading authentication...</div>;
  }
  
  if (!isAuthenticated) {
    // You could redirect here using React Router
    return <div>Please log in to view this page.</div>;
  }
  
  return <Component {...props} />;
};