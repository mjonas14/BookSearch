const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

// Definiting all the resolverrs for the metrics
const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id });
        return userData;
      }
      throw new AuthenticationError("Not logged in");
    },
  },
  Mutation: {
    addUser: async (parent, args) => {
      const newUser = await User.create(args);
      const token = signToken(newUser);

      return { token, newUser };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError(
          "No profile with this email has been found"
        );
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect password!");
      }

      const token = signToken(user);
      return { token, user };
    },
    // { userId, bookData }
    saveBook: async (parent, { input }, context) => {
      if (context.user) {
        const updatedBook = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: input } },
          { new: true, runValidators: true }
        );

        return updatedBook;
      }
      throw new AuthenticationError("You need to be logged in!");
    },
    // { userId, bId }
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const updatedBookStatus = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );

        return updatedBookStatus;
      }
      throw new AuthenticationError("You need to be logged in!");
    },
  },
};

module.exports = resolvers;
