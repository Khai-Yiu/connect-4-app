var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import validateUserSignupRequestBody from '@/user/validate-user-signup-request-body';
import { EncryptJWT } from 'jose';
const userDetailsRequestHandlerFactory = (userService, privateKey) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!res.locals.claims.email) {
        res.status(401).send({
            errors: ['You must be logged in to view your user details.']
        });
    }
    else {
        const { email } = req.body;
        const userDetails = yield userService.getUserDetails(email);
        res.status(200).send(userDetails);
    }
    next();
});
const loginRequestHandlerFactory = (userService, publicKey, authority) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        yield userService
            .authenticate({
            email: req.body.username,
            password: req.body.password
        })
            .then(() => __awaiter(void 0, void 0, void 0, function* () {
            const username = req.body.username;
            const jwt = yield new EncryptJWT({
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
        }))
            .catch(() => res.status(403).send({ errors: ['Login attempt failed.'] }));
        next();
    });
};
const registerRequestHandlerFactory = (userService) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { isValid, errors } = validateUserSignupRequestBody(req.body);
    if (!isValid) {
        res.status(403).send({ errors });
    }
    const { firstName, lastName, email, password } = req.body;
    yield userService
        .create({ firstName, lastName, email, password })
        .then((user) => res.status(201).send(user))
        .catch((error) => res.status(403).send({ errors: [error.message] }))
        .catch(next);
});
const userRouterFactory = (userService, keySet, authority) => {
    const userRouter = express.Router();
    userRouter.get('/', userDetailsRequestHandlerFactory(userService, keySet.privateKey));
    userRouter.post('/signup', registerRequestHandlerFactory(userService));
    userRouter.post('/login', loginRequestHandlerFactory(userService, keySet.publicKey, authority));
    return userRouter;
};
export default userRouterFactory;
