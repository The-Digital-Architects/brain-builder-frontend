import React from 'react';
import Header from './common/header';
import './css/App.css';
import { Flex, Box, Heading, Button } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import { RocketIcon, DrawingPinIcon, Pencil2Icon, Link2Icon, CodeIcon } from '@radix-ui/react-icons';
import { Link } from 'react-router-dom';
import ChallengeButton from './common/challengeButton';
import Readme from './readme';
import Level from './level';

function GettingStarted() {
    return (
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
    );
}

function WrappingUp() {
    return (
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
    );
}

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

                <GettingStarted />

                {Object.entries(tasksByLevel).map(([level, challenges]) => (
                    <Level key={level} level={level} levelNames={levelNames} taskNames={taskNames} introData={introData} quizData={quizData} introsByLevel={introsByLevel} quizzesByLevel={quizzesByLevel} challenges={challenges} />
                ))} 

                <WrappingUp />

            </Flex>

            <Flex direction='column' gap='3' style={{ flex: 1 }}>
                <Box style={{ flex: 1, border: "2px solid", borderColor: "var(--slate-8)", borderRadius: "var(--radius-3)", padding: '10px 30px' }}>
                    <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:7 }}>&gt;_Readme</Heading>
                    <Box>
                        <Readme file="readme"/>
                    </Box>
                </Box>
            </Flex>

        </Flex>
    </div>
  );
}

export default StartPage;