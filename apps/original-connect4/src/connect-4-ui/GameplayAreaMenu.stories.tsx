import GameplayAreaMenu from '@/connect-4-ui/GameplayAreaMenu';
import { Meta, StoryObj } from '@storybook/react';
import MenuButton from '@/connect-4-ui/MenuButton';

const meta: Meta<typeof GameplayAreaMenu> = {
    component: GameplayAreaMenu
};

export default meta;

type Story = StoryObj<typeof GameplayAreaMenu>;

export const TheOneWithDefaults: Story = {
    render: () => <GameplayAreaMenu />
};

export const TheOneWithAButton: Story = {
    render: () => (
        <GameplayAreaMenu>
            <MenuButton text={'Button'} />
        </GameplayAreaMenu>
    )
};

export const TheOneWithMultipleButtons: Story = {
    render: () => (
        <GameplayAreaMenu>
            <MenuButton text={'Button1'} />
            <MenuButton text={'Button2'} />
            <MenuButton text={'Button3'} />
        </GameplayAreaMenu>
    )
};
