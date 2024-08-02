import React, { Component } from 'react';
import * as Slider from '@radix-ui/react-slider';
import { ChevronDownIcon, ChevronUpIcon, PlayIcon } from '@radix-ui/react-icons';
import * as Select  from '@radix-ui/react-select';
import './css/App.css';
import { Flex, Theme, Box, Heading, Separator, IconButton } from '@radix-ui/themes';
import Header from './common/header';


class OtherTask extends Component {
    /* This component can be used for simple tasks with a split screen with an explanation on the left and sliders and a visualisation on the right, separated by a vertical line. */

    constructor(props) {
        let inVals = {'ManualLinReg': [1, 0], 'ManualPolyReg': [1], 'ManualMatrix': [5, 3], 'ManualPCA': [45], 'Manual3DPCA': [0], 'ManualEmissions': []}
        let inNames = {'ManualLinReg': ['Weight', 'Bias'], 'ManualPolyReg': ['Order of the polynomial'], 'ManualMatrix': ['Number of objects', 'Number of features'], 'ManualPCA': ['Angle'], 'Manual3DPCA': ['Angle'], 'ManualEmissions': []}
        let outNames = {'ManualLinReg': ['Error'], 'ManualPolyReg': [], 'ManualMatrix': [], 'ManualPCA': ['Explained variance'], 'Manual3DPCA': ['Explained variance'], 'ManualEmissions': []}
        super(props);
        this.state = {
            in1: inVals[this.props.type][0] || 0,
            in1Name: inNames[this.props.type][0] || null,
            in2: inVals[this.props.type][1] || 0,
            in2Name: inNames[this.props.type][1] || null,
            out1: null,
            out1Name: outNames[this.props.type][0] || null,
            out2: null, 
            out2Name: outNames[this.props.type][1] || null,
            img: null,
            view: null
        };
        if (this.props.type === 'ManualLinReg' || this.props.type === 'ManualPolyReg' || this.props.type === 'ManualPCA' || this.props.type === 'Manual3DPCA') {
            this.ws = new WebSocket(`wss://${this.props.host}/ws/${this.props.userId}/`);
        } else {
            this.ws = null;
            if (this.props.type === 'ManualMatrix') {
            this.setState({ view: renderMatrix(5, 3) });
            }
        }
    }

    componentDidMount() {
        if (this.ws !== null) {

        this.ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        this.ws.onopen = () => {
            console.log('WebSocket connection opened');
            if (this.props.type === 'ManualLinReg') {
                // send a message to the websocket to create a baseline plot
                this.ws.send(JSON.stringify({ header: 'initial_change', task_name: this.props.type, task_id: this.props.customId, a: 1, b: 0 }));
            } else if (this.props.type === 'ManualPolyReg') {
                this.ws.send(JSON.stringify({ header: 'initial_change', task_name: this.props.type, task_id: this.props.customId, n: 1 }));
            } else if (this.props.type === 'ManualPCA') {
                this.ws.send(JSON.stringify({ header: 'initial_change', task_name: this.props.type, task_id: this.props.customId, a: 45 }));
            } else if (this.props.type === 'Manual3DPCA') {
                this.ws.send(JSON.stringify({ header: 'initial_change', task_name: this.props.type, task_id: this.props.customId, angle: 0 }));
            }
        }

        this.ws.onerror = (error) => {
            console.error('WebSocket error: ', error);
        }

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Received message: ', data);  // TODO remove
            if (data.header === 'plot') {
                const binaryString = atob(data.plot);  // decode from base64 to binary string
                const bytes = new Uint8Array(binaryString.length);  // convert from binary string to byte array
                for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);  // now bytes contains the binary image data
                }
                const blob = new Blob([bytes.buffer], { type: 'image/jpeg' });
                const url = URL.createObjectURL(blob);
                // now images can be accessed with <img src={url} />
                this.setState({ img: url });
                this.setState({ out1: data.out1 });
                this.setState({ out2: data.out2 });
            }
        }
        }
    }

    componentWillUnmount() {
        if (this.ws !== null) {
        this.ws.close();
        }
    }

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    debounce(func, delay) {
        let debounceTimer;
        return function(...args) {
          const context = this;
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => func.apply(context, args), delay);
        };
      }

    handleMatrixChange = (value, whichIn) => {
        if (whichIn === 1) {
            this.setState({ in1: value[0] });
            this.setState({ view: renderMatrix(value[0], this.state.in2) })
        } else {
            this.setState({ in2: value[0] });
            this.setState({ view: renderMatrix(this.state.in1, value[0]) })
        }
    }

    handleAngleChange = (value) => {
        this.setState({ in1: value[0] });
        this.throttle((value) => {
        const message = JSON.stringify({ header: 'angle_change', task_name: this.props.type, task_id: this.props.customId, angle: value});
        this.ws.send(message);
    }, 500)}

    handleWeightChange = (value) => {
        if (this.props.type === 'ManualPCA') {this.setState({ in1: value[0] })};
        value = value[0] * Math.PI / 180;
        value = Math.tan(value);
        value = parseFloat(value.toFixed(3));
        if (this.props.type === 'ManualLinReg') {this.setState({ in1: value })};
        this.debounce((value) => {
        // Send a message through the WebSocket
        const message = JSON.stringify({ header: 'weight_change', task_name: this.props.type, task_id: this.props.customId, a: value, b: this.state.in2});
        this.ws.send(message);
    }, 100)}

    handleBiasChange = this.throttle((value) => {
        this.setState({ in2: value[0] });
        // Send a message through the WebSocket
        const message = JSON.stringify({ header: 'bias_change', task_name:this.props.type, task_id: this.props.customId, a: this.state.in1, b: value[0]});
        this.ws.send(message);
    }, 100)

    handleOrderChange = this.throttle((value) => {
        this.setState({ in1: value[0] });
        // Send a message through the WebSocket
        const message = JSON.stringify({ header: 'order_change', task_name: this.props.type, task_id: this.props.customId, n: value[0] });
        this.ws.send(message);
    }, 100)

    setResult = (value) => {
        this.setState({ out1: value[0], out2: value[1] });
    }

    updateWords= (value) => {
        if (value === 'a sentence (~30 words)') {
            this.setState({ in1: 30 });
        } else if (value === 'a paragraph (~100 words)') {
            this.setState({ in1: 100 });
        } else if (value === 'a page (~400 words)') {
            this.setState({ in1: 400 });
        }
    }

    updateTime = (value1, value2) => {
        this.setState({ in2: [value1, value2] });
    }

    render() {
        const texts = {
            "Perceptron": [
                ["Perceptrons",
                "The building block of a neural network is the 'perceptron': a simple model which takes a number of inputs, multiplies each with a weight and then adds a bias. When we visualize this, we get a simple linear function like the one on the right. Note that this is a simplified version of the perceptron: many variations exist."],
                ["Your Task",
                "Your task here is quite simple: try to change the parameters of the perceptron so the error reduces (and the correlation increases). This is actually just a linear regression, since the output of this simplified perceptron will always be linear. This tweaking of the parameters is the essence of training a neural network. The magic of neural networks is that they can do this themselves, as we will see in the next module."],
                ["The Data",
                "The data consists of points generated along a line, with some random noise added."],
            ]
        }  // TODO: deprecated

        return (
        <Theme accentColor="cyan" grayColor="slate" panelBackground="solid" radius="large" appearance='light'>
            <div className='App'>
            <Flex direction='column' gap='0'>
            <Header showHomeButton={true} />

            <Box style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: 'monospace', height: window.innerHeight-52, width:'100vw' }}>
                <Flex direction='row' gap="0" style={{ height: window.innerHeight-52, width:'100vw', alignItems: 'center', justifyContent: 'center' }}>
                    <Box style={{ flex:1, display: 'flex', flexDirection: 'column', textAlign:'justify', alignItems: 'flex-start', justifyContent: 'center', height: window.innerHeight-52, padding:'30px 50px' }}>
                        {Array.isArray(this.props.description) && this.props.description.map(([subtitle, text], index) => (
                            <div key={index}>
                            <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:7 }}>&gt;_{subtitle} </Heading>
                            <p>{text}</p>
                            </div>
                        ))}
                    </Box>
                    <Separator orientation='vertical' style = {{ height: window.innerHeight-110 }}/>
                    {this.props.type === 'ManualEmissions' ? renderEmissions( [this.state.out1, this.state.out2], this.setResult, [this.state.in1, this.state.in2], this.updateTime, this.updateWords ) : this.animation()}
                </Flex>
            </Box>
            </Flex>
            </div>
        </Theme>
        );
    }

    animation() {
        const weightSlider = (
            <Slider.Root
              className="SliderRoot"
              defaultValue={[45]}
              onValueChange={(value) => this.handleWeightChange(value)}
              min={-85}
              max={85}
              step={1}
              style={{ width: Math.round(0.16 * (window.innerWidth * 0.97)), margin: 10 }}
            >
              <Slider.Track className="SliderTrack" style={{ height: 3 }}>
                <Slider.Range className="SliderRange" />
              </Slider.Track>
              <Slider.Thumb className="SliderThumb" aria-label="Weight" />
            </Slider.Root>
          );

          const angleSlider = (
            <Slider.Root
              className="SliderRoot"
              defaultValue={[0]}
              onValueChange={(value) => this.handleAngleChange(value)}
              min={-180}
              max={180}
              step={1}
              style={{ width: Math.round(0.16 * (window.innerWidth * 0.97)), margin: 10 }}
            >
              <Slider.Track className="SliderTrack" style={{ height: 3 }}>
                <Slider.Range className="SliderRange" />
              </Slider.Track>
              <Slider.Thumb className="SliderThumb" aria-label="Weight" />
            </Slider.Root>
          );
        
        const biasSlider = (
            <Slider.Root
              className="SliderRoot"
              defaultValue={[0]}
              onValueChange={(value) => this.handleBiasChange(value)}
              min={-5}
              max={5}
              step={0.01}
              style={{ width: Math.round(0.16 * (window.innerWidth * 0.97)), margin: 10 }}
            >
              <Slider.Track className="SliderTrack" style={{ height: 3 }}>
                <Slider.Range className="SliderRange" />
              </Slider.Track>
              <Slider.Thumb className="SliderThumb" aria-label="Bias" />
            </Slider.Root>
        );  

        const orderSlider = (
            <Slider.Root
                className="SliderRoot"
                defaultValue={[1]}
                onValueChange={(value) => this.handleOrderChange(value)}
                min={1}
                max={10}
                step={1}
                style={{ width: Math.round(0.16 * (window.innerWidth * 0.97)), margin: 10 }}
            >
            <Slider.Track className="SliderTrack" style={{ height: 3 }}>
                <Slider.Range className="SliderRange" />
              </Slider.Track>
              <Slider.Thumb className="SliderThumb" aria-label="Order" />
            </Slider.Root>
        );

        const nObjectsSlider = (
            <Slider.Root
                className="SliderRoot"
                defaultValue={[5]}
                onValueChange={(value) => this.handleMatrixChange(value, 1)}
                min={2}
                max={20}
                step={1}
                style={{ width: Math.round(0.16 * (window.innerWidth * 0.97)), margin: 10 }}
            >
            <Slider.Track className="SliderTrack" style={{ height: 3 }}>
                <Slider.Range className="SliderRange" />
              </Slider.Track>
              <Slider.Thumb className="SliderThumb" aria-label="nObjects" />
            </Slider.Root>
        );

        const nFeaturesSlider = (
            <Slider.Root
                className="SliderRoot"
                defaultValue={[3]}
                onValueChange={(value) => this.handleMatrixChange(value, 2)}
                min={1}
                max={10}
                step={1}
                style={{ width: Math.round(0.16 * (window.innerWidth * 0.97)), margin: 10 }}
            >
            <Slider.Track className="SliderTrack" style={{ height: 3 }}>
                <Slider.Range className="SliderRange" />
              </Slider.Track>
              <Slider.Thumb className="SliderThumb" aria-label="nFeatures" />
            </Slider.Root>
        );

        return (
            <Box style={{ flex:1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: window.innerHeight-52, padding:'30px 50px',  }}>
                <Flex direction='column' gap="0" style={{ alignItems: 'center', justifyContent: 'center' }}>
                
                <div>{this.state.in1Name}: {this.state.in1}</div>
                <div className="slider" style={{ marginTop:10, height:50 }}>
                    {
                    (this.props.type === 'ManualLinReg' || this.props.type === 'ManualPCA') ? weightSlider
                    : this.props.type === 'Manual3DPCA' ? angleSlider
                    : this.props.type === 'ManualPolyReg' ? orderSlider 
                    : this.props.type === 'ManualMatrix' ? nObjectsSlider
                    : null}
                </div>

                {this.state.in2Name !== null && (
                <>
                <div>{this.state.in2Name}: {this.state.in2}</div>
                <div className="slider" style={{ marginTop:10   , height:50 }}>
                    {this.props.type === 'ManualLinReg' ? biasSlider
                    : this.props.type === 'ManualMatrix' ? nFeaturesSlider
                    : null}
                </div>
                </>
                )}
                
                {
                this.state.img ? <img src={this.state.img} alt="No plot available" style={{ height: window.innerHeight*0.55, marginBottom:10 }}/>
                : this.state.view ?
                <Box style={{ height: window.innerHeight*0.55, marginBottom:10 }}>
                    {this.state.view}
                </Box>
                : null
                }
                
                {this.state.out1Name !== null && (
                <div>
                    {/* Drag the sliders to change the weight and bias of the perceptron. Try to minimize the error. */}
                    Current {this.state.out1Name}: {this.state.out1}
                </div>)}
                
                {this.state.out2Name !== null && (
                <>
                <div>
                    Current {this.state.out2Name}: {this.state.out2}
                </div>
                </>)}
                </Flex>
            </Box>
        );
    }
}


function renderMatrix(nObjects, nFeatures) {
    // Create a render of a matrix of size nObjects x nFeatures, populated with letters of the alphabet
    // When the end of the alphabet is reached, add an extra letter, eg. 'x', 'y', 'z', 'aa', 'ab', ...
    // return a JSX element
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    const matrix = [];
    let letterIndex = 0;
    for (let i = 0; i < nObjects; i++) {
        const row = [];
        for (let j = 0; j < nFeatures; j++) {
            row.push(alphabet[letterIndex % 26]);
            letterIndex++;
        }
        matrix.push(row);
    }

    return (
        <table style={{ borderCollapse: 'collapse', margin: 'auto', textAlign: 'center' }}>
            <tbody>
                {matrix.map((row, i) => (
                    <tr key={i}>
                        {row.map((cell, j) => (
                            <td key={j} style={{ border: '1px solid black', padding: '5px' }}>{cell}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}


const Dropdown = ({ label, options, onChange, placeholder, disabled=false }) => (
    <Select.Root onValueChange={onChange} disabled={disabled} >
    <Select.Trigger className="SelectTrigger" aria-label={label}>
        <Select.Value placeholder={placeholder} />
        <Select.Icon className="SelectIcon">
        <ChevronDownIcon />
        </Select.Icon>
    </Select.Trigger>
    <Select.Portal>
        <Select.Content className="SelectContent" >
        <Select.ScrollUpButton className="SelectScrollButton">
            <ChevronUpIcon />
        </Select.ScrollUpButton>
        <Select.Viewport className="SelectViewport">
            <Select.Group>
            {options.map((option) => (
                <Select.Item key={option} value={option} className="SelectItem" style={{ margin: 5, marginLeft:10 }}>
                    <Select.ItemText>{option}</Select.ItemText>
                </Select.Item>
            ))}
            </Select.Group>
        </Select.Viewport>
        <Select.ScrollDownButton className="SelectScrollButton">
            <ChevronDownIcon />
        </Select.ScrollDownButton>
        </Select.Content>
    </Select.Portal>
    </Select.Root>
);

function renderText( textList, inputFields ) {
    return (
        <div>
            {textList.map((text, index) => (
                <p key={index}>{text}{inputFields[index]}</p>
            ))}
        </div>
    );
}

const EI = 0.3;  // gCO2e/Wh, carbon intensity of electricity in the EU (source: https://ourworldindata.org/grapher/carbon-intensity-electricity?tab=chart&country=EU-27~OWID_EU27~OWID_WRL)
const CP = 20;  // Wh/h, average power consumption of a laptop per hour (source: specs of ZBook Power G9)
const T = 0.35/60/60;  // h/word, time for chatGPT to generate a word (source: see below)
const AIP = 400;  // W, power consumption of an A100 GPU in an Azure datacenter (source: see below)
const AIM = 1.84+0.03; // gCO2e/query, the share of emissions from training the model + operating the server (source: https://www.nature.com/articles/s41598-024-54271-x)
const GE = 0.2; // gCO2e/Wh, carbon intensity of a Google search (source: https://googleblog.blogspot.com/2009/01/powering-google-search.html)
function calculateWritingEmissions( n_words, own_time_mins, proofread_time_mins ) {
    let own_emissions = (own_time_mins+proofread_time_mins)/60*CP*EI;  // in gCO2e
    let AI_emissions = AIM + n_words*T*AIP*EI + proofread_time_mins/60*CP*EI;  // in gCO2e
    return [own_emissions, AI_emissions]; 
}
function calculateSearchingEmissions( n_searches, n_pages, mins_per_page, short=false ) {
    if (short) {
        let n_words = 20  // a rough estimate of a ChatGPT answer to a simple question (eg. "How tall is the Eiffel Tower?")
        return ( GE, n_words*T*AIP*EI )  // emissions for Google Search, emissions for ChatGPT answer (in gCO2e)
    } else {
        let n_words = 400  // a rough estimate of a ChatGPT answer to a more complex question, (eg. "How do I calculate the bending stiffness of a wing?")
        let n_prompts = 1
        return ( n_searches*GE + n_pages*mins_per_page/60*CP*EI, n_prompts*n_words*T*AIP*EI + n_prompts*mins_per_page/60*CP*EI )  // emissions for Google Search, emissions for ChatGPT answer (in gCO2e)
    }
} 
// note: I left out the emissions for maintaining the webpages, since these were hard to find
// note: in general, this is a rough estimate, but at least it gives people an idea
// for more details on emissions calculation, see this blog post: https://medium.com/@chrispointon/the-carbon-footprint-of-chatgpt-e1bc14e4cc2a

function renderEmissions( result, setResult, ins, updateTime, updateWords, writing=true ) {
    
    if (writing) {
    if (ins[1] === null) {ins[1] = [null, null]};

    const inputs = [
        <Dropdown label="TextType" options={['a sentence (~30 words)', 'a paragraph (~100 words)', 'a page (~400 words)']} onChange={(value) => updateWords(value)} placeholder="Select an amount of words" />,
        <input type="number" onChange={(event) => updateTime(event.target.value, ins[1][1])} />,
        <input type="number" onChange={(event) => updateTime(ins[1][0], event.target.value)} />,
    ]
    const texts = [
        "Writing an initial draft of ", "takes me about ", " minutes, and proofreading it takes me about ", " minutes. ",
    ]
    return (
        <Flex direction='column' gap="0" style={{ alignItems: 'center', justifyContent: 'center' }}>
            {renderText( texts, inputs )}
            <IconButton onClick={
                () => setResult(calculateWritingEmissions(ins[0], parseInt(ins[1][0]), parseInt(ins[1][1])))
            } variant="solid" color="cyan" style={{ borderRadius: 'var(--radius-3)', width: 70, height: 35, fontSize: 'var(--font-size-2)', fontWeight: "500" }} >
                <PlayIcon />
            </IconButton>
            {(result[0] !== null  && result[1] !== null) ?
            <div style={{ marginTop:20 }}>
            <p> Emissions from writing yourself: {Math.round(result[0], 0.1)} g CO2e </p>
            <p> Emissions from writing with ChatGPT: {Math.round(result[1], 0.1)} g CO2e </p>
            </div> : null}
        </Flex>
    );
    }

}

export default OtherTask;