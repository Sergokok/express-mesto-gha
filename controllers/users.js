const User = require('../models/users');

const DATA_ERROR_CODE = 400;
const NOT_FOUND_ERROR = 404;
const SERVER_ERROR_CODE = 500;

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => res.status(SERVER_ERROR_CODE).send({ message: 'Произошла ошибка' }));
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => {
      res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(DATA_ERROR_CODE).send({
          message: 'При создании пользователя данные переданы некорректно',
        });
      }
      return res.status(SERVER_ERROR_CODE).send({ message: 'Произошла ошибка на сервере' });
    });
};

module.exports.getUserId = (req, res) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (user) {
        return res.send({ user });
      }
      return res.status(NOT_FOUND_ERROR).send({ message: 'Пользователь не найден' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(DATA_ERROR_CODE).send({ message: 'Ошибка валидации. Пользователь не найден' });
      }
      return res.status(SERVER_ERROR_CODE).send({ message: 'Произошла ошибка на сервере' });
    });
};

module.exports.editUserProfile = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        return res.status(NOT_FOUND_ERROR).send({ message: 'Пользователь не найден' });
      }
      return res.send({ user });
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        return res.status(DATA_ERROR_CODE).send({
          message: 'Переданы некорректные данные при обновлении профиля',
        });
      }
      return res.status(SERVER_ERROR_CODE).send({ message: 'Произошла ошибка' });
    });
};

module.exports.updateUserAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      res.send({ user });
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        return res.status(NOT_FOUND_ERROR).send({ message: 'Пользователь не найден' });
      }
      if (err.name === 'ValidationError') {
        return res.status(DATA_ERROR_CODE).send({
          message: 'При обновлении аватара данные переданы некорректно',
        });
      }
      return res.status(SERVER_ERROR_CODE).send({ message: 'Произошла ошибка на сервере' });
    });
};
