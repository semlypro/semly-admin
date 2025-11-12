/**
 * Admin utility functions
 * Centralized admin authentication and authorization
 */

import { auth } from '@clerk/nextjs/server';

/**
 * Check if the current user is an admin
 * Admin users are defined in ADMIN_USER_IDS environment variable (comma-separated)
 */
export async function isUserAdmin(): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return false;
    }

    const ADMIN_USER_IDS = process.env.ADMIN_USER_IDS?.split(',') || [];
    return ADMIN_USER_IDS.includes(userId.trim());
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Require admin access - throws error if user is not admin
 * Use this in API routes
 */
export async function requireAdmin(): Promise<string> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    throw new Error('Forbidden - Admin access required');
  }

  return userId;
}







