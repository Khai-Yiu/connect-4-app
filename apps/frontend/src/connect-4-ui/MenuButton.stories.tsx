import MenuButton from '@/connect-4-ui/MenuButton';
import { action } from '@storybook/addon-actions';
import { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof MenuButton> = {
    component: MenuButton,
    decorators: [
        (Story) => (
            <div style={{ background: 'cyan' }}>
                <Story />
            </div>
        )
    ]
};

export default meta;

type Story = StoryObj<typeof MenuButton>;

export const TheOneWithDefaults: Story = {
    render: () => <MenuButton text={'Default'} />
};

export const TheOneWithOnClick: Story = {
    render: () => (
        <MenuButton text={'Click me'} onClick={action('Clicked cell')} />
    )
};
