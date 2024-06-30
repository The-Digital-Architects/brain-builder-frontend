import React from 'react';
import './css/App.css';
import { Theme, Box, Grid, Heading, IconButton, Flex } from '@radix-ui/themes';
import { HomeIcon, PlayIcon } from '@radix-ui/react-icons';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import a11yDark from './code_preview/a11y-dark';
import Header from './common/header';

class NotebookView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            notebook: null,
            currentCell: 0,
            cellContents: [],
        };
        this.ws = new WebSocket(`wss://${this.props.host}/code/${this.props.userId}/`);
    }

    componentDidMount() {
        let notebookUrl 

        // notebookUrl = 'https://raw.githubusercontent.com/Pawel024/brain-builder/laurens/notebooks/' + this.props.notebookId + '.ipynb'  // TODO: change the repo
        notebookUrl = `/api/notebooks/${this.props.notebookPath}/`;

        axios.get(notebookUrl)
            .then(response => {
                this.setState({ notebook: response.data });
                this.setState({ cellContents: response.data.cells.map(cell => cell.source.join('')) });
            })
            .catch(error => {
                console.error('Error loading notebook:', error);
            });

        this.ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        this.ws.onopen = () => {
            console.log('WebSocket connection opened');
        }

        this.ws.onerror = (error) => {
            console.log('WebSocket error: ', error);
        }

        this.ws.onmessage = (event) => {
            console.log('ws message received');  // TODO: display the code output
            const data = JSON.parse(event.data); 
            console.log(data); 
            // try {
            //     const data = JSON.parse(event.data);
            //     if (data.header == "output" && data.notebook_id == this.props.notebookPath) {
            //         alert(data.output)
            //         // TODO: handle the message
            //     }
            // } catch (error) {console.error('Error receiving message:', error);}
        }
    }

    componentWillUnmount() {
        this.ws.close();
    }

    handleClick = (index) => {
        console.log("Clicked cell", index);
        if (this.ws.readyState === this.ws.OPEN && this.state.notebook) {
            this.setState({ currentCell: index });
            const data = {
                header: 'code',
                notebook_id: this.props.notebookPath,
                // code: this.state.notebook.cells[index].source.join(''),
                code: this.state.cellContents[index],
                cell: index,
            };
            try {this.ws.send(JSON.stringify(data));}
            catch (error) {console.error('Error sending message:', error);}
        }
    }

    handleContentChange = (index, newContent) => {
        const newCellContents = this.state.cellContents.slice();
        newCellContents[index] = newContent;
        this.setState({ cellContents: newCellContents });
    }

    render() {
        // this.ws.onmessage = (event) => {
        //     console.log('ws message received');
        //     try {
        //         const data = JSON.parse(event.data);
        //         if (data.header == "output" && data.notebook_id == this.props.notebookPath) {
        //             alert(data.output)
        //             // TODO: handle the message
        //         }
        //     } catch (error) {console.error('Error receiving message:', error);}
        // }

        return(
            <Theme accentColor="cyan" grayColor="slate" panelBackground="solid" radius="large" appearance='light'>
                <Flex direction='column' style={{ alignItems: 'flex-start' }}>
                    <Header showHomeButton={true} />
                    <Flex direction='column' gap='3' style={{padding:'10px 10px', alignItems: 'flex-start' }}>

                        <div className="notebook-view">
                            {this.state.notebook === null && <div>Loading...</div>}
                            {this.state.notebook !== null && this.state.notebook.cells.map((cell, index) => (
                                <Box style={{
                                    border: "2px solid",
                                    borderColor: "var(--slate-8)",
                                    borderRadius: "var(--radius-3)",
                                    padding: '10px 24px',
                                    cursor: 'pointer',
                                }} key={index}>
                                    {cell.cell_type === 'markdown' ? (
                                    <MarkdownCell cell={cell} content={this.state.cellContents[index]} onContentChange={(newContent) => this.handleContentChange(index, newContent)} style={{ margin: '10px' }} />
                                    ) : (cell.cell_type === 'code' && (
                                    <CodeCell cell={cell} content={this.state.cellContents[index]} onContentChange={(newContent) => this.handleContentChange(index, newContent)} handleClick={() => this.handleClick(index)} style={{ margin: '10px' }} />
                                    ))}
                                </Box>
                                ))}
                            </div>
                    </Flex>
                </Flex>
            </Theme>
        )
    }
}

class MarkdownCell extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditing: false,
            newContent: '',
        };
    }

    componentDidMount() {
        this.setState({ newContent: this.props.cell.source.join('') });
    }

    handleClick = () => {
        this.setState({ isEditing: true });
    }

    handleChange = (event) => {
        this.setState({ newContent: event.target.value });
    }

    handleBlur = () => {
        this.setState({ isEditing: false, newContent: this.state.content });
    }

    handleKeyDown = (event) => {
        if (this.state.isEditing && event.key === "Enter") {
            event.preventDefault();
            this.setState({ isEditing: false});
            this.props.onContentChange(this.state.newContent);
        } 
    }

    render() {
        return (
            <div className="markdown-cell" onClick={this.handleClick} >
            {this.state.isEditing ? (
                <textarea value={this.state.newContent} onChange={this.handleChange} onBlur={this.handleBlur} onKeyDown={this.handleKeyDown} />
            ) : (
                <ReactMarkdown>{this.props.content}</ReactMarkdown>
            )}
            </div>
        );
    }
}

class CodeCell extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditing: false,
            newContent: '',
        };
    }

    componentDidMount() {
        this.setState({ newContent: this.props.cell.source.join('') });
    }

    handleChange = (event) => {
        this.setState({ newContent: event.target.value });
    }

    handleBlur = () => {
        this.setState({ isEditing: false, newContent: this.state.content });
    }

    handleKeyDown = (event) => {
        if (this.state.isEditing && event.key === "Enter") {
            event.preventDefault();
            this.setState({ isEditing: false });
            this.props.onContentChange(this.state.newContent);
        } 
    }

    render() {

        return (
            <Flex direction="row" gap="2" className="code-cell" >
                <PlayButton onClick={this.props.handleClick} />
                <div style={{ flex: 2, overflow: 'auto' }} onClick={() => this.setState({ isEditing: true })} >
                {this.state.isEditing ? (
                <textarea value={this.state.newContent} onChange={this.handleChange} onBlur={this.handleBlur} onKeyDown={this.handleKeyDown} />
                ) : (
                <SyntaxHighlighter language="python" style={a11yDark} >
                    {this.props.content}
                </SyntaxHighlighter>
                )}
                </div>
            </Flex>
        );
    }
}

class PlayButton extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <IconButton onClick={this.props.onClick} style={{ flex: 1, backgroundColor: 'var(--cyan-10)', color: 'var(--cyan-1)' }}><PlayIcon /></IconButton>
        );
    }
}

export default NotebookView;