import {
    PlayerRoundOverview,
    PlayerRoundOverviewProps
} from '@/connect-4-ui/PlayerRoundOverview';
import styled from 'styled-components';

export type PlayerRoundOverviewsProps = {
    playerOne: PlayerRoundOverviewProps;
    playerTwo: PlayerRoundOverviewProps;
};

const StyledWrapper = styled.div`
    display: flex;
    border: 3px solid cyan;
    width: 100%;
`;

export const PlayerRoundOverviews = ({
    playerOne,
    playerTwo
}: PlayerRoundOverviewsProps) => (
    <StyledWrapper>
        <PlayerRoundOverview {...playerOne} />
        <PlayerRoundOverview {...playerTwo} />
    </StyledWrapper>
);
