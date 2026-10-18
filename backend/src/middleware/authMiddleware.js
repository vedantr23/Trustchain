/**
 * Trustchain – Authentication & Authorization Middleware
 *
 * Implements:
 * 1. Supabase JWT Token Verification (via supabase.auth.getUser)
 * 2. Role-Based Access Control (Admin, NGO, Donor)
 * 3. NGO Approval Gating (Only approved NGOs can create drives/milestones)
 * 4. Fallback Demo Auth for local offline viva / development evaluation
 */
import { supabase } from '../config/supabase.js';

// Hardcoded whitelist for super-admins
const ADMIN_EMAILS = [
  'admin@trustchain.org',
  'ayushsahu882004@gmail.com',
];

/**
 * Parses user identity from either:
 * - Authorization: Bearer <supabase_jwt_token>
 * - X-Demo-Role / X-User-Id / X-User-Email (for offline viva test suite)
 */
export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const demoRole   = req.headers['x-demo-role'];
    const demoEmail  = req.headers['x-demo-email'];
    const demoUserId = req.headers['x-user-id'];

    // 1. Check for Bearer token
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token && token !== 'undefined' && token !== 'null') {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          const email = user.email || '';
          const isSuperAdmin = ADMIN_EMAILS.includes(email.toLowerCase());

          req.user = {
            id: user.id,
            email,
            role: isSuperAdmin ? 'Admin' : (profile?.role || 'Donor'),
            ngo_status: profile?.ngo_status,
            full_name: profile?.full_name || email.split('@')[0],
            profile: profile || null,
          };
          return next();
        }
      }
    }

    // 2. Demo / Viva Header Support (Permits easy local testing without SMTP)
    if (demoRole || demoUserId) {
      const role = demoRole === 'Admin' ? 'Admin' : demoRole === 'NGO' ? 'NGO' : 'Donor';
      const email = demoEmail || (role === 'Admin' ? 'admin@trustchain.org' : `${role.toLowerCase()}@trustchain.org`);
      req.user = {
        id: demoUserId || `demo-${role.toLowerCase()}-001`,
        email,
        role: ADMIN_EMAILS.includes(email.toLowerCase()) ? 'Admin' : role,
        ngo_status: role === 'NGO' ? (req.headers['x-ngo-status'] || 'approved') : null,
        full_name: req.headers['x-user-name'] || `${role} User`,
        isDemo: true,
      };
      return next();
    }

    req.user = null;
    next();
  } catch (err) {
    console.warn('[authMiddleware] Authentication parse warning:', err.message);
    req.user = null;
    next();
  }
}

/**
 * Require valid logged-in user
 */
export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in to access this portal endpoint.',
    });
  }
  next();
}

/**
 * Require one of the specified roles: requireRole('Admin') or requireRole('Admin', 'NGO')
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please log in.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Portal access restricted to [${allowedRoles.join(', ')}]. Your active role is '${req.user.role}'.`,
      });
    }

    next();
  };
}

/**
 * Require that an NGO is verified and approved before creating drives or claiming disbursements
 */
export function requireApprovedNGO(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required.' });
  }

  if (req.user.role !== 'NGO') {
    return res.status(403).json({ success: false, error: 'Only NGO partners can perform this action.' });
  }

  if (req.user.ngo_status === 'pending' || req.user.ngo_status === 'rejected') {
    return res.status(403).json({
      success: false,
      error: `NGO account is currently '${req.user.ngo_status}'. Drive creation and fundraising require Admin approval.`,
    });
  }

  next();
}
