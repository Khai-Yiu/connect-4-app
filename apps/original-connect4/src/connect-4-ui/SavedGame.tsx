import { GameUuid } from '@/connect-4-domain/game-types';
import styled from 'styled-components';

type SavedGameProps = {
    gameId: GameUuid;
    savedDate: Date;
    handleLoadGame?: (gameId: GameUuid) => void;
    handleDeleteGame?: (gameId: GameUuid) => void;
};

const StyledSavedGame = styled.div`
    border: 2px solid white;
    padding: 20px;
    background-color: lightblue;
    font-family: monospace;
    width: 90%;
    margin: 10px;
    border-radius: 5px;
`;

const StyledLoadButton = styled.button`
    margin-top: -5px;
    background-color: cyan;
    font-weight: bold;
    border: 2px solid white;
    border-radius: 5px;
    cursor: pointer;
`;

const StyledDeleteButton = styled.button`
    background-color: red;
    font-weight: bold;
    border: 2px solid white;
    border-radius: 5px;
    cursor: pointer;
`;

const StyledButtonWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
`;

const StyledWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 0 0 20px 0;
`;

const StyledText = styled.p`
    flex-wrap: wrap;
    font-weight: bold;
    font-size: 1rem;
`;

const SavedGame = ({
    gameId,
    savedDate,
    handleLoadGame = () => {},
    handleDeleteGame = () => {}
}: SavedGameProps) => {
    return (
        <StyledSavedGame>
            <StyledWrapper>
                <StyledText>{`Game ID: ${gameId}`}</StyledText>
                <StyledButtonWrapper>
                    <StyledLoadButton onClick={() => handleLoadGame(gameId)}>
                        Load
                    </StyledLoadButton>
                    <StyledDeleteButton
                        onClick={() => handleDeleteGame(gameId)}
                    >
                        Delete
                    </StyledDeleteButton>
                </StyledButtonWrapper>
            </StyledWrapper>
            <StyledText>{`Date saved: ${savedDate.toString()}`}</StyledText>
        </StyledSavedGame>
    );
};

export default SavedGame;
