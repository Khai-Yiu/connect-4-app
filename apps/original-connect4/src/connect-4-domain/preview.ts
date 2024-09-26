import type { Preview } from '@storybook/react';
import { createGlobalStyle } from 'styled-components';
import { lightTheme, darkTheme } from '@/themes';
import { withThemeFromJSXProvider } from '@storybook/addon-themes';

const GlobalStyles = createGlobalStyle`
  body {
    font-family: "Nunito Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  }
`;

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i
            }
        }
    }
};

export const decorators = [
    withThemeFromJSXProvider({
        themes: {
            light: lightTheme,
            dark: darkTheme
        },
        GlobalStyles // Adds your GlobalStyle component to all stories
    })
];

export default preview;
