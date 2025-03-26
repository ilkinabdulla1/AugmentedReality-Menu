function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect('/login'); // Redirect to login if no token is found
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret');
    req.admin = decoded.admin; // Attach admin details to the request
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.redirect('/login'); // Redirect to login if token verification fails
  }
}

module.exports = authenticateToken;
