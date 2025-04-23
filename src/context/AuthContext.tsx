import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../firebase/config';

// Mock user type for local authentication
interface MockUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

// Define the AuthContext types
interface AuthContextType {
  currentUser: MockUser | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | null>(null);

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Define the AuthProvider props
interface AuthProviderProps {
  children: ReactNode;
}

// Simulate network delay
const simulateNetworkDelay = () => new Promise(resolve => setTimeout(resolve, 1000));

// Create the AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user exists in localStorage
  useEffect(() => {
    const userString = localStorage.getItem('trashmap_user');
    if (userString) {
      try {
        const user = JSON.parse(userString);
        setCurrentUser(user);
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);
      }
    }
    setLoading(false);
  }, []);

  // Function to sign up a new user
  const signup = async (email: string, password: string) => {
    await simulateNetworkDelay(); // Simulate network delay
    
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('trashmap_users') || '{}');
    
    if (users[email]) {
      throw new Error('auth/email-already-in-use');
    }
    
    // Store the user credentials
    const newUser = {
      uid: Date.now().toString(),
      email,
      displayName: null,
    };
    
    // Save in mock database
    users[email] = { password, user: newUser };
    localStorage.setItem('trashmap_users', JSON.stringify(users));
    
    // Set as current user
    setCurrentUser(newUser);
    localStorage.setItem('trashmap_user', JSON.stringify(newUser));
    
    return;
  };

  // Function to log in a user
  const login = async (email: string, password: string) => {
    await simulateNetworkDelay(); // Simulate network delay
    
    const users = JSON.parse(localStorage.getItem('trashmap_users') || '{}');
    
    if (!users[email]) {
      throw new Error('auth/user-not-found');
    }
    
    if (users[email].password !== password) {
      throw new Error('auth/wrong-password');
    }
    
    // Set as current user
    setCurrentUser(users[email].user);
    localStorage.setItem('trashmap_user', JSON.stringify(users[email].user));
    
    return;
  };

  // Function to log out a user
  const logout = async () => {
    await simulateNetworkDelay(); // Simulate network delay
    
    setCurrentUser(null);
    localStorage.removeItem('trashmap_user');
    
    return;
  };

  // Function to reset password
  const resetPassword = async (email: string) => {
    await simulateNetworkDelay(); // Simulate network delay
    
    const users = JSON.parse(localStorage.getItem('trashmap_users') || '{}');
    
    if (!users[email]) {
      throw new Error('auth/user-not-found');
    }
    
    // In a real app, this would send an email. For demo, we'll just reset the password to "password"
    users[email].password = 'password';
    localStorage.setItem('trashmap_users', JSON.stringify(users));
    
    return;
  };

  // Function to update user profile
  const updateUserProfile = async (displayName: string) => {
    if (!currentUser) return;
    
    await simulateNetworkDelay(); // Simulate network delay
    
    const updatedUser = {
      ...currentUser,
      displayName
    };
    
    // Update current user
    setCurrentUser(updatedUser);
    localStorage.setItem('trashmap_user', JSON.stringify(updatedUser));
    
    // Update in users storage
    const users = JSON.parse(localStorage.getItem('trashmap_users') || '{}');
    if (currentUser.email && users[currentUser.email]) {
      users[currentUser.email].user = updatedUser;
      localStorage.setItem('trashmap_users', JSON.stringify(users));
    }
    
    return;
  };

  // Create the value object for the context provider
  const value: AuthContextType = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 