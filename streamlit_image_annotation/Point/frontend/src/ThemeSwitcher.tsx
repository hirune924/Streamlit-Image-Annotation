import React, { ReactNode } from "react"
import { DarkMode, LightMode, Box } from '@chakra-ui/react'
import { Theme } from 'streamlit-component-lib'


type ContainerProps = {
    children: ReactNode;
    theme: Theme | undefined;
}

const ThemeSwitcher = ({ children, theme }: ContainerProps) => {
    console.log(theme)
    if (theme?.base !== 'light') {
        return (
            <DarkMode>
                <Box bg={theme?.backgroundColor} color={theme?.textColor}>
                    {children}
                </Box>
            </DarkMode>
        );
    } else {
        return (
            <LightMode>
                <Box bg={theme?.backgroundColor} color={theme?.textColor}>
                    {children}
                </Box>
            </LightMode>
        );
    }
}

export default ThemeSwitcher;