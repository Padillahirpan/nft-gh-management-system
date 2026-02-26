/**
 * Authentication Service
 * Handles user authentication, token generation, and validation
 */

import bcrypt from 'bcryptjs';
import prisma from './prisma.js';

/**
 * Authenticate user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {object|null} - User object without password, or null if invalid
 */
export async function authenticateUser(email, password) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.isActive) {
    return null;
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    return null;
  }

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Generate JWT token payload
 * @param {object} user - User object
 * @returns {object} - Token payload
 */
export function generateTokenPayload(user) {
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

/**
 * Hash password
 * @param {string} password - Plain text password
 * @returns {string} - Hashed password
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

/**
 * Verify password strength
 * @param {string} password - Password to verify
 * @returns {object} - { valid: boolean, errors: string[] }
 */
export function verifyPasswordStrength(password) {
  const errors = [];

  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
