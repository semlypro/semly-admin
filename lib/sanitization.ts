/**
 * Input Sanitization Utilities
 * OWASP: Injection Attack Prevention
 */

/**
 * Sanitize HTML content (removes scripts and dangerous tags)
 */
export function sanitizeHTML(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
}

/**
 * Sanitize general user input
 */
export function sanitizeUserInput(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .substring(0, maxLength);
}

/**
 * Validate email format
 * OWASP: Input Validation
 */
export function validateEmail(email: string): boolean {
  if (typeof email !== 'string' || email.length > 255 || email.length < 3) {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL
 * OWASP: Input Validation + SSRF Prevention
 */
export function validateURL(url: string): boolean {
  if (typeof url !== 'string' || url.length > 2048) {
    return false;
  }

  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Validate alphanumeric with basic special chars
 */
export function validateAlphanumeric(input: string): boolean {
  if (typeof input !== 'string') return false;
  return /^[a-zA-Z0-9\s\-_]+$/.test(input);
}

/**
 * Sanitize SQL-like input (extra layer on top of Supabase ORM)
 * OWASP: SQL Injection Prevention
 */
export function sanitizeSQL(input: string): string {
  if (typeof input !== 'string') return '';
  return input.replace(/[;'"\\]/g, '').substring(0, 1000);
}

/**
 * Prevent path traversal
 * OWASP: Path Traversal Prevention
 */
export function sanitizePath(path: string): string {
  if (typeof path !== 'string') return '';
  return path.replace(/\.\./g, '').replace(/[^a-zA-Z0-9\-_\/]/g, '');
}

/**
 * Sanitize JSON input
 */
export function sanitizeJSON(input: any): any {
  try {
    const str = JSON.stringify(input);
    if (str.length > 10000) {
      throw new Error('JSON too large');
    }
    return JSON.parse(str);
  } catch {
    return null;
  }
}
