import { KeyLike } from 'jose';

export type Uuid = `${string}-${string}-${string}-${string}-${string}`;
export type Stage = 'DEV' | 'TEST' | 'PRODUCTION';
export type JwtPublicKey = KeyLike;
export type JwtPrivateKey = KeyLike;
export type KeySet = {
    publicKey: JwtPublicKey;
    privateKey: JwtPrivateKey;
};

declare namespace NodeJS {
    interface ProcessEnv {
        STAGE: Stage;
        PORT: number;
        JWT_PUBLIC_KEY: KeyLike;
        JWT_PRIVATE_KEY: KeyLike;
    }
}
