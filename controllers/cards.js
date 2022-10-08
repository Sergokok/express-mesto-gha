const Card = require('../models/cards');

const ErrorBadRequest = require('../errors/ErrorBadRequest');
const ErrorNotFound = require('../errors/ErrorNotFound');
const ForbiddenError = require('../errors/ForbiddenError');
const ErrorServer = require('../errors/ErrorServer');

// const DATA_ERROR_CODE = 400;
// const NOT_FOUND_ERROR = 404;
// const SERVER_ERROR_CODE = 500;

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => {
      res.send({ cards });
    })
    .catch(() => {
      next(new ErrorServer('Ошибка на сервере'));
    });
};

module.exports.createCard = (req, res, next) => {
  const { name, link, owner = req.user._id } = req.body;
  Card.create({ name, link, owner })
    .then((card) => {
      res.send({ card });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(
          new ErrorBadRequest('При создании карточки данные переданы некорректно'),
        );
      }
      return next(new ErrorServer('Ошибка на сервере'));
    });
};

module.exports.deleteCard = async (req, res, next) => {
  try {
    const card = await Card.findByIdAndDelete(req.params.cardId);
    if (!card) {
      return next(new ErrorNotFound('Карточка не найдена'));
    }
    if (card.owner.toString() !== req.user._id) {
      return next(new ForbiddenError('Данную карточку удалить невозможно'));
    }
    return res.status(200).send({ card });
  } catch (err) {
    if (err.name === 'CastError') {
      return next(new ErrorBadRequest('Некорректные данные запроса'));
    }
    return next(new ErrorServer('Ошибка на сервере'));
  }
};

//   Card.findByIdAndDelete(req.params.cardId)
//     .then((card) => {
//       if (!card) {
//         return res
//           .status(NOT_FOUND_ERROR)
//           .send({ message: 'Карточка не найдена' });
//       }
//       return res.send({ card });
//     })
//     .catch((err) => {
//       if (err.name === 'CastError') {
//         return res
//           .status(DATA_ERROR_CODE)
//           .send({ message: 'Ошибка валидации. Карточка не найдена' });
//       }
//       return res
//         .status(SERVER_ERROR_CODE)
//         .send({ message: 'Произошла ошибка на сервере' });
//     });
// };

/* Доделываем отсюда */

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true, ranValidators: true },
  )
    .then((card) => {
      if (card) {
        return res.send({ card });
      }
      return next(new ErrorNotFound('Карточка не найдена'));
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        return next(new ErrorBadRequest('Данные переданы некорректно'));
      }
      return next(new ErrorServer('Ошибка на сервере'));
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true, ranValidators: true },
  )
    .then((card) => {
      if (card) {
        return res.send({ card });
      }
      return next(new ErrorNotFound('Карточка не найдена'));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new ErrorBadRequest('Данные переданы некорректно'));
      }
      return next(new ErrorServer('Ошибка на сервере'));
    });
};
