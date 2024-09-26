import { Meta, StoryObj } from '@storybook/react';
import LoginForm from '@/components/LoginForm';
import { fn } from '@storybook/test';

const meta: Meta<typeof LoginForm> = {
    component: LoginForm
};

export default meta;

type Story = StoryObj<typeof LoginForm>;

export const TheOneWithDefaults: Story = {};
export const TheOneWithALoginHandler: Story = {
    args: {
        loginHandler: fn((loginDetails) => loginDetails)
    }
};
