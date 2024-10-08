import SignupForm, { SignupHandler } from '@/components/SignupForm';
import { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within } from '@storybook/test';

const meta: Meta<typeof SignupForm> = {
    component: SignupForm
};

export default meta;

type Story = StoryObj<typeof SignupForm>;

export const TheOneWithDefaults: Story = {};
export const TheOneWithASignupHandler: Story = {
    args: {
        signupHandler: fn((signupDetails) => signupDetails)
    }
};
export const TheOneWithARedirectToLoginLink: Story = {
    args: {
        redirectToLoginHandler: fn(() => {})
    }
};

const fillOutSignupFormCorrectly = async (
    canvas: ReturnType<typeof within>
) => {
    const firstNameInput = canvas.getByPlaceholderText('First name');
    const lastNameInput = canvas.getByPlaceholderText('Surname');
    const emailInput = canvas.getByPlaceholderText('Email');
    const passwordInput = canvas.getByPlaceholderText('Password');
    await userEvent.type(firstNameInput, 'Matt');
    await userEvent.type(lastNameInput, 'Zuf');
    await userEvent.type(emailInput, 'player1@gmail.com');
    await userEvent.type(passwordInput, 'Hello123');
};

export const TheOneWithASignupInProgress: Story = {
    args: {
        signupHandler: fn<SignupHandler>(() => new Promise(() => {}))
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await fillOutSignupFormCorrectly(canvas);
        const signupButton = canvas.getByRole('button');
        await userEvent.click(signupButton);
    }
};

export const TheOneWithAFailedSignup: Story = {
    args: {
        signupHandler: fn(() =>
            Promise.reject({ isSuccessful: false, message: 'Signup failed.' })
        )
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await fillOutSignupFormCorrectly(canvas);
        const signupButton = canvas.getByRole('button');
        await userEvent.click(signupButton);
    }
};

export const TheOneWithASuccessfulSignup: Story = {
    args: {
        signupHandler: fn(() =>
            Promise.resolve({
                isSuccessful: true,
                message: 'Signup successful.'
            })
        )
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await fillOutSignupFormCorrectly(canvas);
        const signupButton = canvas.getByRole('button');
        await userEvent.click(signupButton);
    }
};

export const TheOneWithAnInvalidEmailSubmitted: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const firstNameInput = canvas.getByPlaceholderText('First name');
        const lastNameInput = canvas.getByPlaceholderText('Surname');
        const emailInput = canvas.getByPlaceholderText('Email');
        const passwordInput = canvas.getByPlaceholderText('Password');
        await userEvent.type(firstNameInput, 'Matt');
        await userEvent.type(lastNameInput, 'Zuf');
        await userEvent.type(emailInput, 'invalidEmail');
        await userEvent.type(passwordInput, 'Hello123');
        const signupButton = canvas.getByRole('button');
        await userEvent.click(signupButton);
    }
};
