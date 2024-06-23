import React, { useState } from 'react';
import { Box, Heading, Flex } from '@radix-ui/themes';
import { Link } from 'react-router-dom';
import ChallengeButton from './common/challengeButton';
import { RocketIcon, DrawingPinIcon, Pencil2Icon } from '@radix-ui/react-icons';

function Level({ level, levelNames, taskNames, introData, quizData, introsByLevel, quizzesByLevel, challenges, showContent, handleShowContent }) {

  return (
    <Box key={level} style={{ border: "2px solid", borderColor: "var(--slate-8)", borderRadius: "var(--radius-3)", padding: '10px 24px' }} onClick={showContent ? () => handleShowContent(level, false) : () => handleShowContent(level, true)}>
        <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:10 }}>&gt;_Level {level} - {levelNames[level-1]}</Heading>
        {showContent && (
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
        )}
    </Box>
  );
}

export default Level;