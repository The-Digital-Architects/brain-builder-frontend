import React from 'react';
import { Box, Heading } from '@radix-ui/themes';
import backgroundImage from '../images/MontyPython404.jpg';


/**
 * Renders a component for displaying a 404 page.
 *
 * @returns {JSX.Element} The JSX element representing the 404 page.
 */
function NotFound() {

    return (
        <main aria-label="Page not found" style={{ 
            overflow: 'hidden', 
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover', // Cover the entire area
            backgroundPosition: 'top left', // Align the image to the top left
            width: '100vw',
            height: '100vh',
            justifyContent: 'center', 
            alignItems: 'center',
            display: 'flex', // Ensure content is centered
        }}>
            <Box style={{ textAlign: 'center', color: 'white', backgroundColor: 'transparent' }}>
                <Heading style={{ fontSize:90 }}>404</Heading>
                <p style={{ fontSize:48 }}>Page not found : ( </p>
            </Box>
        </main>
    );
}

export default NotFound;