import React from 'react';
import { Button } from '@radix-ui/themes';
import { Flex, Box, Heading } from '@radix-ui/themes';
import { Link } from 'react-router-dom';
import { styled } from '@stitches/react';
import { CheckCircledIcon } from '@radix-ui/react-icons';

function ChallengeButton({ link, label, Icon, active, completed }) {
  const buttonStyle = {
    width: 136,
    height: 84,
    fontSize: 'var(--font-size-2)',
    fontWeight: '500',
    boxShadow: '0 1px 3px var(--slate-a11)',
  };

  if (completed) {
    buttonStyle.outline = '2px solid var(--cyan-8)';
  }
  
  return (
      <Link to={link} style={{ color: 'inherit', textDecoration: 'none' }}>
          <Button
            size="1"
            variant="outline"
            disabled={!active}
            style={buttonStyle}
          >
              
            <Flex gap="2" style={{ flexDirection: "column", alignItems: "center" }}>
                <label>{label}</label>
                <div>{Icon ? <Icon width="27" height="27" /> : null}</div>
            </Flex>

          </Button>

          {/*add checkmark icon in bottom right corner if completed*/}
          {completed && <CheckCircledIcon color='green' style={{ position: 'absolute', bottom: 0, right: 0 }} />}
      </Link>
  );
}


function OtherButton({ link, label, active }) {

  const buttonStyle = {
    flex: 1,
    fontSize: 'var(--font-size-2)',
    fontWeight: '500',
    boxShadow: '0 1px 3px var(--slate-a11)',
  };
  
  return (
      <Link to={link} style={{ color: 'inherit', textDecoration: 'none' }}>
          <Button
            size="1"
            variant="outline"
            disabled={!active}
            style={buttonStyle}
          >
          
          <label>{label}</label>

          </Button>
      </Link>
  );
}


function LevelBox({ level, showContent, handleShowContent, children }) {

  const toggleContent = () => handleShowContent(0, !showContent);

  return (
      <Box key={level} style={{ border: "2px solid", borderColor: "var(--slate-8)", borderRadius: "var(--radius-3)", padding: '10px 24px' }} onClick={toggleContent}>
          {children}
      </Box>
  );
}

function LevelHeading({ level, name }) {
  return (
      <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:10 }}>&gt;_{level===-1 ? name : `Week ${level} - ${name}`}</Heading>
  );
}

const GridBox = styled(Box, {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(136px, 136px))',
  gap: '15px',
  alignItems: 'start',
  justifyContent: 'start'
});


export { ChallengeButton, OtherButton, LevelBox, LevelHeading, GridBox };