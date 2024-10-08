import { Meta, StoryObj } from '@storybook/react';
import LoginForm, { LoginHandler } from '@/components/LoginForm';
import { fn } from '@storybook/test';
import { userEvent, within } from '@storybook/test';

const meta: Meta<typeof LoginForm> = {
    component: LoginForm
};

export default meta;

type Story = StoryObj<typeof LoginForm>;

export const TheOneWithDefaults: Story = {};
export const TheOneWithALoginHandler: Story = {
    args: {
        loginHandler: fn((loginDetails) => Promise.resolve(loginDetails))
    }
};
export const TheOneWithARedirectToSignupLink: Story = {
    args: {
        redirectToSignupHandler: fn(() => {})
    }
};

const fillOutLoginFormCorrectly = async (canvas: ReturnType<typeof within>) => {
    const emailInput = canvas.getByPlaceholderText('Email');
    const passwordInput = canvas.getByPlaceholderText('Password');
    await userEvent.type(emailInput, 'player1@gmail.com');
    await userEvent.type(passwordInput, 'Hello123');
};

export const TheOneWithALoginInProgress: Story = {
    args: {
        loginHandler: fn<LoginHandler>(() => new Promise(() => {}))
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await fillOutLoginFormCorrectly(canvas);
        const loginButton = canvas.getByRole('button');
        await userEvent.click(loginButton);
    }
};

export const TheOneWithAFailedLogin: Story = {
    args: {
        loginHandler: fn(() =>
            Promise.reject({ isSuccessful: false, message: 'Login failed.' })
        )
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await fillOutLoginFormCorrectly(canvas);
        const loginButton = canvas.getByRole('button');
        await userEvent.click(loginButton);
    }
};

export const TheOneWithASuccessfulLogin: Story = {
    args: {
        loginHandler: fn(() =>
            Promise.resolve({
                isSuccessful: true,
                message: 'Login successful.'
            })
        )
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await fillOutLoginFormCorrectly(canvas);
        const loginButton = canvas.getByRole('button');
        await userEvent.click(loginButton);
    }
};

export const TheOneWithAnInvalidEmailSubmitted: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const emailInput = canvas.getByPlaceholderText('Email');
        const passwordInput = canvas.getByPlaceholderText('Password');
        await userEvent.type(emailInput, 'invalidEmail');
        await userEvent.type(passwordInput, 'Hello123');
        const loginButton = canvas.getByRole('button');
        await userEvent.click(loginButton);
    }
};
