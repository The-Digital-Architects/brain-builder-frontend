import React from 'react'
import './css/App.css';
import { Theme, Flex, Box, Tabs, Heading, IconButton, Separator, Checkbox, Text } from '@radix-ui/themes';
import * as Form from '@radix-ui/react-form';
import horizontalCss from './css/horizontalSlides.css';
import '@radix-ui/themes/styles.css';
import color_scale_pic from "./images/color_scale_2.png";
import Slider from 'react-animated-slider';
import CytoscapeComponent from 'react-cytoscapejs';
import { PlayIcon, ChevronLeftIcon, ChevronRightIcon, CodeIcon } from '@radix-ui/react-icons';
import Joyride from 'react-joyride';
import { useNavigate } from 'react-router-dom';
import CodePreview from './code_preview/codePreview';
import layersToCode from './code_preview/codeExplainTools';
import {GenerateFloatingButtons, LayerRemoveButton, LayerAddButton} from './common/floatingButtons';
import Header from './common/header';
import { 
  Chart, 
  CategoryScale, 
  LinearScale, 
  LineController, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import axios from 'axios';

function BuildingWrapper(props) {
  const navigate = useNavigate();

  return <Building {...props} navigate={navigate} />;
}

Chart.register(
  CategoryScale, 
  LinearScale, 
  LineController, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend
);
class Building extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      description: [['title', 'some text'], ['another title', 'some more text, actually this is gonna be such a super duper long paragraph of text cause I wanna see how it behaves when the box overflows, are we there yet? Is this enough? ']],
      printedDescription: '',
      runTutorial: false,
      currentSlide: 0,
      activeTab: 'building',
      showCode: false,
      code: '',
      steps: [
        {
          target: '.buildBody',
          content: 'Welcome to the Building View! This is where you can build and test your own neural networks.',
          placement: 'center',
        },
        {
          target: '.cytoscape',
          content: 'This is the neural network you will be building. You can add and remove layers with the buttons on the right. You can also use the + and - buttons below the network to add or remove nodes.',
        },
        {
          target: '.iterationsSlider',
          content: 'This is the slider to adjust the number of epochs. Put simply: the more epochs, the more your network will learn. But be careful, too many epochs can lead to overfitting!',
        },
        {
          target: '.learningRateSlider',
          content: 'This is the slider to adjust the learning rate. Put simply: the lower the learning rate, the less the network will adjust itself at every step.',
        },
        // Add more steps as needed
      ],
    };
  }
  shortDescription = 'Please reload the page to load the task description';

  handleTabChange = (value) => {
    this.setState({ activeTab: value });
  };

  typeWriter = (txt, speed=15, i=0) => {
    if (i < txt.length) {
      this.setState({ printedDescription: this.state.printedDescription + txt.charAt(i)})
      setTimeout(() => this.typeWriter(txt, speed, i + 1), speed);
    }
  };

  componentDidMount() {
    axios.get(window.location.origin + '/api/tasks/?task_id=' + this.props.taskId)
    .then(response => {
      this.shortDescription = response.data.short_description;
      if (response.data.description[0] === '[') {
        this.setState({ description: JSON.parse(response.data.description) });
      } else {
        if (response.data.description[0] === '*') {
          this.typeWriter(response.data.description);  // this works
        } else {
          this.createDescriptionList(response.data.description);
        }
      }
      this.continueComponentDidMount();
    })
    .catch(error => {
      console.error('Task description error:', error);
      this.typeWriter("There was an error loading the task description. Please try reloading the paper or contact us");
      this.continueComponentDidMount();
    });
  }

  continueComponentDidMount = () => {
    if (this.props.taskId === 0) {
      this.setState({ runTutorial: true }, () => {
        // Delay the click on the beacon until after the Joyride component has been rendered
        setTimeout(() => {
          const beacon = document.querySelector('.react-joyride__beacon');
  
          if (beacon) {
            beacon.click();
          }
        }, 0);
      });
    }
    else {
    this.props.loadData(this.props.taskId, this.props.index)  // let the backend load the data, then set the images and feature names
    this.props.loadLastCytoLayers(this.props.setCytoLayers, this.props.apiData, this.props.setApiData, 'cytoLayers' + this.props.taskId, this.props.taskId, this.props.index, this.props.NNIndex, this.props.nOfInputs, this.props.nOfOutputs);
    this.props.updateCytoLayers(this.props.setCytoLayers, this.props.nOfInputs, this.props.nOfOutputs, this.props.NNIndex);
    }
  }

  chartRef = React.createRef();
  chartInstance = null;

  componentDidUpdate(prevProps) {
    if (this.cy) {this.cy.resize();} // this seems to do nothing
    if (this.props.taskId !== 0 && this.chartRef.current) {
      const ctx = this.chartRef.current.getContext('2d');

      if (this.chartInstance && (JSON.stringify(this.props.errorList[0].slice(0, prevProps.errorList[0].length)) === JSON.stringify(prevProps.errorList[0]) && this.props.errorList[0].length > prevProps.errorList[0].length)) {
        // Update the chart if the error list has changed and is longer than before
        this.chartInstance.data.labels = this.props.errorList[0].map((_, i) => i + 1);
        this.chartInstance.data.datasets[0].data = this.props.errorList[0];
        this.chartInstance.update();
      } else {
        // Destroy the old chart if a different error list was received and a chart exists
        if (JSON.stringify(this.props.errorList[0].slice(0, prevProps.errorList[0].length)) !== JSON.stringify(prevProps.errorList[0])) {
          // If an old chart exists, destroy it
          if (this.chartInstance) {
            this.chartInstance.destroy();
            this.chartInstance = null;
          }
        } 
      }
      // Create a new chart if there is no chart
      if (this.chartInstance === null) {
        // create a new chart
        this.chartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels: this.props.errorList[0].map((_, i) => i + 1), // Generate labels based on error array length
            datasets: [{
                label: 'Errors',
                data: this.props.errorList[0],
                borderColor: 'rgba(7, 151, 185, 1)',
                backgroundColor: 'rgba(7, 151, 185, 0.2)',
            }]
          },
          options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            animation: {
              duration: 1000 // general animation time
            },
            responsive: false,
            maintainAspectRatio: false,
          }  
        });
      }
    }
  }

  componentWillUnmount() {
    if (this.props.isTraining === 1) {
      this.props.cancelRequest();
    }
  }

  handleJoyrideCallback = (data) => {
    const { action, status } = data;

    if (action === 'skip' || status === 'finished') {
      this.props.navigate('/');
    }
  }

  createDescriptionList = (jsonText) => {
    try {
      const sanitizedJson = jsonText.replace(/<\/?[^>]+(>|$)/g, "")
        .replace(/&/g, "&amp;")
        .replace(/%/g, "&#37;")
        .replace(/#/g, "&#35;")
        .replace(/!/g, "&#33;")
        .replace(/\?/g, "&#63;")
        .replace(/'/g, "&#39;")
        .replace(/"/g, "&quot;");
      const splitText = sanitizedJson.split('\n ');
      const descriptionList = splitText.map(subText => {
        const [subtitle, ...paragraphs] = subText.split('\n');
        const formattedParagraphs = paragraphs.map(paragraph => 
          paragraph.replace(/\*([^*]+)\*/g, '<b>$1</b>')  // bold
          .replace(/_([^_]+)_/g, '<i>$1</i>') // italic
        );
        return [subtitle, ...formattedParagraphs];
      });
      this.setState({ description: descriptionList });
    } catch (error) {
      console.error('Error parsing JSON or formatting description:', error);
    }
  }

  goToSlide = (index) => {
    this.setState({ currentSlide: index });
  };

  handleAfClick = () => {
    this.props.setAf(this.props.NNIndex, !this.props.af);
  }
  
  debounce(func, delay) {
    let debounceTimer;
    return function(...args) {
      const context = this;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
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

  handleStartClick = (() => {
    let inThrottle;
    return (event) => {
      if (!inThrottle && this.props.taskId !== 0) { 
        if (this.props.isTraining === 1) {
          this.props.cancelRequestRef.current(this.props.taskId, this.props.index)
        } else { 
          let putRequestParams = {
            cytoLayers: this.props.cytoLayers,
            learningRate: this.props.learningRate,
            iterations: this.props.iterations,
            taskId: this.props.taskId,
            nOfInputs: this.props.nOfInputs,
            nOfOutputs: this.props.nOfOutputs,
            index: this.props.NNIndex,
            globalIndex: this.props.index,
            setProgress: this.props.setProgress,
            setErrorList: this.props.setErrorList,
            setWeights: this.props.setWeights,
            setBiases: this.props.setBiases,
            setImgs: this.props.setImgs,
            setApiData: this.props.setApiData,
            setAccuracy: this.props.setAccuracy,
            setIsTraining: this.props.setIsTraining,
            userId: this.props.userId,
            intervalTimeout: this.props.intervalTimeout,
            progress: this.props.progress,
            errorList: this.props.errorList,
            weights: this.props.weights,
            biases: this.props.biases,
            imgs: this.props.imgs,
            isTraining: this.props.isTraining,
            af: this.props.af,
            cancelRequestRef: this.props.cancelRequestRef,
            typ: this.props.typ,
            dataset: this.props.dataset,
          }
          this.props.putRequest(event, putRequestParams);
        }
        inThrottle=true
        setTimeout(() => inThrottle = false, 2*this.props.pendingTime);
      }
    };
  })();

  render() {
    let level = Number(String(this.props.taskId)[0]);

    return(
    <div className='buildBody'>
      <Theme accentColor="cyan" grayColor="slate" panelBackground="solid" radius="large" appearance='light'>

      <Header showHomeButton={true} />

      <Tabs.Root defaultValue="building" style={{ fontFamily:'monospace' }}>

        <Tabs.List size="2">
          <Tabs.Trigger value="task" onValueChange={this.handleTabChange} >Background Info </Tabs.Trigger>
          <Tabs.Trigger value="building" onValueChange={this.handleTabChange} >Build</Tabs.Trigger>
          <Tabs.Trigger value="stuff" onValueChange={this.handleTabChange} >Result</Tabs.Trigger>
          {/*<Tabs.Trigger value="settings">Settings</Tabs.Trigger>*/}
        </Tabs.List>

        <Box px="4" pt="3" pb="0">
        <Tabs.Content value="task">
          {this.props.taskId !== 0 && (
            <Flex direction="row" gap="2" style={{ overflow: 'auto', fontFamily:'monospace', width: '100%', height: window.innerHeight-116 }}>
              <Box style={{ flexBasis: '50%' }}>
              {this.state.description.length > 0 ? (            
                <Flex direction='column' gap='2' style={{ padding: '20px 10px', display: 'flex', justifyContent:"center", alignItems:"center" }}>
                  {/*
                  <Flex direction="column" gap="2" style={{ flexbasis:'30%', justifyContent:"center", alignItems:"center", width:"100%" }}>
                    {this.state.description.map(([subtitle, text], index) => (
                      <Button variant="outline" style={{ width:"100%"}} pressed={this.state.currentSlide === index} onClick={() => this.goToSlide(index)}>{subtitle}</Button>
                    ))}
                  </Flex>
                  */}
                  <Flex style={{ flexbasis:'100%', marginBottom: 0, width:'100%' }}>
                    <Slider key={this.state.currentSlide} classNames={horizontalCss} infinite={false} slideIndex={this.state.currentSlide}
                      previousButton={
                        <ChevronLeftIcon
                          style={{ color: 'var(--slate-9)', width:64, height:64 }}
                          onClick={() => {
                            const prevSlide = this.state.currentSlide - 1;
                            if (prevSlide >= 0) {
                              this.setState({ currentSlide: prevSlide });
                            }
                        }}/>}
                      nextButton={
                        <ChevronRightIcon
                          style={{ color: 'var(--slate-9)', width:64, height:64 }}
                          onClick={() => {
                            const nextSlide = this.state.currentSlide + 1;
                            if (nextSlide < this.state.description.length) {
                              this.setState({ currentSlide: nextSlide });
                            }
                        }}/>}
                    >
                      {this.state.description.map(([subtitle, ...paragraphs], index) => (
                        <div key={index} className="slide-container">
                          <div className="slide-content">
                            <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:7, textAlign:"center" }}>&gt;_{subtitle} </Heading>
                            {paragraphs.map((paragraph, pIndex) => (
                              <p key={pIndex} dangerouslySetInnerHTML={{ __html: paragraph }}></p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </Slider>
                  </Flex>
                </Flex>
              ) : (
                <Box style={{ textAlign:'justify', padding: '20px 300px' }}>
                  <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:7 }}>&gt;_Your Task </Heading>
                  {this.state.printedDescription}
                </Box>
              )}
              </Box>
              <Separator orientation='vertical' style = {{ height: window.innerHeight-152, position: 'fixed', left: window.innerWidth * 0.5, bottom: (window.innerHeight-92) * 0.5, transform: `translateY(${(window.innerHeight - 152) / 2}px)` }}/>
              <Box style={{ flexBasis: '50%', display: 'flex', justifyContent:"center", alignItems:"center", padding: "0px 30px" }}>
                <img src={this.props.initPlot} alt='No data available' width='auto' height='auto' style={{ maxWidth: '100%', maxHeight: '100%' }} onLoad={() => {}}/>
              </Box>
          </Flex>)}
        {/*
          <Flex direction="row" gap="2" >
          <Box style={{ flex: 2, overflow: 'auto', padding: '20px 300px', fontFamily:'monospace' }}>
            {this.state.description.length > 0 ? (
              this.state.description.map(([subtitle, ...paragraphs], index) => (
              <div key={index}>
                <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:7 }}>&gt;_{subtitle} </Heading>
                {paragraphs.map((paragraph, pIndex) => (
                  <p key={pIndex} dangerouslySetInnerHTML={{ __html: paragraph }}></p>
                ))}
              </div>
              ))
            ) : (
              <div style={{ textAlign:'justify', marginBottom: '20px' }}>
                <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:7 }}>&gt;_Task Description </Heading>
                {this.state.printedDescription}
              </div>
            )}
          </Box>
          <Separator orientation='vertical' style = {{ height: window.innerHeight-110 }}/>
            <Box style={{ flex: 1, padding: '20px 20px' }}>
              	//
                <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginTop: 20, marginBottom:7 }}>&gt;_The Dataset</Heading>	
                <div style={{ textAlign:'justify' }}>
                  This dataset contains {this.props.nOfObjects}, each with {this.props.nOfInputs} features. There are {this.props.nOfOutputs} targets. The features are: {this.props.featureNames.join(', ')}.
                </div>
                //
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
                  <img src={this.props.initPlot} alt='No data available' width='auto' height='auto' style={{ maxWidth: '100%', maxHeight: '100%' }} onLoad={() => {}}/>
                </div>
            </Box>
          </Flex>
        */}
        </Tabs.Content>
        <Tabs.Content value="building">          
          <Box style={{ display: 'flex', flex: 3, height: '100vh' }}>
            <div className='cytoscape'style={{top: 5, left: 3, position: 'absolute', width: window.innerWidth*0.65, height: window.innerHeight-130}}></div>
            <Flex direction="column" gap="2" height={'100vh'}>
              <CytoscapeComponent elements={this.props.cytoElements} stylesheet={this.props.cytoStyle} panningEnabled={false} autoungrabify={true} style={ { width: window.innerWidth*0.97, height: window.innerHeight-120, border: "solid", borderColor: "var(--slate-8)", borderRadius: "var(--radius-3)" } } onCy={(cy) => {this.cy = cy;}}/>
              
              <img src={color_scale_pic} alt='Color scale from purple for negative to red for positive' width='20' height='auto' style={{ position: 'absolute', top: 15, left: 15 }}/>

              {((this.props.imageVisibility && this.props.img && this.props.img !== '' && this.props.isTraining===1) &&
                <Flex direction="column" gap="1" style={{ position: 'absolute', bottom: window.innerHeight*0.2, left: window.innerWidth*0.45 }}>
                <img src={this.props.img} alt={`No plots yet`} onLoad={() => {}/*URL.revokeObjectURL(this.props.img)*/} style={{ height: '200px', width: 'auto' }}/>
                {this.props.taskId === 11 && this.props.weights[0] && this.props.biases[0] && (
                  <Flex direction="column" gap="0">
                  <p>Weight: {Number(this.props.weights[0]).toFixed(3)}</p>
                  <p>Bias: {Number(this.props.biases[0]).toFixed(3)}</p>
                  </Flex>
                )}
                </Flex>
              )}

              <GenerateFloatingButtons top={window.innerHeight - 223} left={0.1 * (window.innerWidth * 0.97) - 16.5} dist={0.4 * (window.innerWidth * 0.97)/Math.max(this.props.cytoLayers.length-1,1)} isItPlus={true} nLayers={this.props.cytoLayers.length} cytoLayers={this.props.cytoLayers} setCytoLayers={this.props.setCytoLayers} taskId={this.props.taskId} index={this.props.index} NNIndex={this.props.NNIndex} maxNodes={this.props.maxNodes} isTraining={this.props.isTraining}/>                    
              <GenerateFloatingButtons top={window.innerHeight - 178} left={0.1 * (window.innerWidth * 0.97) - 16.5} dist={0.4 * (window.innerWidth * 0.97)/Math.max(this.props.cytoLayers.length-1,1)} isItPlus={false} nLayers={this.props.cytoLayers.length} cytoLayers={this.props.cytoLayers} setCytoLayers={this.props.setCytoLayers} taskId={this.props.taskId} index={this.props.index} NNIndex={this.props.NNIndex} maxNodes={this.props.maxNodes} isTraining={this.props.isTraining}/>
             
              
              <LayerRemoveButton setCytoLayers={this.props.setCytoLayers} index={this.props.NNIndex} taskId={this.props.taskId} cytoLayers={this.props.cytoLayers} isTraining={this.props.isTraining}/>
              <LayerAddButton setCytoLayers={this.props.setCytoLayers} index={this.props.NNIndex} taskId={this.props.taskId} cytoLayers={this.props.cytoLayers} nOfOutputs={this.props.nOfOutputs} maxLayers={this.props.maxLayers} isTraining={this.props.isTraining}/>

            </Flex>
          </Box>
          
          <Separator orientation='vertical' style = {{ position:"absolute", top: Math.round(0.03 * (window.innerHeight-140)), left: Math.round(0.67 * (window.innerWidth * 0.97)), height: 0.96 * (window.innerHeight-140) }}/>

          <Box style={{ flex: 1 }}>

          {this.props.iterationsSliderVisibility ? (<Box style={{ position:"absolute", top: 0.14 * (window.innerHeight-140), left: Math.round(0.74 * (window.innerWidth * 0.97)), alignItems: 'start', justifyContent: 'end', fontFamily:'monospace'  }}>
            <div className="iterationsSlider">
              {this.props.iterationsSlider}
            </div>
            <div style={{ position:"absolute", zIndex: 9999, top: -30, left: 0.095 * (window.innerWidth * 0.97), transform: 'translateX(-50%)', fontSize: '14px', color: 'var(--slate-11)', whiteSpace: 'nowrap' }}>Epochs: {this.props.iterations}</div>
          </Box>) : (<div></div>)}

          {this.props.lrSliderVisibility ? (<Box style={{ position:"absolute", top: Math.round(0.26 * (window.innerHeight-140)), left: Math.round(0.74 * (window.innerWidth * 0.97)), alignItems: 'start', justifyContent: 'end', fontFamily:'monospace'  }}>
            <div className="learningRateSlider">
              {this.props.learningRateSlider}
            </div>
            <div style={{ position:"absolute", zIndex: 9999, top: -30, left: 0.095 * (window.innerWidth * 0.97), transform: 'translateX(-50%)', fontSize: '14px', color: 'var(--slate-11)', whiteSpace: 'nowrap' }}>Learning rate: {this.props.learningRate}</div>
          </Box>) : (<div></div>)}
          
          {this.props.normalizationVisibility ? (
          <Text as="label" size="2">
            <Flex style={{ position:"absolute", top: Math.round(0.4 * (window.innerHeight-140)-20), left: Math.round(0.7 * (window.innerWidth * 0.97)), width: Math.round(0.27 * (window.innerWidth * 0.97)), justifyContent:"flex-start", alignItems:"flex-start"}} gap="2">          
              <Checkbox disabled = { this.props.isTraining===1 } />
              Normalize training data
            </Flex>
          </Text>):(<div></div>)}

          {this.props.afVisibility ? (
          <Text as="label" size="2">
            <Flex style={{ position:"absolute", top: Math.round(0.4 * (window.innerHeight-140)-20), left: Math.round(0.7 * (window.innerWidth * 0.97)), width: Math.round(0.27 * (window.innerWidth * 0.97)), justifyContent:"flex-start", alignItems:"flex-start"}} gap="2">          
              <Checkbox disabled = { this.props.isTraining===1 } onClick={() => this.handleAfClick()} checked={this.props.af} />
              Enable activation functions
            </Flex>
          </Text>):(<div></div>)}

          {/* make the position of the box shift down if normalization is true */}
          <Box style={{ position:"absolute", top: Math.round(0.4 * (window.innerHeight-140)) + ((this.props.normalizationVisibility || this.props.afVisibility) ? 30 : 0), left: Math.round(0.7 * (window.innerWidth * 0.97)), alignItems: 'center', justifyContent: 'start', height: '100vh', fontSize: '14px', color: 'var(--slate-11)' }}>
            <label>isTraining: {this.props.isTraining}</label>
            <div id="/api-data">
              {this.props.isTraining===2 ? (
                <Flex direction='column' >
                  {this.shortDescription}
                  {(this.props.taskId < 20 &&
                  <div style={{ color: this.props.accuracyColor, fontFamily:'monospace' }}><b>R^2: {parseFloat(this.props.errorList[1]).toFixed(2)}</b></div>
                  )}
                  {(this.props.taskId >= 20 &&
                  <div style={{ color: this.props.accuracyColor, fontFamily:'monospace' }}><b>Accuracy: {(parseFloat(this.props.errorList[1])*100).toFixed(2)}%</b></div>
                  )}
                  <canvas ref={this.chartRef} id="myChart" style={{ width: Math.round(0.27 * (window.innerWidth * 0.97)), height: Math.round(0.4 * (window.innerHeight-140)), marginTop:10 }}></canvas>
                </Flex>
              ) : (this.props.isTraining===1 ? (
                <Flex direction= 'column'>
                  <div style={{ fontFamily:'monospace' }}><b>Training... </b></div>
                  <div style={{ fontFamily:'monospace' }}><b>Progress: {Math.round((parseFloat(this.props.progress))*100)}%</b></div>
                  <canvas ref={this.chartRef} id="myChart" style={{ display: this.state.activeTab === 'building' ? 'block' : 'none', width: Math.round(0.27 * (window.innerWidth * 0.97)), height: Math.round(0.35 * (window.innerHeight-140)), marginTop:10 }}></canvas>
                </Flex>
              ) : (
                <div style={{ textAlign:'justify', width: Math.round(0.27 * (window.innerWidth * 0.97)), fontFamily:'monospace' }}>
                  {this.shortDescription}
                </div>
              ))}
            </div>
          </Box>
          <Flex direction="row" gap="3" style={{ position: 'absolute', transform: 'translateX(-50%)', top: Math.round(0.92 * (window.innerHeight-140)), left: Math.round(0.835 * (window.innerWidth * 0.97)), fontFamily:'monospace' }}>
            <IconButton
              onClick={this.handleStartClick}
              variant="solid"
              color="cyan"
              style={{ borderRadius: 'var(--radius-3)', width: Math.round(0.12 * (window.innerWidth * 0.97)), height: 36, fontSize: 'var(--font-size-2)', fontWeight: "500" }}
              disabled = { this.props.isTraining < 0 || (this.props.iterationsSliderVisibility && !this.props.iterations) || (this.props.lrSliderVisibility && !this.props.learningRate) }>
                <Flex direction="horizontal" gap="2" style={{alignItems: "center", fontFamily:'monospace' }}>
                  {this.props.isTraining === -1 ? "Loading..." : (this.props.isTraining === 1 ? "Cancel" : (<><PlayIcon width="18" height="18" />Start training!</>))}
                </Flex>
            </IconButton>
            <IconButton
              onClick={(event) => {
                this.setState({
                  code: layersToCode(this.props.cytoLayers, this.props.learningRate, this.props.iterations, this.props.taskId, this.props.af),
                  showCode: true
                });
                window.scrollTo(0, document.body.scrollHeight); // Scroll to the bottom of the page
            }}
              variant="outline"
              color="cyan"
              style={{ borderRadius: 'var(--radius-3)', width: Math.round(0.12 * (window.innerWidth * 0.97)), height: 36, fontSize: 'var(--font-size-2)', fontWeight: "500" }}
              disabled = { this.props.isTraining < 0 || (this.props.iterationsSliderVisibility && !this.props.iterations) || (this.props.lrSliderVisibility && !this.props.learningRate) }
              >
                <Flex direction="horizontal" gap="2" style={{alignItems: "center", fontFamily:'monospace' }}>
                  {<><CodeIcon width="18" height="18" />Preview in code</>}
                </Flex>
            </IconButton>
          </Flex>
          </Box>
          {this.state.showCode && <CodePreview code={this.state.code} level={level} /> }
        </Tabs.Content>
      
        <Tabs.Content value="stuff">
        {this.props.taskId !== 0 && (
          <Flex direction="row" gap = "3" style={{ display: 'flex' }}>
            <Box style={{ flexBasis: '50%', justifyContent: 'center', alignItems: 'center', padding: '30px 0px' }}>
              <Flex direction="column" gap="2" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              
              {/* This will render the form with the feature names received from the backend, if it exists */}
              <Form.Root className="FormRoot" onSubmit={this.props.taskId !== 0 ? (event) => this.props.handleSubmit(event, this.props.setIsResponding, this.props.setApiData, this.props.taskId, this.props.index) : () => {}} style={{ fontFamily:'monospace' }}>
                {this.props.featureNames.length > 0 && this.props.featureNames.map((featureName, index) => (
                  <Form.Field className="FormField" name={featureName} key={index}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                      <Form.Label className="FormLabel">{featureName}</Form.Label>
                      <Form.Message className="FormMessage" match="valueMissing">
                        Please enter the {featureName}
                      </Form.Message>
                      <Form.Message className="FormMessage" match="typeMismatch">
                        Please provide a valid number.
                      </Form.Message>
                    </div>
                    <Form.Control asChild>
                      <input className="FormInput" type="text" pattern="^-?[0-9]*[.,]?[0-9]+" required />
                    </Form.Control>
                  </Form.Field>
                ))}
                {this.props.featureNames.length > 0 &&
                <Form.Submit asChild>
                  <button className="FormButton" style={{ marginTop: 10, width: window.innerWidth * 0.3 - 30 }}>
                    Predict!
                  </button>
                </Form.Submit>}
              </Form.Root>
              
              {/*  // This is the old form
              <Form.Root className="FormRoot" onSubmit={(event) => this.props.handleSubmit(event, this.props.setIsResponding, this.props.setApiData, this.props.taskId, this.props.index)} style={{ fontFamily:'monospace' }}>
                <Form.Field className="FormField" name="s-m_axis">
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                    <Form.Label className="FormLabel">Semi-Major Axis [km]</Form.Label>
                    <Form.Message className="FormMessage" match="valueMissing">
                      Please enter the semi-major axis
                    </Form.Message>
                    <Form.Message className="FormMessage" match="typeMismatch">
                      Please provide a valid semi-major axis
                    </Form.Message>
                  </div>
                  <Form.Control asChild>
                    <input className="FormInput" type="number" required />
                  </Form.Control>
                </Form.Field>

                <Form.Field className="FormField" name="inclination">
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                    <Form.Label className="FormLabel">Inclination [degrees]</Form.Label>
                    <Form.Message className="FormMessage" match="valueMissing">
                      Please enter the inclination
                    </Form.Message>
                    <Form.Message className="FormMessage" match="typeMismatch">
                      Please provide a valid inclination
                    </Form.Message>
                  </div>
                  <Form.Control asChild>
                    <input className="FormInput" type="number" required />
                  </Form.Control>
                </Form.Field>

                <Form.Field className="FormField" name="expected_life">
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                    <Form.Label className="FormLabel">Expected Life [years]</Form.Label>
                    <Form.Message className="FormMessage" match="valueMissing">
                      Please enter the expected life
                    </Form.Message>
                    <Form.Message className="FormMessage" match="typeMismatch">
                      Please provide a valid expected life
                    </Form.Message>
                  </div>
                  <Form.Control asChild>
                    <input className="FormInput" type="number" required />
                  </Form.Control>
                </Form.Field>

                <Form.Field className="FormField" name="launch_mass">
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                    <Form.Label className="FormLabel">Launch Mass [kg]</Form.Label>
                    <Form.Message className="FormMessage" match="valueMissing">
                      Please enter the launch mass
                    </Form.Message>
                    <Form.Message className="FormMessage" match="typeMismatch">
                      Please provide a valid launch mass
                    </Form.Message>
                  </div>
                  <Form.Control asChild>
                    <input className="FormInput" type="number" required />
                  </Form.Control>
                </Form.Field>

                <Form.Submit asChild>
                  <button className="FormButton" style={{ marginTop: 10 }}>
                    Predict!
                  </button>
                </Form.Submit>
              </Form.Root>
              */}
              
              <div id="query-response" style={{ fontFamily:'monospace' }}>
                  {this.props.isResponding===2 ? (
                    <div>Output: {this.props.apiData["network_input"]}</div>
                  ) : (this.props.isResponding===1 ? (
                    <div>Getting your reply...</div>
                  ) : (
                    <div></div>
                  )
                  )}
                </div>
              </Flex>
            </Box>
            <Separator orientation='vertical' style = {{ height: window.innerHeight-152, position: 'fixed', left: window.innerWidth * 0.5, bottom: (window.innerHeight-92) * 0.5, transform: `translateY(${(window.innerHeight - 152) / 2}px)` }}/>
            <Box style={{ flexBasis: '50%', justifyContent: 'center', alignItems: 'center' }}>
              {/* This will render the images, if they exist */}
              <Flex direction="column" gap="2" style={{ justifyContent: 'center', alignItems: 'center', padding: '30px 30px' }}>
                {this.props.img ? (
                  <img src={this.props.img} alt={`No plots yet`} onLoad={() => {}/*URL.revokeObjectURL(this.props.img)*/}/>
                ) : (
                  <div>No image available. Try reloading the page? If this problem persists, please contact us.</div>
                )}
              {/* TODO: Turn this into a pretty animation */}
              </Flex>
            </Box>
          </Flex>
        )}
        </Tabs.Content>
        </Box>
        </Tabs.Root>

      <Joyride
        steps={this.state.steps}
        run={this.state.runTutorial}
        continuous={true}
        disableOverlayClose={true}
        disableCloseOnEsc={false}
        disableScrolling={true}
        callback={this.handleJoyrideCallback}
        locale={{ last: 'Finish' }}
      />
      </Theme>
    </div>
  )}
}

export default BuildingWrapper;