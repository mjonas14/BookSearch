const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id });
                return userData;
            }
            throw new AuthenticationError('Not logged in');
        }
        },
    Mutation: {
        addUser: async (parent, { username, email, password }) => {
            const newUser = User.create({ username, email, password });
            const token = signToken(newUser);

            return { token, newUser };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('No profile with this email has been found');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect password!');
            }

            const token = signToken(user);
            return { token, user };
        },
        // { userId, bookData }
        saveBook: async (parent, args, context) => {
            const updatedBook = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $addToSet: { savedBooks: args } },
                { new: true, runValidators: true }
            );

            return updatedBook;
        },
        // { userId, bId }
        removeBook: async (parent, args, context) => {
            const updatedBookStatus = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks: { bookId: args.bookId } } },
                { new: true }
            );

            if (!updatedBookStatus) {
                throw new AuthenticationError('Couldn\'t find user with this id!');
            };

            return updatedBookStatus;
        },
    }
};

module.exports = resolvers;