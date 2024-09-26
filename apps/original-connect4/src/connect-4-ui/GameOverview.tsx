import styled from 'styled-components';
import {
    PlayerRoundOverviews,
    PlayerRoundOverviewsProps
} from '@/connect-4-ui/PlayerRoundOverviews';
import { Round, RoundProps } from '@/connect-4-ui/Round';
import { Status } from '@/connect-4-ui/Status';
import { GameStatus } from '@/connect-4-domain/game-types';

export type GameOverviewProps = {
    round: RoundProps;
    playerRoundOverviews: PlayerRoundOverviewsProps;
    status: GameStatus;
};

const StyledWrapper = styled.div`
    display: flex;
    flex-direction: column;
`;

export const GameOverview = ({
    round,
    playerRoundOverviews,
    status
}: GameOverviewProps) => (
    <StyledWrapper>
        <Round {...round} />
        <PlayerRoundOverviews {...playerRoundOverviews} />
        <Status status={status} />
    </StyledWrapper>
);
