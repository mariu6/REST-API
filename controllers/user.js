const models = require('../models');
const config = require('../config/config');
const utils = require('../utils');
const jwt = require('../utils/jwt');

module.exports = {
    get: (req, res, next) => {
        models.User.findById(req.query.id)         // req.query.id - за да върне само посочения потребител
            .then((user) => res.send(user))
            .catch(next)
    },

    post: {
        register: (req, res, next) => {
            const { username, password } = req.body;
            console.log(username, password);
            models.User.create({ username, password })
                .then((createdUser) => {
                    // за да се логне още при регистрацията, създавам токен и го пращам в хедъра на респонса (или в куки, но хедъра е предпочетен от Валентин)
                    const token = utils.jwt.createToken({ id: createdUser._id });
                    // res.cookie(config.authCookieName, token).send(createdUser);    // така се праща куки като респонс към браузъра
                    return res.header("Authorization", token).send(createdUser);             // а така се праща към хедър 
                })
                .catch(next)
        },

        verifyLogin: (req, res, next) => {     // проверка на всеки рефреш на браузъра (или раут, според както е направен фронтенда) дали юзера е логиннат
            const token = req.headers.authorization || '';

            Promise.all([ jwt.verifyToken(token), models.TokenBlacklist.findOne({ token }) ])
                .then(([data, blacklistToken]) => {
                    if (blacklistToken) { return Promise.reject(new Error('blacklisted token')) }

                    models.User.findById(data.id)
                        .then((user) => {
                            return res.send({
                                status: true,
                                user
                            });
                        });
                })
                .catch(err => {

                    if (['token expired', 'blacklisted token', 'jwt must be provided'].includes(err.message)) {
                        res.status(401).send('UNAUTHORIZED!');
                        return;
                    }

                    res.send({
                        status: false
                    });
                })
        },

        login: (req, res, next) => {
            const { username, password } = req.body;
            models.User.findOne({ username })
                .then((user) => Promise.all([user, user.matchPassword(password)]))
                .then(([user, match]) => {
                    if (!match) {
                        res.status(401).send('Invalid password');
                        return;
                    }

                    const token = utils.jwt.createToken({ id: user._id });
                    // res.cookie(config.authCookieName, token).send(user);    // така се праща куки като респонс към браузъра
                    res.header("Authorization", token).send(user);             // а така се праща хедър  
                })
                .catch(next);
        },

        logout: (req, res, next) => {
            const token = req.cookies[config.authCookieName];
            console.log('-'.repeat(100));
            console.log(token);
            console.log('-'.repeat(100));
            models.TokenBlacklist.create({ token })
                .then(() => {
                    res.clearCookie(config.authCookieName).send('Logout successfully!');
                })
                .catch(next);
        }
    },

    put: (req, res, next) => {
        const id = req.params.id;
        const { username, password } = req.body;
        models.User.update({ _id: id }, { username, password })
            .then((updatedUser) => res.send(updatedUser))
            .catch(next)
    },

    delete: (req, res, next) => {
        const id = req.params.id;
        models.User.deleteOne({ _id: id })
            .then((removedUser) => res.send(removedUser))
            .catch(next)
    }
};