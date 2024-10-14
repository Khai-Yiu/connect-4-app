'use client';

import LoginForm from '@/components/LoginForm';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
    const router = useRouter();

    const signupRedirectHandler = async () => router.push('/signup');

    return <LoginForm redirectToSignupHandler={signupRedirectHandler} />;
};

export default LoginPage;
