import { MouseEvent, useState, ChangeEvent } from 'react';

type LoginDetails = {
    email?: string;
    password?: string;
};

type LoginHandler = (loginDetails: LoginDetails) => unknown;

type LoginFormProps = {
    loginHandler?: LoginHandler;
};

const LoginForm = ({ loginHandler = () => {} }: LoginFormProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const emailChangeHandler = (event: ChangeEvent<HTMLInputElement>) =>
        setEmail(event.target.value);

    const passwordChangeHandler = (event: ChangeEvent<HTMLInputElement>) =>
        setPassword(event.target.value);

    return (
        <form className="flex flex-col items-center gap-4">
            <div className="flex flex-col">
                <label className="decoration-solid">Email:</label>
                <input
                    type="email"
                    className="border-2"
                    onChange={emailChangeHandler}
                    required
                />
            </div>
            <div className="flex flex-col">
                <label className="decoration-solid">Password:</label>
                <input
                    type="password"
                    className="border-2"
                    onChange={passwordChangeHandler}
                    required
                />
            </div>
            <button
                type="submit"
                className="flex flex-col bg-[#38598B] hover:bg-[#7E8DBB] text-white max-w-fit font-bold py-1 px-3"
                onClick={(event: MouseEvent) => {
                    if (email && password) {
                        loginHandler({ email, password });
                    }

                    event.preventDefault();
                }}
            >
                Submit
            </button>
        </form>
    );
};

export default LoginForm;
