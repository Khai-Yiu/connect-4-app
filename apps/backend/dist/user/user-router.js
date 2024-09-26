"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validate_user_signup_request_body_1 = __importDefault(require("@/user/validate-user-signup-request-body"));
const jose_1 = require("jose");
const userDetailsRequestHandlerFactory = (userService, privateKey) => async (req, res, next) => {
    if (!res.locals.claims.email) {
        res.status(401).send({
            errors: ['You must be logged in to view your user details.']
        });
    }
    else {
        const { email } = req.body;
        const userDetails = await userService.getUserDetails(email);
        res.status(200).send(userDetails);
    }
    next();
};
const loginRequestHandlerFactory = (userService, publicKey, authority) => {
    return async (req, res, next) => {
        await userService
            .authenticate({
            email: req.body.username,
            password: req.body.password
        })
            .then(async () => {
            const username = req.body.username;
            const jwt = await new jose_1.EncryptJWT({
                username,
                roles: []
            })
                .setProtectedHeader({
                alg: 'RSA-OAEP-256',
                typ: 'JWT',
                enc: 'A256GCM'
            })
                .setIssuer('connect4-http-server')
                .setIssuedAt()
                .setExpirationTime('1 day from now')
                .setNotBefore('0 sec from now')
                .setSubject(username)
                .encrypt(publicKey);
            res.setHeader('Authorization', `Bearer ${jwt}`).send({
                links: { notifications: `${authority}/notification` }
            });
        })
            .catch(() => res.status(403).send({ errors: ['Login attempt failed.'] }));
        next();
    };
};
const registerRequestHandlerFactory = (userService) => async (req, res, next) => {
    const { isValid, errors } = (0, validate_user_signup_request_body_1.default)(req.body);
    if (!isValid) {
        res.status(403).send({ errors });
    }
    const { firstName, lastName, email, password } = req.body;
    await userService
        .create({ firstName, lastName, email, password })
        .then((user) => res.status(201).send(user))
        .catch((error) => res.status(403).send({ errors: [error.message] }))
        .catch(next);
};
const userRouterFactory = (userService, keySet, authority) => {
    const userRouter = express_1.default.Router();
    userRouter.get('/', userDetailsRequestHandlerFactory(userService, keySet.privateKey));
    userRouter.post('/signup', registerRequestHandlerFactory(userService));
    userRouter.post('/login', loginRequestHandlerFactory(userService, keySet.publicKey, authority));
    return userRouter;
};
exports.default = userRouterFactory;
