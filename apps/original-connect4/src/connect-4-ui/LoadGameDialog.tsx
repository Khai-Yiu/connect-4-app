import styled from 'styled-components';
import SavedGame from './SavedGame';
import React from 'react';

type LoadGameDialogProps = {
    handleClose?: () => void;
    children?:
        | Array<React.ReactElement<typeof SavedGame>>
        | React.ReactElement<typeof SavedGame>;
};

const StyledTopContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`;

const StyledLoadGameDialog = styled.div`
    border: 2px solid white;
    background-color: #a2a8d3;
    padding-top: 10px;
    min-width: 50vw;
    font-family: monospace;
    max-height: 60%;
    min-height: 15vh;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: cyan;
    border-radius: 5px;
    margin-left: 10px;
    margin-right: 10px;
`;

const StyledHeading = styled.h1`
    text-align: center;
    width: fit-content;
    margin-left: 10px;
    color: #38598b;
`;

const StyledCloseButton = styled.button`
    width: 40px;
    height: 40px;
    margin-right: 10px;
    font-size: 1.5rem;
    color: #38598b;
    font-weight: bold;
    background-color: inherit;
    border: none;
    cursor: pointer;

    &:hover {
        background-color: cyan;
    }
`;
const StyledSavedGames = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
`;

const StyledNoSavedGames = styled.p`
    font-size: 20px;
    color: #38598b;
    font-weight: bold;
`;

const LoadGameDialog = ({ handleClose, children }: LoadGameDialogProps) => {
    return (
        <StyledLoadGameDialog>
            <StyledTopContainer>
                <StyledHeading>Saved Games</StyledHeading>
                <StyledCloseButton onClick={handleClose}>X</StyledCloseButton>
            </StyledTopContainer>
            <StyledSavedGames>
                {React.Children.count(children) ? (
                    children
                ) : (
                    <StyledNoSavedGames>No saved games</StyledNoSavedGames>
                )}
            </StyledSavedGames>
        </StyledLoadGameDialog>
    );
};

export default LoadGameDialog;
