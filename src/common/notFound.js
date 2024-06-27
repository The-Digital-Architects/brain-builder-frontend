import React from 'react';
import { Box, Heading } from '@radix-ui/themes';


/**
 * Renders a component for displaying a 404 page.
 *
 * @returns {JSX.Element} The JSX element representing the 404 page.
 */
function NotFound() {
    const isMontyPythonLover = true;
    const verbalid = require('verbal-id');
    const myId = verbalid.create();
    console.log(myId);

    return (
        <Box style={{ 
            overflow: 'hidden', 
            backgroundImage: `url(${isMontyPythonLover ? require('../images/monty-python.jpeg') : ''})`, // Set the image as the background
            backgroundSize: 'cover', // Cover the entire area
            backgroundPosition: 'top left', // Align the image to the top left
            width: '100vw',
            height: '100vh',
            justifyContent: 'center', 
            alignItems: 'center'
        }}>
            <Box style={{ textAlign: 'center', color: 'white', backgroundColor: 'transparent' }}>
                <Heading style={{ fontSize:90 }}>404</Heading>
                {/*<p style={{ fontSize:48 }}>Page not found : ( </p>*/}
                <p style={{ fontSize:48 }}>{myId}</p>
            </Box>
        </Box>
    );
}

export default NotFound;