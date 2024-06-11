const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (_, args, context) => {
            if (context.user) {
                return User.findOne({ _id: context.user._id })
            }

            throw AuthenticationError;
        }

    },

    Mutation: {
        login: async (_, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                return AuthenticationError;
            }
            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                return AuthenticationError;
            }

            const token = signToken(user);
            return { token, user };
        },

        addUser: async (_, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user };
        },

        saveBook: async (_, args, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: args.bookInfo } },
                    { new: true }
                )
                return updatedUser
            }
            throw AuthenticationError

        },

        removeBook: async (_, args, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user.id },
                    { $pull: { savedBooks: { bookId: args.bookId } } },
                    { new: true }
                )
                return updatedUser
            }
            throw AuthenticationError
        }
    }

}
module.exports = resolvers;