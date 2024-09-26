import styled from 'styled-components';

export type PlayerRoundOverviewProps = {
    player?: 1 | 2;
    remainingDiscs: number;
    isActiveTurn: boolean;
    discColour: string;
};

const StyledWrapper = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    background-color: #a2a8d3;
    color: white;
    font-size: 0.8rem;
    padding: 10px 20px 10px 20px;
    font-family: monospace;
    gap: 20px;
`;

const StyledContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    height: 2rem;
`;

const StyledText = styled.p`
    font-size: 1rem;
    font-weight: bold;
    text-align: left;
    white-space: normal;
`;

const StyledToken = styled.div<{ $isActiveTurn: boolean; $discColour: string }>`
    background-color: ${({ $isActiveTurn, $discColour }) =>
        $isActiveTurn ? $discColour : 'initial'};
    border: ${({ $isActiveTurn }) =>
        $isActiveTurn ? '3px white dotted' : 'none'};
    border-radius: 50%;
    min-height: 30px;
    min-width: 30px;
    box-sizing: border-box;
    right: 100%;
`;

export const PlayerRoundOverview = ({
    player,
    remainingDiscs,
    isActiveTurn,
    discColour
}: PlayerRoundOverviewProps) => (
    <StyledWrapper>
        <StyledContainer>
            <StyledText>{`Player: ${player}`}</StyledText>
            <StyledToken
                $isActiveTurn={isActiveTurn}
                $discColour={discColour}
            />
        </StyledContainer>
        <StyledText>{`Remaining discs: ${remainingDiscs}`}</StyledText>
    </StyledWrapper>
);
