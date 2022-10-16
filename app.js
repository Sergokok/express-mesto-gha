/* eslint-disable no-console */
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { celebrate, Joi, errors } = require('celebrate');
const auth = require('./middlewares/auth');
const { createUser, login } = require('./controllers/users');
const ErrorNotFound = require('./errors/ErrorNotFound');
const ErrorServer = require('./errors/ErrorServer');

const { PORT = 3000 } = process.env;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());

app.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      password: Joi.string().required(),
      email: Joi.string().required().email(),
    }),
  }),
  login,
);
app.post(
  '/signup',
  celebrate({ // <--- celebrate middleware
    body: Joi.object().keys({ // <--- Joi middleware
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
      avatar: Joi.string().regex(
        /^(https?:\/\/)?([\da-z.-]+).([a-z.]{2,6})([/\w.-]*)*\/?$/,
      ),
      password: Joi.string().required(),
      email: Joi.string().required().email(),
    }),
  }),
  createUser, // <--- createUser middleware from controllers/users.js
);

app.use(auth);

app.use('/cards', require('./routes/cards'));
app.use('/users', require('./routes/users'));

app.use('*', (req, res, next) => {
  next(new ErrorNotFound('Страница не найдена'));
});

app.use(errors());

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'На сервере произошла ошибка' : err.message;
  res.status(statusCode).send({ message });
  next();
});

// подключаемся к серверу mongo по-новому async await
async function main(reg, res, next) {
  try {
    await mongoose.connect('mongodb://localhost:27017/mestodb', {
      useNewUrlParser: true,
      useUnifiedTopology: false,
    });
    await app.listen(PORT);
  } catch (err) {
    next(new ErrorServer('Ошибка сервера'));
  }
}

main();

// app.use((req, res, next) => {
//   req.user = {
// _id: '66339764ea19a0ac0c6773c3f', // вставьте сюда _id созданного пользователя
//   };
//
//   next();
// });

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use('/cards', require('./routes/cards'));
// app.use('/users', require('./routes/users'));
//
// app.use('/', (req, res) => {
//   res.status(404).send({ message: 'Страница не найдена' });
// });

// mongoose.connect('mongodb://localhost:27017/mestodb', {
//   useNewUrlParser: true,
// });

// app.listen(PORT, () => {
//   console.log(`App listening on port ${PORT}`);
// });
