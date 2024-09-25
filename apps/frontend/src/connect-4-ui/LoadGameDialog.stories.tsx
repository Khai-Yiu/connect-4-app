import { Meta, StoryObj } from '@storybook/react';
import LoadGameDialog from '@/connect-4-ui/LoadGameDialog';
import { action } from '@storybook/addon-actions';
import SavedGame from '@/connect-4-ui/SavedGame';
import { v4 as uuidv4 } from 'uuid';

const meta: Meta<typeof LoadGameDialog> = {
    component: LoadGameDialog
};

export default meta;

type Story = StoryObj<typeof LoadGameDialog>;

export const TheOneWithDefaults: Story = {
    render: () => <LoadGameDialog />
};

export const TheOneWithOnClick: Story = {
    render: () => <LoadGameDialog handleClose={action('Clicked button')} />
};

export const TheOneWithASavedGame: Story = {
    render: () => (
        <LoadGameDialog>
            <SavedGame gameId={uuidv4()} savedDate={new Date()} />
        </LoadGameDialog>
    )
};
