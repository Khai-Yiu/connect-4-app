import { Meta, StoryObj } from '@storybook/react';
import SavedGame from '@/connect-4-ui/SavedGame';
import { action } from '@storybook/addon-actions';
import { v4 as uuidv4 } from 'uuid';

const meta: Meta<typeof SavedGame> = {
    component: SavedGame
};

export default meta;

type Story = StoryObj<typeof SavedGame>;

export const TheOneWithDefaults: Story = {
    render: () => <SavedGame gameId={uuidv4()} savedDate={new Date()} />
};

export const TheOneWithALoadClick: Story = {
    render: () => (
        <SavedGame
            gameId={uuidv4()}
            savedDate={new Date()}
            handleLoadGame={action('Clicked here')}
        />
    )
};
