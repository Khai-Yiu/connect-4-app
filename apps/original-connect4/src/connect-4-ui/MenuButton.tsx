import styled from 'styled-components';

export type MenuButtonProps = {
    text: string;
    onClick?: React.MouseEventHandler;
};

const StyledMenuButton = styled.button`
    font-size: 1.6rem;
    width: fit-content;
    background-color: inherit;
    color: white;
    font-family: monospace;
    cursor: pointer;
    outline: none;
    border: none;
    padding: 0 20px;
    transition: background 0.8s;

    &:hover {
        background: #a2a8d3;
    }

    &:active {
        background-color: #408ed0;
        background-size: 100%;
        transition: background 0s;
    }
`;

const MenuButton = ({ text, onClick }: MenuButtonProps) => (
    <StyledMenuButton onClick={onClick}>{text}</StyledMenuButton>
);

export default MenuButton;
