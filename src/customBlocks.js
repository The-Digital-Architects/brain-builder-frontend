import React, { Component } from 'react';
import * as Slider from '@radix-ui/react-slider';
import './css/App.css';
import { Flex, Theme, Box, Heading, Separator } from '@radix-ui/themes';
import Header from './common/header';


class ManualTask extends Component {
    constructor(props) {
        super(props);
        this.state = {
            in1: 1,
            in1Name: 'Weight',
            in2: 0,
            in2Name: 'Bias',
            out1: null,
            out1Name: 'Error',
            out2: null, 
            out2Name: '',
            img: null,
        };
        this.ws = new WebSocket(`wss://${this.props.host}/ws/${this.props.userId}/`);
    }

    componentDidMount() {
        this.ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        this.ws.onopen = () => {
            console.log('WebSocket connection opened');
            if (this.props.type === 'ManualRegression') {
                // send a message to the websocket to create a baseline plot
                this.ws.send(JSON.stringify({ title: 'initialize', a: 1, b: 0 }));
            } else if (this.props.type === 'ManualPCA') {
                // for example
            }
        }

        this.ws.onerror = (error) => {
            console.error('WebSocket error: ', error);
        }

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.title === 'plot') {
                const binaryString = atob(data.plot);  // decode from base64 to binary string
                const bytes = new Uint8Array(binaryString.length);  // convert from binary string to byte array
                for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);  // now bytes contains the binary image data
                }
                const blob = new Blob([bytes.buffer], { type: 'image/jpeg' });
                const url = URL.createObjectURL(blob);
                // now images can be accessed with <img src={url} />
                this.setState({ img: url });
                this.setState({ error: data.error[0] });
            }
        }
    }

    componentWillUnmount() {
        this.ws.close();
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

    handleWeightChange = this.throttle((value) => {
        value = value[0] * Math.PI / 180;
        value = Math.tan(value);
        value = parseFloat(value.toFixed(3));
        this.setState({ in1: value });
        // Send a message through the WebSocket
        const message = JSON.stringify({ title: 'weightChange', a: value, b: this.state.in2});
        this.ws.send(message);
    }, 100)

    handleBiasChange = this.throttle((value) => {
        this.setState({ in2: value[0] });
        // Send a message through the WebSocket
        const message = JSON.stringify({ title: 'biasChange', a: this.state.in1, b: value[0]});
        this.ws.send(message);
    }, 100)

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
                        {this.props.description.map(([subtitle, text], index) => (
                            <div key={index}>
                            <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:7 }}>&gt;_{subtitle} </Heading>
                            <p>{text}</p>
                            </div>
                        ))}
                    </Box>
                    <Separator orientation='vertical' style = {{ height: window.innerHeight-110 }}/>
                    {this.animation()}
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
              style={{ width: Math.round(0.16 * (window.innerWidth * 0.97)) }}
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
              style={{ width: Math.round(0.16 * (window.innerWidth * 0.97)) }}
            >
              <Slider.Track className="SliderTrack" style={{ height: 3 }}>
                <Slider.Range className="SliderRange" />
              </Slider.Track>
              <Slider.Thumb className="SliderThumb" aria-label="Weight" />
            </Slider.Root>
        );  

        return (
            <Box style={{ flex:1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: window.innerHeight-52, padding:'30px 50px' }}>
                <Flex direction='column' gap="0" style={{ alignItems: 'center', justifyContent: 'center' }}>
                
                <div className="slider" style={{ marginTop:50 }}>
                    {weightSlider}
                </div>
                <div>{this.state.in1Name}: {this.state.in1}</div>
                {this.state.in2 !== null && (
                <>
                <div className="slider" style={{ marginTop:25 }}>
                    {biasSlider}
                </div>
                <div>{this.state.in2Name}: {this.state.in2}</div>
                </>
                )}
                
                <img src={this.state.img} alt="No plot available" style={{ height: window.innerHeight*0.55, marginBottom:10 }}/>
                
                <div>
                    {/* Drag the sliders to change the weight and bias of the perceptron. Try to minimize the error. */}
                    Current {this.state.out1Name}: {this.state.out1}
                </div>
                {this.state.in2 !== null && (
                <>
                <div>
                    Current {this.state.out2Name}: {this.state.out2}
                </div>
                </>
                )}
                </Flex>
            </Box>
        );
    }
}

export default ManualTask;
