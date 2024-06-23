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

class StartPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tasksByLevel: this.groupByIds(props.taskIds),
            quizzesByLevel: this.groupByIds(props.quizIds),
            introsByLevel: this.groupByIds(props.introIds),
            showContent: Array(props.levelNames.length).fill(false),
            printedContent: '',
            currentSlide: 0,
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

    goToSlide = (index) => {
    this.setState({ currentSlide: index });
    console.log("Going to slide " + index)
    };

    handleShowContent = (index, expand) => {
    if (expand) {
        //set showContent[index] to true hence expand the content
        this.setState({ showContent: this.state.showContent.map((value, i) => i === index ? true : false) });
    } else {
        //set showContent[index] to false hence collapse the content
        this.setState({ showContent: this.state.showContent.map((value, i) => i === index ? false : value) });
    }
    };

    render () { return(
    <div>
        <Header />
        <Flex direction='row' gap='3' style={{padding:'10px 10px', alignItems: 'flex-start' }}>

            <Flex direction='column' gap='3' style={{ flex:1 }}>

                <GettingStarted />

                {Object.entries(this.state.tasksByLevel).map(([level, challenges]) => (
                    <div onClick={this.state.showContent[level] ? () => this.handleShowContent(level, false) : () => this.handleShowContent(level, true)}>
                        <Level key={level} level={level} levelNames={this.props.levelNames} taskNames={this.props.taskNames} introData={this.props.introData} quizData={this.props.quizData} introsByLevel={this.state.introsByLevel} quizzesByLevel={this.state.quizzesByLevel } challenges={challenges} showContent={this.state.showContent[level]} />
                    </div>
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
    )}
}

export default StartPage;