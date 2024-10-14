import type { Metadata } from 'next';
import '@/app/globals.css';

export const metadata: Metadata = {
    title: 'Signup',
    description: 'Signup form'
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <body>{children}</body>;
}
