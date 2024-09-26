import styled from 'styled-components';
import { GameOverview, GameOverviewProps } from '@/connect-4-ui/GameOverview';
import { Board, BoardProps } from '@/connect-4-ui/Board';
import GameplayAreaMenu from '@/connect-4-ui/GameplayAreaMenu';
import MenuButton from '@/connect-4-ui/MenuButton';

export type GameplayAreaProps = {
    activeGame?: {
        gameOverview: GameOverviewProps;
        board: BoardProps;
    };
    onStartGameClick: () => void;
    onResetGameClick: () => void;
    onSaveGameClick: () => void;
    onLoadGameClick: () => void;
};

const StyledGameplayArea = styled.div<{
    $activeGame: GameplayAreaProps['activeGame'];
}>`
    align-items: ${({ $activeGame }) =>
        $activeGame === undefined ? 'center' : 'start'};
    height: fit-content;
`;

const StyledButton = styled.button`
    font-size: 2rem;
    background-color: #a2a8d3;
    color: white;
    padding: 10px 10px;
    border: 5px cyan solid;
    font-family: monospace;
    cursor: pointer;
    border-radius: 8px;

    &:hover {
        border-color: white;
    }

    &:focus,
    &:focus-visible {
        outline: 4px auto -webkit-focus-ring-color;
    }
`;

const StyledBoardWrapper = styled.div`
    margin-top: 1rem;
`;

const StyledTitle = styled.h1`
    font-size: 4rem;
    font-family: monospace;
    color: cyan;
`;

const StyledGameplayWrapper = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
`;

const StyledStartGameWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 80vh;
`;

const StyledGameplayInformation = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1rem;
    margin-left: 30px;
    margin-right: 30px;
    justify-content: center;
`;

export const GameplayArea = ({
    activeGame,
    onStartGameClick = () => {},
    onResetGameClick = () => {},
    onSaveGameClick = () => {},
    onLoadGameClick = () => {}
}: GameplayAreaProps) => (
    <>
        <GameplayAreaMenu>
            <MenuButton text={'Reset'} onClick={onResetGameClick} />
            <MenuButton text={'Save'} onClick={onSaveGameClick} />
            <MenuButton text={'Load'} onClick={onLoadGameClick} />
        </GameplayAreaMenu>
        <StyledGameplayArea $activeGame={activeGame}>
            {activeGame ? (
                <StyledGameplayWrapper>
                    <StyledGameplayInformation>
                        <GameOverview {...activeGame.gameOverview} />
                    </StyledGameplayInformation>
                    <StyledBoardWrapper>
                        <Board {...activeGame.board} />
                    </StyledBoardWrapper>
                </StyledGameplayWrapper>
            ) : (
                <StyledStartGameWrapper>
                    <StyledTitle>Connect4</StyledTitle>
                    <StyledButton onClick={onStartGameClick}>
                        Start Game!
                    </StyledButton>
                </StyledStartGameWrapper>
            )}
        </StyledGameplayArea>
    </>
);
