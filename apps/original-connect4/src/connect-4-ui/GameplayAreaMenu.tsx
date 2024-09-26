import styled from 'styled-components';
import MenuButton from '@/connect-4-ui/MenuButton';

const StyledMenu = styled.menu`
    position: sticky;
    top: 0;
    width: 100%;
    background-color: #38598b;
    min-height: 80px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    border-bottom: 4px solid cyan;

    @media (max-width: 880px) {
        flex-direction: column;
        padding: 0;
    }
`;

const StyledTitle = styled.h1`
    text-align: center;
    color: #e7eaf6;
    font-size: 50px;
    font-family: monospace;
    font-weight: bold;
`;

const StyledChildWrapper = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
`;

const GameplayAreaMenu = ({
    children
}: {
    children?:
        | Array<React.ReactElement<typeof MenuButton>>
        | React.ReactElement<typeof MenuButton>;
}) => {
    return (
        <StyledMenu>
            <StyledTitle>Connect4</StyledTitle>
            <StyledChildWrapper>{children}</StyledChildWrapper>
        </StyledMenu>
    );
};
export default GameplayAreaMenu;
