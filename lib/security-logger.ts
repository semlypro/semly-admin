/**
 * Security Event Logging
 * OWASP: Security Logging and Monitoring
 */

export enum SecurityEventType {
  AUTH_SUCCESS = 'auth_success',
  AUTH_FAILURE = 'auth_failure',
  ACCESS_DENIED = 'access_denied',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  INVALID_INPUT = 'invalid_input',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  ADMIN_ACTION = 'admin_action',
}

export interface SecurityEvent {
  type: SecurityEventType;
  userId?: string;
  ip?: string;
  userAgent?: string;
  path?: string;
  timestamp: Date;
  details: Record<string, any>;
}

/**
 * Log security events
 */
export function logSecurityEvent(event: SecurityEvent): void {
  const logEntry = {
    ...event,
    timestamp: event.timestamp.toISOString(),
  };

  // Development: Log to console (only critical events to reduce noise)
  if (process.env.NODE_ENV === 'development') {
    // Only log critical security events in development
    const criticalEvents = [
      SecurityEventType.ACCESS_DENIED,
      SecurityEventType.RATE_LIMIT_EXCEEDED,
      SecurityEventType.SUSPICIOUS_ACTIVITY,
      SecurityEventType.AUTH_FAILURE,
    ];

    if (criticalEvents.includes(event.type)) {
      console.warn('🔒 SECURITY EVENT:', logEntry);
    }
    // Skip logging: AUTH_SUCCESS, ADMIN_ACTION, INVALID_INPUT (too noisy in dev)
  }

  // Production: Log to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to Sentry, Datadog, or other monitoring service
    // For now, just console.error for visibility in production logs
    console.error('🔒 SECURITY EVENT:', JSON.stringify(logEntry));

    // Example: Send to external service
    // fetch('/api/security-logs', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(logEntry),
    // }).catch(() => {}); // Fire and forget
  }
}

/**
 * Helper to extract request metadata
 */
export function getRequestMetadata(req: Request) {
  return {
    ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
    userAgent: req.headers.get('user-agent') || 'unknown',
    path: new URL(req.url).pathname,
  };
}

/**
 * Log authentication success
 */
export function logAuthSuccess(userId: string, req?: Request): void {
  logSecurityEvent({
    type: SecurityEventType.AUTH_SUCCESS,
    userId,
    ...(req ? getRequestMetadata(req) : {}),
    timestamp: new Date(),
    details: {},
  });
}

/**
 * Log authentication failure
 */
export function logAuthFailure(reason: string, req?: Request): void {
  logSecurityEvent({
    type: SecurityEventType.AUTH_FAILURE,
    ...(req ? getRequestMetadata(req) : {}),
    timestamp: new Date(),
    details: { reason },
  });
}

/**
 * Log access denied
 */
export function logAccessDenied(userId: string | undefined, resource: string, req?: Request): void {
  logSecurityEvent({
    type: SecurityEventType.ACCESS_DENIED,
    userId,
    ...(req ? getRequestMetadata(req) : {}),
    timestamp: new Date(),
    details: { resource },
  });
}

/**
 * Log rate limit exceeded
 */
export function logRateLimitExceeded(identifier: string, path: string): void {
  logSecurityEvent({
    type: SecurityEventType.RATE_LIMIT_EXCEEDED,
    ip: identifier,
    path,
    timestamp: new Date(),
    details: {},
  });
}

/**
 * Log invalid input
 */
export function logInvalidInput(userId: string | undefined, input: string, req?: Request): void {
  logSecurityEvent({
    type: SecurityEventType.INVALID_INPUT,
    userId,
    ...(req ? getRequestMetadata(req) : {}),
    timestamp: new Date(),
    details: { input: input.substring(0, 100) }, // Truncate for safety
  });
}
