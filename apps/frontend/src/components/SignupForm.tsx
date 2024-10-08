import { MouseEvent, useState, ChangeEvent } from 'react';
import { ClipLoader } from 'react-spinners';

enum SignupState {
    IDLE = 'IDLE',
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED'
}

type SignupDetails = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
};

type ValidationResult = {
    isValid: boolean;
    error?: string;
};

type SignupResponse = {
    isSuccessful: boolean;
    message: string;
};

export type SignupHandler = (
    signupDetails: SignupDetails
) => Promise<SignupResponse>;

type SignupFormProps = {
    signupHandler?: SignupHandler;
    redirectToLoginHandler?: () => void;
};

const resolveFormInputStyle = (signupState: SignupState): string =>
    `block w-full rounded-md border-0 py-1.5 pl-4 pr-7 text-gray ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none ${signupState === SignupState.SUCCESS || signupState === SignupState.PENDING ? 'opacity-30' : 'focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-gray-700'}`;

const resolveSignupButtonStyle = (signupState: SignupState): string =>
    `flex flex-col rounded-md text-white max-w-fit font-bold py-1 px-3 bg-[#A2A8D3] ${signupState === SignupState.SUCCESS ? 'opacity-30' : 'hover:bg-[#7E8DBB]'} focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-gray-700`;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validateFields = ({
    firstName,
    lastName,
    email,
    password
}: SignupDetails): ValidationResult => {
    if (!firstName && !lastName && !email && !password) {
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

const SignupForm = ({
    signupHandler = () => Promise.resolve({} as SignupResponse),
    redirectToLoginHandler = () => {}
}: SignupFormProps) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState({ isError: false, message: '' });
    const [signupState, setSignupState] = useState(SignupState.IDLE);

    const firstNameChangeHandler = (event: ChangeEvent<HTMLInputElement>) =>
        setFirstName(event.target.value);

    const lastNameChangeHandler = (event: ChangeEvent<HTMLInputElement>) =>
        setLastName(event.target.value);

    const emailChangeHandler = (event: ChangeEvent<HTMLInputElement>) =>
        setEmail(event.target.value);

    const passwordChangeHandler = (event: ChangeEvent<HTMLInputElement>) =>
        setPassword(event.target.value);

    return (
        <div className="border border-gray-300 rounded-md p-6 max-w-md mx-auto">
            <form className="flex flex-col items-center gap-4">
                <div className="flex flex-col">
                    <input
                        type="text"
                        name="firstName"
                        placeholder="First name"
                        required
                        onChange={firstNameChangeHandler}
                        className={resolveFormInputStyle(signupState)}
                    />
                </div>
                <div className="flex flex-col">
                    <input
                        type="text"
                        name="lastName"
                        placeholder="Surname"
                        required
                        onChange={lastNameChangeHandler}
                        className={resolveFormInputStyle(signupState)}
                    />
                </div>
                <div className="flex flex-col">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        required
                        onChange={emailChangeHandler}
                        className={resolveFormInputStyle(signupState)}
                    />
                </div>
                <div className="flex flex-col">
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        required
                        onChange={passwordChangeHandler}
                        className={resolveFormInputStyle(signupState)}
                    />
                </div>
                <Message {...message} />
                {signupState === SignupState.PENDING ? (
                    <ClipLoader />
                ) : (
                    <button
                        type="submit"
                        className={resolveSignupButtonStyle(signupState)}
                        onClick={async (event: MouseEvent) => {
                            event.preventDefault();
                            if (signupState === SignupState.SUCCESS) return;

                            const { isValid, error } = validateFields({
                                firstName,
                                lastName,
                                email,
                                password
                            });

                            if (!isValid) {
                                setSignupState(SignupState.FAILED);
                                setMessage({
                                    isError: true,
                                    message: error!
                                });

                                return;
                            }

                            setSignupState(SignupState.PENDING);

                            try {
                                const { isSuccessful, message } =
                                    await signupHandler({
                                        firstName,
                                        lastName,
                                        email,
                                        password
                                    });

                                if (isSuccessful) {
                                    setSignupState(SignupState.SUCCESS);
                                    setMessage({ isError: false, message });
                                } else {
                                    setSignupState(SignupState.FAILED);
                                    setMessage({ isError: true, message });
                                }
                            } catch (error) {
                                const { message } = error as SignupResponse;
                                setSignupState(SignupState.FAILED);
                                setMessage({ isError: true, message });
                            }
                        }}
                    >
                        Sign up
                    </button>
                )}
                <div className="flex flex-col">
                    <a
                        className="text-blue-500 hover:underline"
                        onClick={redirectToLoginHandler}
                    >
                        Already have an account? Log in here.
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

export default SignupForm;
