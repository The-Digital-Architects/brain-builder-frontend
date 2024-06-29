import React, { useState } from 'react';
import { Button } from '@radix-ui/themes';
import { Flex, Box, Heading, IconButton } from '@radix-ui/themes';
import { Link } from 'react-router-dom';
import { styled } from '@stitches/react';
import { CheckCircledIcon } from '@radix-ui/react-icons';
import { RocketIcon, Pencil2Icon, Link2Icon, CopyIcon } from '@radix-ui/react-icons';
import Readme from '../readme';
import * as Progress from '@radix-ui/react-progress';
import '@radix-ui/themes/styles.css';
import '../css/App.css';
const verbalid = require('verbal-id');

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

  const toggleContent = () => handleShowContent(level-1, !showContent);

  const boxStyle = {
    border: "2px solid",
    borderColor: "var(--slate-8)",
    borderRadius: "var(--radius-3)",
    padding: '10px 24px',
    cursor: 'pointer', // Change cursor to pointer
    transition: 'background-color 0.3s', // Smooth transition for background color
    ':hover': {
      backgroundColor: "var(--slate-2)", // Change background color on hover
    }
  };

  return (
      <Box style={boxStyle} onClick={toggleContent} aria-expanded={showContent}>
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

function ProgressBox({progress}) {

  let myId = verbalid.create().replace(/\s/g, '-');
  const [copyFeedback, setCopyFeedback] = useState(myId);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(myId)
      .then(() => {
        setCopyFeedback('Copied!'); // Update feedback message
        setCopySuccess(true); // Indicate copy success
        setTimeout(() => {
          setCopyFeedback({myId}); // Revert after 2 seconds
          setCopySuccess(false); // Reset copy success
        }, 2000);
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
        setCopyFeedback('Error copying text'); // Provide feedback for error
        setTimeout(() => setCopyFeedback({myId}), 2000); // Revert after 2 seconds
      });
  };

  return (
      <Box style={{ border: "2px solid", borderColor: "var(--slate-8)", borderRadius: "var(--radius-3)", padding: '10px 24px'}} >
          <Flex direction='column' gap='1' style={{ justifyContent: 'center', alignItems: 'center' }}>
              <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:10 }}>Your Progress</Heading>
              <Progress.Root className="ProgressRoot" value={progress} style={{ marginBottom:5, width: '100%' }}>
                  <Progress.Indicator
                  className="ProgressIndicator"
                  style={{ transform: `translateX(-${100 - progress}%)` }}
                  />
              </Progress.Root>
              <label style={{paddingTop: 5, fontSize: 'var(--font-size-2)'}}>Copy this code to continue in a different browser</label>
              {/*when you click the text, it should copy the code to the clipboard*/}
              <IconButton variant='outline' size={1} style={{fontSize: 'var(--font-size-2)', color: 'var(--cyan-10)'}} onClick={handleCopy}>{copyFeedback}<CopyIcon/></IconButton>
              {copySuccess && <span style={{fontSize: 'var(--font-size-1)'}} aria-live="polite">Code copied to clipboard</span>}
          </Flex>
      </Box>
  );
}

function GettingStarted({showContent, handleShowContent}) {

  const toggleContent = () => handleShowContent(-1, !showContent);

  return (
      <Box style={{ border: "2px solid",
          borderColor: "var(--slate-8)",
          borderRadius: "var(--radius-3)",
          padding: '10px 24px',
          cursor: 'pointer', // Change cursor to pointer
          transition: 'background-color 0.3s', // Smooth transition for background color
          ':hover': {
            backgroundColor: "var(--slate-2)", // Change background color on hover
          }}}   onClick={toggleContent} >

              <LevelHeading level={-1} name="Getting Started" />
              {showContent && (
                  <GridBox>
                      <ChallengeButton link="tutorial" label="Tutorial" Icon={RocketIcon} active={true} />
                      <ChallengeButton link="custom11" label="The Perceptron 1" Icon={RocketIcon} active={true} />
                  </GridBox>
              )}
      </Box>
  );
}

function WrappingUp() {
  return (
      <Box style={{ border: "2px solid", borderColor: "var(--slate-8)", borderRadius: "var(--radius-3)", padding: '10px 24px' }}>
          <LevelHeading level={-1} name="Wrapping Up" />
          <GridBox>
              <ChallengeButton link="notebookTest" label="Notebook Test" Icon={RocketIcon} active={true} />
              <ChallengeButton link="feedback" label="Give Feedback" Icon={Pencil2Icon} active={true} />
              <ChallengeButton link="links" label="Useful Links" Icon={Link2Icon} active={true} />
          </GridBox>
      </Box>
  );
}

function ReadmeBox() {
  return (
      <Box style={{ flex: 1, border: "2px solid", borderColor: "var(--slate-8)", borderRadius: "var(--radius-3)", padding: '10px 30px' }}>
          <LevelHeading level={-1} name="Readme" />
          <Box>
              <Readme file="readme"/>
          </Box>
      </Box>
  );
}

export { ChallengeButton, OtherButton, LevelBox, LevelHeading, GridBox, ProgressBox, GettingStarted, WrappingUp, ReadmeBox };