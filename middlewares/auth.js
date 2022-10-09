const jwt = require('jsonwebtoken');
const AuthorizationError = require('../errors/AuthorizationError');

const { JWT_SECRET = 'Какой-то_код' } = process.env;

// eslint-disable-next-line consistent-return
const auth = (req, res, next) => {
  if (req.cookies.jwt) {
    const token = req.cookies.jwt;
    let payload;

    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return next(new AuthorizationError('Необходимо авторизоваться'));
    }

    req.user = payload;

    next();
  } else {
    return next(new AuthorizationError('Необходимо авторизоваться'));
  }
};

module.exports = auth;
