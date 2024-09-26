import styled from 'styled-components';

export type RoundProps = {
    roundNumber: number;
};

const StyledRoundNumber = styled.div`
    text-align: center;
    font-family: monospace;
    font-size: 1.5rem;
    background-color: #38598b;
    color: white;
    border-radius: 16px 16px 0 0;
    border: 3px solid cyan;
    border-bottom: none;
    width: 100%;
    padding: 12px 0;
`;

export const Round = ({ roundNumber }: RoundProps) => (
    <StyledRoundNumber>{`Round: ${roundNumber}`}</StyledRoundNumber>
);

Round.defaultProps = {
    roundNumber: 1
};
