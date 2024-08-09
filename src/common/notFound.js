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
            <Box style={{ 
                boxShadow: '0 2px 8px var(--slate-a11)', 
                borderRadius: "var(--radius-3)", 
                padding: '60px 100px', 
                textAlign: 'center', 
                color: 'var(--slate-12)', 
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center', // Center items horizontally
                justifyContent: 'center', // Center items vertically
                gap: '20px'
            }}>
                <Heading style={{ fontSize:90 }}>404</Heading>
                <p style={{ fontSize:48, fontWeight:"bold" }}>Page not found : (</p>
            </Box>
        </main>
    );
}

export default NotFound;