import { NextRequest, NextResponse } from 'next/server';

export const config = {
    matcher: '/'
};

export default function authentication(request: NextRequest) {
    if (request.cookies.get('token')?.value) {
        return NextResponse.redirect(new URL('/home', request.url));
    } else {
        return NextResponse.redirect(new URL('/login', request.url));
    }
}
