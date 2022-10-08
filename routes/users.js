const userRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  getUsers, getUserInfo, getUserId, editUserProfile, updateUserAvatar,
} = require('../controllers/users');

userRouter.get('/', getUsers);
userRouter.get('/me', getUserInfo);
// userRouter.patch('/me', editUserProfile);
// userRouter.post('/', createUser);

userRouter.get(
  '/:userId',
  celebrate({ // <--- celebrate middleware
    params: Joi.object().keys({ // <--- Joi validation
      userId: Joi.string().regex(/^[0-9a-f]{24}$/i),
    }),
  }),
  getUserId // <--- controller
);

userRouter.patch(
  '/me',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required().min(2).max(30),
      about: Joi.string().required().min(2).max(30),
    }),
  }),
  editUserProfile
);

userRouter.patch(
  '/me/avatar',
  celebrate({
    body: Joi.object().keys({
      avatar: Joi.string()
        .required()
        .regex(/^(https?:\/\/)?([\da-z.-]+).([a-z.]{2,6})([/\w.-]*)*\/?$/),
    }),
  }),
  updateUserAvatar
);

module.exports = userRouter;
