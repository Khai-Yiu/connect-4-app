'use client';

import SignupForm from '@/components/SignupForm';
import { useRouter } from 'next/navigation';

const signupHandler = async (signupDetails) => {};

const SignupPage = () => {
    const router = useRouter();

    const loginRedirectHandler = async () => router.push('/login');

    return <SignupForm redirectToLoginHandler={loginRedirectHandler} />;
};

export default SignupPage;
