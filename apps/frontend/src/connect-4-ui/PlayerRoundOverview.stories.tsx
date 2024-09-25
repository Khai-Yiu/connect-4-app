import { Meta, StoryObj } from '@storybook/react';
import { PlayerRoundOverview } from '@/connect-4-ui/PlayerRoundOverview';

const meta: Meta<typeof PlayerRoundOverview> = {
    component: PlayerRoundOverview
};

export default meta;

type Story = StoryObj<typeof PlayerRoundOverview>;

export const TheOneWithAPlayerNumber: Story = {
    render: () => (
        <PlayerRoundOverview
            player={2}
            remainingDiscs={10}
            isActiveTurn={true}
            discColour="red"
        />
    )
};

export const TheOneWithAnInactivePlayer: Story = {
    render: () => (
        <PlayerRoundOverview
            player={1}
            remainingDiscs={10}
            isActiveTurn={false}
            discColour="red"
        />
    )
};

export const TheOneWith5RemainingTokens: Story = {
    render: () => (
        <PlayerRoundOverview
            player={1}
            remainingDiscs={5}
            isActiveTurn={true}
            discColour="red"
        />
    )
};

export const TheOneWithAPinkTokenColour: Story = {
    render: () => (
        <PlayerRoundOverview
            player={1}
            remainingDiscs={10}
            isActiveTurn={true}
            discColour="pink"
        />
    )
};
