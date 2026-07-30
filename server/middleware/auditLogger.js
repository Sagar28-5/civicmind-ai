const AuditLog = require('../models/AuditLog');

const auditLogger = (action, resource) => async (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = async (data) => {
    if (res.statusCode < 400) {
      try {
        await AuditLog.create({
          user: req.user?._id,
          userEmail: req.user?.email || 'anonymous',
          action,
          resource,
          resourceId: req.params?.id || data?._id || '',
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'] || '',
          metadata: { method: req.method, path: req.path },
        });
      } catch (e) {
        // Silent fail — don't break request
      }
    }
    return originalJson(data);
  };
  next();
};

module.exports = auditLogger;
