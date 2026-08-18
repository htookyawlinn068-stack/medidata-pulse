const jwt = require('jsonwebtoken');

// 1. JWT Token စစ်ဆေးပေးသည့် Middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {

    return res.status(401).json({ success: false, message: 'Access Token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // decoded ထဲတွင် id, email, role တို့ ပါဝင်သည်
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

// 2. Role စစ်ဆေးပေးသည့် Middleware (patient, doctor, receptionist, admin အားလုံး သုံးနိုင်သည်)
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Role '${req.user?.role}' is not authorized to access this route.` 
      });
    }
    next();
  };
};

module.exports = { verifyToken, authorizeRoles };