import styled from 'styled-components';
import { GameStatus } from '@/connect-4-domain/game-types';

export type StatusProps = {
    status: GameStatus;
};

const StyledStatus = styled.div`
    font-family: monospace;
    text-align: center;
    font-size: 1.5rem;
    background-color: #38598b;
    color: white;
    border-radius: 0 0 16px 16px;
    border: 3px solid cyan;
    border-top: none;
    width: 100%;
    padding: 12px 0;
`;

export const Status = ({ status }: StatusProps) => {
    let outcome;
    switch (status) {
        case GameStatus.PLAYER_ONE_WIN:
            outcome = 'Player 1 has won!';
            break;
        case GameStatus.PLAYER_TWO_WIN:
            outcome = 'Player 2 has won!';
            break;
        case GameStatus.DRAW:
            outcome = 'Game ended in a tie!';
            break;
        default:
            outcome = 'Game in progress...';
    }

    return <StyledStatus>{outcome}</StyledStatus>;
};
