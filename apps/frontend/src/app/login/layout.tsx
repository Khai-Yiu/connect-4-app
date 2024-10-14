import type { Metadata } from 'next';
import '@/app/globals.css';

export const metadata: Metadata = {
    title: 'Login',
    description: 'Login form'
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <body>{children}</body>;
}
