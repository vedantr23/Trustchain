/**
 * Lightweight request-body validator.
 * Usage:  router.post('/foo', validateBody(['field1', 'field2']), handler)
 */
export function validateBody(requiredFields) {
  return (req, res, next) => {
    const missing = requiredFields.filter(f => req.body[f] === undefined || req.body[f] === null || req.body[f] === '');
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missing.join(', ')}`,
      });
    }
    next();
  };
}
