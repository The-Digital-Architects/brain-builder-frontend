import React from 'react';
import Header from '../common/header';
import '../css/App.css';
import { Flex, Box } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import { RocketIcon, Pencil2Icon, Link2Icon } from '@radix-ui/react-icons';
import { ChallengeButton, LevelHeading, GridBox } from './levelComponents';
import Readme from '../readme';
import Level from './level';

function GettingStarted() {
    return (
        <Box style={{ border: "2px solid", borderColor: "var(--slate-8)", borderRadius: "var(--radius-3)", padding: '10px 24px' }}>
            <LevelHeading level={-1} name="Getting Started" />
            <GridBox>
                <ChallengeButton link="tutorial" label="Tutorial" Icon={RocketIcon} active={true} />
                <ChallengeButton link="custom11" label="The Perceptron 1" Icon={RocketIcon} active={true} />
            </GridBox>
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

// Function to store progressData in a cookie
function storeProgress(progressData) {
    const serializedData = encodeURIComponent(JSON.stringify(progressData));
    document.cookie = `progressData=${serializedData};path=/;max-age=31536000`; // Expires in 1 year
}

// Function to retrieve progressData from a cookie
function getProgress() {
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('progressData='))
        ?.split('=')[1];
return cookieValue ? JSON.parse(decodeURIComponent(cookieValue)) : null;
}

class StartPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tasksByLevel: this.groupByIds(props.taskIds),
            quizzesByLevel: this.groupByIds(props.quizIds),
            introsByLevel: this.groupByIds(props.introIds),
            showContent: Array(props.levelNames.length).fill(false),
            currentSlide: 0,
            progressData: null,
        };
    }

    groupByIds(ids) {
        return ids.reduce((acc, id) => {
            const level = Math.floor(id / 10);
            const challenge = id % 10;
            if (!acc[level]) {
                acc[level] = [];
            }
            acc[level].push(challenge);
            return acc;
        }, {});
    }

    initializeProgressData(tasksByLevel, quizzesByLevel, introsByLevel) {
        const progressData = {
            challenges: {},
            quizzes: {},
            intros: {}
        };
    
        // Initialize challenges and quizzes with false
        ['challenges', 'quizzes'].forEach(type => {
            const byLevel = type === 'challenges' ? tasksByLevel : quizzesByLevel;
            Object.keys(byLevel).forEach(level => {
                progressData[type][level] = byLevel[level].map(() => false);
            });
        });
    
        // Initialize intros with false, except the first intro set to true
        Object.keys(introsByLevel).forEach(level => {
            progressData.intros[level] = introsByLevel[level].map((intro, index) => index === 0);
        });
    
        return progressData;
    }

    componentDidMount() {
        const progressData = getProgress();
        if (progressData) {
            this.setState({ progressData });
        } else {
            this.setState({ progressData: this.initializeProgressData(this.state.tasksByLevel, this.state.quizzesByLevel, this.state.introsByLevel) });
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.taskIds !== prevProps.taskIds || this.props.quizIds !== prevProps.quizIds || this.props.introIds !== prevProps.introIds) {
            this.setState({
                tasksByLevel: this.groupByIds(this.props.taskIds),
                quizzesByLevel: this.groupByIds(this.props.quizIds),
                introsByLevel: this.groupByIds(this.props.introIds),
            });
        }
    }

    handleShowContent = (index, expand) => {
        this.setState({
            showContent: this.state.showContent.map((value, i) => 
                i === index ? expand : (expand ? false : value)
            )
        });
    };

    render () { return(
    <div>
        <Header showHomeButton={false} />
        <Flex direction='row' gap='3' style={{padding:'10px 10px', alignItems: 'flex-start' }}>

            <Flex direction='column' gap='3' style={{ flex:1 }}>

                <GettingStarted />

                {Object.entries(this.state.tasksByLevel).map(([level, challenges]) => (
                    <Level key={level} level={level} levelNames={this.props.levelNames} taskNames={this.props.taskNames} introData={this.props.introData} quizData={this.props.quizData} introsByLevel={this.state.introsByLevel} quizzesByLevel={this.state.quizzesByLevel} challenges={challenges} showContent={this.state.showContent[level-1]} handleShowContent={this.handleShowContent} progressData={this.state.progressData} />
                ))} 

                <WrappingUp />

            </Flex>

            <Flex direction='column' gap='3' style={{ flex: 1 }}>
                <ReadmeBox />
            </Flex>

        </Flex>
    </div>
    )}
}

export default StartPage;