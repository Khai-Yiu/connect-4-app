import { MouseEvent, useState, ChangeEvent } from 'react';
import { ClipLoader } from 'react-spinners';

enum LoginState {
    IDLE = 'IDLE',
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED'
}

export type LoginDetails = {
    email: string;
    password: string;
};

type ValidationResult = {
    isValid: boolean;
    error?: string;
};

type LoginResponse = {
    isSuccessful: boolean;
    message: string;
};

export type LoginHandler = (
    loginDetails: LoginDetails
) => Promise<LoginResponse>;

type LoginFormProps = {
    loginHandler?: LoginHandler;
    redirectToSignupHandler?: () => Promise<void>;
};

const resolveFormInputStyle = (loginState: LoginState): string =>
    `block w-full rounded-md border-0 py-1.5 pl-4 pr-7 text-gray ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none ${loginState === LoginState.SUCCESS || loginState === LoginState.PENDING ? 'opacity-30' : 'focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-gray-700'}`;

const resolveLoginButtonStyle = (loginState: LoginState): string =>
    `flex flex-col rounded-md text-white max-w-fit font-bold py-1 px-3 bg-[#A2A8D3] ${loginState === LoginState.SUCCESS ? 'opacity-30' : 'hover:bg-[#7E8DBB]'} focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-gray-700`;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validateFields = ({
    email,
    password
}: LoginDetails): ValidationResult => {
    if (!email && !password) {
        return {
            isValid: false,
            error: 'All fields are required.'
        };
    }

    if (!email.match(emailRegex)) {
        return {
            isValid: false,
            error: 'Invalid email address.'
        };
    }

    return {
        isValid: true
    };
};

const LoginForm = ({
    loginHandler = () => Promise.resolve({} as LoginResponse),
    redirectToSignupHandler = () => Promise.resolve()
}: LoginFormProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState({ isError: false, message: '' });
    const [loginState, setLoginState] = useState(LoginState.IDLE);

    const emailChangeHandler = (event: ChangeEvent<HTMLInputElement>) =>
        setEmail(event.target.value);

    const passwordChangeHandler = (event: ChangeEvent<HTMLInputElement>) =>
        setPassword(event.target.value);

    return (
        <div className="border border-gray-300 rounded-md p-6 max-w-md mx-auto">
            <form className="flex flex-col items-center gap-4">
                <div className="flex flex-col">
                    <input
                        type="email"
                        name="email"
                        onChange={emailChangeHandler}
                        placeholder="Email"
                        required
                        className={resolveFormInputStyle(loginState)}
                        readOnly={
                            loginState === LoginState.PENDING ||
                            loginState === LoginState.SUCCESS
                        }
                    />
                </div>
                <div className="flex flex-col">
                    <input
                        type="password"
                        name="password"
                        onChange={passwordChangeHandler}
                        placeholder="Password"
                        required
                        className={resolveFormInputStyle(loginState)}
                        readOnly={
                            loginState === LoginState.PENDING ||
                            loginState === LoginState.SUCCESS
                        }
                    />
                </div>
                <Message {...message} />
                {loginState === LoginState.PENDING ? (
                    <ClipLoader />
                ) : (
                    <button
                        type="submit"
                        className={resolveLoginButtonStyle(loginState)}
                        onClick={async (event: MouseEvent) => {
                            event.preventDefault();
                            if (loginState === LoginState.SUCCESS) return;

                            const { isValid, error } = validateFields({
                                email,
                                password
                            });

                            if (!isValid) {
                                setLoginState(LoginState.FAILED);
                                setMessage({
                                    isError: true,
                                    message: error!
                                });

                                return;
                            }

                            setLoginState(LoginState.PENDING);

                            try {
                                const { isSuccessful, message } =
                                    await loginHandler({
                                        email,
                                        password
                                    });

                                if (isSuccessful) {
                                    setLoginState(LoginState.SUCCESS);
                                    setMessage({ isError: false, message });
                                } else {
                                    setLoginState(LoginState.FAILED);
                                    setMessage({ isError: true, message });
                                }
                            } catch (error) {
                                const { message } = error as LoginResponse;
                                setLoginState(LoginState.FAILED);
                                setMessage({ isError: true, message });
                            }
                        }}
                    >
                        Login
                    </button>
                )}
                <div className="flex flex-col">
                    <a
                        className="text-blue-500 hover:underline"
                        onClick={async (event: MouseEvent) => {
                            event.preventDefault();
                            await redirectToSignupHandler();
                        }}
                    >
                        {"Don't have an account? Sign up here."}
                    </a>
                </div>
            </form>
        </div>
    );
};

type MessageProps = {
    isError: boolean;
    message: string;
};

const Message = ({ isError, message }: MessageProps) => (
    <span
        className={`flex items-center font-medium tracking-wide ${isError ? 'text-red-500' : 'text-green-500'} text-xs h-4`}
    >
        {message}
    </span>
);

export default LoginForm;
