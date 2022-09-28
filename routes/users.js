const userRouter = require('express').Router();

const {
  createUser, getUsers, getUserId, editUserProfile, updateUserAvatar,
} = require('../controllers/users');

userRouter.post('/', createUser);
userRouter.get('/', getUsers);
userRouter.get('/:userId', getUserId);
userRouter.patch('/me', editUserProfile);
userRouter.patch('/me/avatar', updateUserAvatar);

module.exports = userRouter;
