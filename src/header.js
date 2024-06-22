import React from 'react';
import './App.css';
import { Box, Heading, Grid } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import tu_delft_pic from "./tud_black_new.png";
import { Link, BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function Header() {
  return (
    <div>
        <Box py="2" style={{ backgroundColor: "var(--cyan-10)"}}>
        <Grid columns='3' mt='1'>
            <Box style={{ flex:1 }}/>
            <Link to={window.location.origin} style={{ flex:1, textDecoration: 'none' }}>
            <Heading as='h1' align='center' size='6' style={{ color: 'var(--gray-1)', marginTop: 2, marginBottom: 0, textDecoration: 'none', fontFamily:'monospace, Courier New, Courier' }}><b>brAIn builder</b></Heading>
            </Link>
            <Box align='end' mr='3' style={{ flex:1 }}>
                <Link to="https://www.tudelft.nl/en/" target="_blank" style={{ textDecoration: 'none'}}>
                <img src={tu_delft_pic} alt='Tu Delft Logo' width='auto' height='30'/>
                </Link>
            </Box>
        </Grid>
        </Box>
    </div>
  );
}

export default Header;