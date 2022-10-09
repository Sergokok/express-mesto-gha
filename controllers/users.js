const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/users');

const ErrorBadRequest = require('../errors/ErrorBadRequest');
const ErrorNotFound = require('../errors/ErrorNotFound');
const ErrorConflict = require('../errors/ErrorConflict');
const AuthorizationError = require('../errors/AuthorizationError');
const ErrorServer = require('../errors/ErrorServer');

// const DATA_ERROR_CODE = 400;
// const NOT_FOUND_ERROR = 404;
// const SERVER_ERROR_CODE = 500;

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      res.send(users);
    })
    .catch(() => next(new ErrorServer('Ошибка на сервере')));
};

module.exports.createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hashedPassword) => {
      User.create({
        name,
        about,
        avatar,
        password: hashedPassword,
        email,
      })
        .then((user) => {
          res.send(user);
        })
        .catch((err) => {
          if (err.name === 'ValidationError') {
            return next(new ErrorBadRequest('При создании пользователя переданы некорректные данные'));
          } if (err.code === 11000) {
            return next(new ErrorConflict('Данный email уже зарегестрирован'));
          }
          return next(new ErrorServer('Ошибка на сервере'));
        });
    });
};

// module.exports.createUser = (req, res) => {
//   const { name, about, avatar } = req.body;
//   User.create({ name, about, avatar })
//     .then((user) => {
//       res.send({ data: user });
//     })
//     .catch((err) => {
//       if (err.name === 'ValidationError') {
//         return res.status(DATA_ERROR_CODE).send({
//           message: 'При создании пользователя данные переданы некорректно',
//         });
//       }
//       return res.status(SERVER_ERROR_CODE).send({ message: 'Произошла ошибка на сервере' });
//     });
// };

module.exports.getUserInfo = async (req, res, next) => {
  const id = req.user._id;
  try {
    const user = await User.findById(id);
    if (!user) {
      return next(new ErrorNotFound('Пользователь с указанным _id не найден'));
    }
    return res.status(200).send(user);
  } catch (err) {
    return next(new ErrorServer('Ошибка на сервере'));
  }
};

module.exports.getUserId = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (user) {
        return res.send(user);
      }
      return next(new ErrorNotFound('Пользователь не найден'));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new ErrorBadRequest('При создании пользователя переданы некорректные данные'));
      }
      return next(new ErrorServer('Ошибка на сервере'));
    });
};

//   User.findById(req.params.userId)
//     .then((user) => {
//       if (user) {
//         return res.send({ user });
//       }
//       return next(new ErrorNotFound('Пользователь не найден'));
//     })
//     .catch((err) => {
//       if (err.name === 'CastError') {
//         return next(new ErrorBadRequest('Переданы некорректные данные'));
//       }
//       return next(new ErrorServer('Ошибка на сервере'));
//     });
// };

module.exports.editUserProfile = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true },
  )
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        return next(new ErrorBadRequest('Переданы некорректные данные при обновлении профиля'));
      } return next(new ErrorServer('Ошибка на сервере'));
    });
};

module.exports.updateUserAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        next(new ErrorNotFound('Пользователь не найден'));
      } else res.send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        return next(new ErrorBadRequest('Переданы некорректные данные при обновлении аватара'));
      } return next(new ErrorServer('Ошибка на сервере'));
    });
};

const { JWT_SECRET = 'Какой-то_код' } = process.env;

module.exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new AuthorizationError('Неправильные почта или пароль'));
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return next(new AuthorizationError('Неправильные почта или пароль'));
    }
    const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
      expiresIn: '7d',
    });
    res.cookie('jwt', token, {
      httpOnly: true,
      sameSite: true,
      maxAge: 3600 * 24 * 7,
      token: `JWT${token}`,
    });
    return res.status(200).send(user);
  } catch (err) {
    return next(new ErrorServer('Ошибка на сервере'));
  }
};
