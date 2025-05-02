import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export const isPsychiatrist = (req, res, next) => {
  if (!req.user.isPsychiatrist) {
    return res.status(403).json({ message: 'Access denied: Psychiatrist role required' });
  }
  next();
};

export default auth;