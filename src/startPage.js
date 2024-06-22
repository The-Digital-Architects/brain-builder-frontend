import React from 'react';
import Header from './common/header';
import './css/App.css';
import { Flex, Box, Heading, Button } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import { RocketIcon, DrawingPinIcon, Pencil2Icon, Link2Icon, CodeIcon } from '@radix-ui/react-icons';
import { Link } from 'react-router-dom';
import { styled } from '@stitches/react';
import Readme from './readme';
/*import LevelSection from './LevelSection'; // Component for each level section
import WrappingUp from './WrappingUp'; // Wrapping up section component
import { Router, Routes, Route } from 'react-router-dom';*/

const ChallengeButton = styled(Button, {
  width: 136,   
  height: 84,
  fontSize: 'var(--font-size-2)',
  fontWeight: '500',
  boxShadow: '0 1px 3px var(--slate-a11)'
});


function StartPage({ levelNames, taskNames, introData, quizData, taskIds, quizIds, introIds }) {
    const tasksByLevel = taskIds.reduce((acc, taskId) => {
        const level = Math.floor(taskId / 10);
        const challenge = taskId % 10;
        if (!acc[level]) {
            acc[level] = [];
        }
        acc[level].push(challenge);
        return acc;
    }, {});

    const quizzesByLevel = quizIds.reduce((acc, quizId) => {
        const level = Math.floor(quizId / 10);
        const challenge = quizId % 10;
        if (!acc[level]) {
            acc[level] = [];
        }
        acc[level].push(challenge);
        return acc;
    }, {});

    const introsByLevel = introIds.reduce((acc, introId) => {
        const level = Math.floor(introId / 10);
        const challenge = introId % 10;
        if (!acc[level]) {
            acc[level] = [];
        }
        acc[level].push(challenge);
        return acc;
    }, {});

  return (
    <div>
        <Header />
        <Flex direction='row' gap='3' style={{padding:'10px 10px', alignItems: 'flex-start' }}>
        <Flex direction='column' gap='3' style={{ flex:1 }}>
            <Box style={{ border: "2px solid", borderColor: "var(--slate-8)", borderRadius: "var(--radius-3)", padding: '10px 24px' }}>
            <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:10 }}>&gt;_Get Started</Heading>
            <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(136px, 136px))', gap: '15px', alignItems: 'start', justifyContent: 'start'}}>
            <Link to="tutorial" style={{ color: 'inherit', textDecoration: 'none' }}>
                <ChallengeButton size="1" variant="outline">
                <Flex gap="2" style={{ flexDirection: "column", alignItems: "center"}}>
                    <label>Tutorial</label>
                    <div><RocketIcon width="27" height="27" /></div>
                </Flex>
                </ChallengeButton>
            </Link>
            <Link to="custom11" style={{ color: 'inherit', textDecoration: 'none' }}>
                <ChallengeButton size="1" variant="outline">
                <Flex gap="2" style={{ flexDirection: "column", alignItems: "center"}}>
                    <label>The Perceptron 1</label>
                    <div><RocketIcon width="27" height="27" /></div>
                </Flex>
                </ChallengeButton>
            </Link>  
            </Box>
            </Box>
            {Object.entries(tasksByLevel).map(([level, challenges]) => (
            <Box key={level} style={{ border: "2px solid", borderColor: "var(--slate-8)", borderRadius: "var(--radius-3)", padding: '10px 24px' }}>
                <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:10 }}>&gt;_Level {level} - {levelNames[level-1]}</Heading>
                <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(136px, 136px))', gap: '15px', alignItems: 'start', justifyContent: 'start'}}>
                
                {introsByLevel[level] && introsByLevel[level].map((intro, index) => (
                    <>
                    { introData.find(entry => entry.intro_id === 10*level+intro).visibility &&
                    <Link to={`introduction${level}${intro}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    <ChallengeButton size="1" variant="outline">
                    <Flex gap="2" style={{ flexDirection: "column", alignItems: "center"}}>
                        <label>Key Concepts</label>
                        <div><DrawingPinIcon width="30" height="30" /></div>
                    </Flex>
                    </ChallengeButton>
                </Link>
                    }
                    </>
                ))}
                {challenges.map((challenge, index) => (
                    <Link key={index} to={`challenge${level}${challenge}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    <ChallengeButton size="1" variant="outline">
                        <Flex gap="2" style={{ flexDirection: "column", alignItems: "center"}}>
                        <label>{taskNames[`${level}${challenge}`]}</label>
                        <div><RocketIcon width="27" height="27" /></div>
                        </Flex>
                    </ChallengeButton>
                    </Link>
                ))}

                {quizzesByLevel[level] && quizzesByLevel[level].map((quiz, index) => (
                    <>
                    { quizData.find(entry => entry.quiz_id === 10*level+quiz).visibility &&
                    <Link to={`quiz${level}${quiz}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    <ChallengeButton size="1" variant="outline">
                        <Flex gap="2" style={{ flexDirection: "column", alignItems: "center"}}>
                        <label>Quiz</label>
                        <div><Pencil2Icon width="27" height="27" /></div>
                        </Flex>
                    </ChallengeButton>
                    </Link>
                    }
                    </>
                ))}
                </Box>
            </Box>
            ))} 
            <Box style={{ border: "2px solid", borderColor: "var(--slate-8)", borderRadius: "var(--radius-3)", padding: '10px 24px' }}>
            <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:10 }}>&gt;_Wrapping Up</Heading>
            <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(136px, 136px))', gap: '15px', alignItems: 'start', justifyContent: 'start'}}>
                
                <Link to='notebookTest' style={{ color: 'inherit', textDecoration: 'none' }}>
                <ChallengeButton size="1" variant="outline">
                    <Flex gap="2" style={{ flexDirection: "column", alignItems: "center"}}>
                    <label>Notebook</label>
                    <div><CodeIcon width="27" height="27" /></div>
                    </Flex>
                </ChallengeButton>
                </Link>  
                
                <Link to='feedback' style={{ color: 'inherit', textDecoration: 'none' }}>
                <ChallengeButton size="1" variant="outline">
                    <Flex gap="2" style={{ flexDirection: "column", alignItems: "center"}}>
                    <label>Give Feedback</label>
                    <div><Pencil2Icon width="27" height="27" /></div>
                    </Flex>
                </ChallengeButton>
                </Link>
                
                <Link to='links' style={{ color: 'inherit', textDecoration: 'none' }}>
                <ChallengeButton size="1" variant="outline">
                    <Flex gap="2" style={{ flexDirection: "column", alignItems: "center"}}>
                    <label>Useful Links</label>
                    <div><Link2Icon width="27" height="27" /></div>
                    </Flex>
                </ChallengeButton>
                </Link>  

            </Box>
            </Box>
        </Flex>
        <Flex direction='column' gap='3' style={{ flex: 1 }}>
            <Box style={{ flex: 1, border: "2px solid", borderColor: "var(--slate-8)", borderRadius: "var(--radius-3)", padding: '10px 30px' }}>
            <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:7 }}>&gt;_Readme</Heading>
            <Box>
                <Readme file="Welcome.md"/>
            </Box>
            </Box>
        </Flex>
        </Flex>
    </div>
  );
}

export default StartPage;