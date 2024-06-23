import React from 'react';
import { RocketIcon, Pencil2Icon } from '@radix-ui/react-icons';
import { ChallengeButton, LevelBox, LevelHeading, GridBox } from './levelComponents';


function Level({ level, levelNames, taskNames, introData, quizData, introsByLevel, quizzesByLevel, challenges, showContent, handleShowContent }) {

  return (
    <LevelBox level={level} showContent={showContent} handleShowContent={handleShowContent}>
        <LevelHeading level={level} name={levelNames[level-1]} />
        {showContent && (
            <GridBox>
                {introsByLevel[level] && introsByLevel[level].map((intro, index) => {
                    const entry = introData.find(entry => entry.intro_id === 10*level+intro);
                    return entry && entry.visibility ? (
                        <ChallengeButton key={`intro${level}${intro}_button`} link={`introduction${level}${intro}`} label="Introduction" Icon={RocketIcon}/>
                    ) : null;
                })}

                {challenges.map((challenge, index) => (
                    <ChallengeButton key={`challenge${level}${challenge}_button`} link={`challenge${level}${challenge}`} label={taskNames[`${level}${challenge}`]} Icon={RocketIcon} />
                ))}

                {quizzesByLevel[level] && quizzesByLevel[level].map((quiz, index) => {
                    const entry = quizData.find(entry => entry.quiz_id === 10*level+quiz);
                    return entry && entry.visibility ? (
                        <ChallengeButton key={`quiz${level}${quiz}_button`} link={`quiz${level}${quiz}`} label="Quiz" Icon={Pencil2Icon} />
                    ) : null;
                })}
            </GridBox>
        )}
    </LevelBox>
  );
}

export default Level;