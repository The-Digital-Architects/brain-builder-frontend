/* eslint-disable no-lone-blocks */
import React, { useState, useEffect, useRef } from 'react';
import './css/App.css';
import { Theme, Box, Heading, Grid, IconButton } from '@radix-ui/themes';
import * as Slider from '@radix-ui/react-slider';
import '@radix-ui/themes/styles.css';
import tu_delft_pic from './images/tud_black_new.png';
import { Link, BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { HomeIcon, Link2Icon } from '@radix-ui/react-icons';
import axios from 'axios';
import BuildView from './buildView';
import Introduction from './introduction';
import QuizApp from './quiz';
import ManualTask from './customBlocks';
import Tutorial from './tutorial';
import FeedbackApp from './feedback';
import LinksPage from './links';
import NotFound from './common/notFound';
import DefaultView from './defaultView';
import NotebookView from './notebookView';
import JupyterLite from './jupyterLiteView';
import StartPage from './startpage/startPage';
import { generateCytoElements, generateCytoStyle } from './utils/cytoUtils';
import getCookie from './utils/cookieUtils';
import putRequest from './utils/websocketUtils';
import ClusteringTest from './clustering'

// ------- APP FUNCTION -------

function App() {

  // Setting the interval- and timing-related states
  const intervalTimeout = 20000;  // in milliseconds, the time to wait before ending the interval
  const pendingTime = 1000;  // in milliseconds, the time to wait when putting or posting a request -> set this close to 0 in production, but higher for debugging

  // ------- WINDOW RESIZING -------

  function getWindowSize() {
    const {innerWidth, innerHeight} = window;
    return {innerWidth, innerHeight};
  }
  
  // eslint-disable-next-line no-unused-vars
  const [windowSize, setWindowSize] = useState(getWindowSize());

  // update window size when window is resized
  useEffect(() => {
    function handleWindowResize() {
      setWindowSize(getWindowSize());
    }

    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  const loadData = (taskId, index, normalization) => {
    setIsTraining(prevIsTraining => {
      const newIsTraining = [...prevIsTraining];
      newIsTraining[index] = -1;
      return newIsTraining;
    });
    var userId = getCookie('user_id');
    var csrftoken = getCookie('csrftoken');

    normalization = false;  // TODO: make this an actual variable

    const inData = {
      learning_rate: 0,
      epochs: 0,
      normalization: normalization, 
      activations_on: true,
      network_input: JSON.stringify([]),
      games_data: gamesData,
    }
    
    const dataData = {
      action: 0,
      user_id: userId,
      task_id: taskId,
      in_out: JSON.stringify(inData),
    };
    // first, set up the websocket
    const ws = new WebSocket(`wss://${window.location.host}/ws/${userId}/`);
    let timeoutId;

    ws.onclose = () => {

      setIsTraining(prevIsTraining => {
        const newIsTraining = [...prevIsTraining];
        newIsTraining[index] = 0;
        return newIsTraining;
      });
      console.log('WebSocket connection closed');
    };

    ws.onopen = () => {
      console.log('WebSocket connection opened');

      // now, check if there is an entry in /api/backend:
      axios.get(window.location.origin + `/api/backend/?user_id=${userId}&task_id=${taskId}`, {
        headers: {
          'X-CSRFToken': csrftoken
        }
      }).then((response) => {
        if (response.data.length > 0) {
          // If the record exists, update it
          let pk = response.data[0].pk;
          axios.put(window.location.origin + `/api/backend/${pk}`, dataData, {
            headers: {
              'X-CSRFToken': csrftoken
            }, 
            timeout: pendingTime
          }).catch((error) => {
            console.error(error);
          });
        } else {
          // If the record does not exist, throw an error
          throw new Error('No Record in /api/backend');
        };
      }).catch((error) => {
        console.error(error);
        if (error.message === 'No Record in /api/backend' || error.code === 'ECONNABORTED') {
          // If the record doesn't exist or the GET times out, post a new record
          console.log('No record found, creating a new one'); 
          axios.post(window.location.origin + "/api/backend/", dataData, {
            headers: {
              'X-CSRFToken': csrftoken
            }, 
            timeout: pendingTime
          }).catch((error) => {
            console.error(error);
          })
        }
      });
    };
    timeoutId = setTimeout(() => {
      ws.close();
      console.log('Failed to load data for exercise ' + taskId/10);
      alert("Failed to load data for exercise " + taskId/10 + ". Try reloading the page, if the problem persists, please contact us.");
    }, intervalTimeout); // stop after n milliseconds

    ws.onmessage = function(event) {
      const data = JSON.parse(event.data);
      if (data.header === "data") { 

        setFeatureNames(prevFeatureNames => {
          const newFeatureNames = [...prevFeatureNames];
          newFeatureNames[index] = data.feature_names;
          return newFeatureNames;
        });

        setNObjects(prevNObjects => {
          const newNObjects = [...prevNObjects];
          newNObjects[index] = data.n_objects;
          return newNObjects;
        });

        // decompress and parse the images in 'plot'
        setInitPlots(prevInitPlots => {
          const newInitPlots = [...prevInitPlots];
          const binaryString = atob(data.plot);  // decode from base64 to binary string
          const bytes = new Uint8Array(binaryString.length);  // convert from binary string to byte array
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);  // now bytes contains the binary image data
          }
          const blob = new Blob([bytes.buffer], { type: 'image/jpeg' });
          const url = URL.createObjectURL(blob);
          // now images can be accessed with <img src={url} />
          newInitPlots[index] = url;
          return newInitPlots;
        });
        console.log(`Data for exercise ${taskId/10} loaded`)
        ws.close();
        clearTimeout(timeoutId);
      } else {
        console.log("Received unexpected message from backend: ", data);
      }
    };

    ws.onerror = function(event) {
      alert("Failed to load data for exercise " + taskId/10 + ". Try reloading the page, if the problem persists, please contact us.");
      console.error('Error:', event);
    };
    };

  const fetchQueryResponse = (setApiData, setIsResponding, taskId, index) => {  // updates the apiData state with the response from the backend
    var userId = getCookie('user_id');
    var csrftoken = getCookie('csrftoken');

    axios.get(window.location.origin + `/api/backend/?user_id=${userId}&task_id=${taskId}`, {
      headers: {
        'X-CSRFToken': csrftoken
      }
    })
      .then((response) => {
        setApiData(prevApiData => {
          const newApiData = [...prevApiData];
          newApiData[index] = response.data[0];
          return newApiData;
        });
        console.log(response.data[0]);
      })
      .catch((error) => {
        console.error(`Error fetching API data: ${error}`);
      });
    setIsResponding(prevIsResponding => {
        const newIsResponding = [...prevIsResponding];
        newIsResponding[index] = 2;
        return newIsResponding;
      });
    console.log("Response received")
  };

  let accuracyColor = 'var(--slate-11)';

  // this is for all the tasks
  const defaultTaskIds = [11, 12];
  const [taskData, setTaskData] = useState([]);
  const [taskNames, setTaskNames] = useState({})
  const [taskIds, setTaskIds] = useState(defaultTaskIds);
  const [NNTaskIds, setNNTaskIds] = useState(defaultTaskIds);
  const [taskIcons, setTaskIcons] = useState(defaultTaskIds.map(() => null));
  const [gamesData, setGamesData] = useState(JSON.stringify([{task_id: 11, n_inputs: 4, n_outputs: 3, type: 1, dataset: 'Clas2.csv'}, {task_id: 12, n_inputs: 4, n_outputs: 3, type: 1, dataset: 'load_iris()'}]));
  const [typ, setTyp] = useState(defaultTaskIds.map(() => 1));
  const [dataset, setDataset] = useState(defaultTaskIds.map(() => 'Clas2.csv'));
  const [initPlots, setInitPlots] = useState(defaultTaskIds.map(() => []));
  const [nInputs, setNInputs] = useState(defaultTaskIds.map(() => 4));
  const [nOutputs, setNOutputs] = useState(defaultTaskIds.map(() => 3));
  const [nObjects, setNObjects] = useState(defaultTaskIds.map(() => 0));
  const [isResponding, setIsResponding] = useState(defaultTaskIds.map(() => 0));

  // this is for the neural network tasks
  const [maxEpochs, setMaxEpochs] = useState(defaultTaskIds.map(() => 200));
  const [maxLayers, setMaxLayers] = useState(defaultTaskIds.map(() => 10));
  const [maxNodes, setMaxNodes] = useState(defaultTaskIds.map(() => 16));
  const [normalization, setNormalization] = useState(defaultTaskIds.map(() => true));
  const [normalizationVisibility, setNormalizationVisibility] = useState([false]);
  const [afs, setAfs] = useState(defaultTaskIds.map(() => []));
  const [afVisibility, setAfVisibility] = useState(defaultTaskIds.map(() => false));
  const [iterationsSliderVisibility, setIterationsSliderVisibility] = useState([false]);
  const [lrSliderVisibility, setLRSliderVisibility] = useState(defaultTaskIds.map(() => false));
  const [imageVisibility, setImageVisibility] = useState(defaultTaskIds.map(() => false));
  const [cytoLayers, setCytoLayers] = useState(defaultTaskIds.map(() => []));
  const [isTraining, setIsTraining] = useState(defaultTaskIds.map(() => false));
  const [apiData, setApiData] = useState(defaultTaskIds.map(() => null));
  const [accuracy, setAccuracy] = useState(defaultTaskIds.map(() => 0));
  // setting default values for the network-related states
  const [progress, setProgress] = useState(defaultTaskIds.map(() => -1));
  const [errorList, setErrorList] = useState(defaultTaskIds.map(() => [[], null]));
  const [featureNames, setFeatureNames] = useState(defaultTaskIds.map(() => []));
  const [weights, setWeights] = useState(defaultTaskIds.map(() => []));
  const [biases, setBiases] = useState(defaultTaskIds.map(() => []));
  const [imgs, setImgs] = useState(defaultTaskIds.map(() => []));

  // this is for the SVM tasks
  const [svmTaskIds, setSvmTaskIds] = useState([]);
  // TODO

  // this is for the basics tasks
  const [basicsTaskIds, setBasicsIds] = useState([]);
  // TODO
  const [manualRegressionId, setManualRegressionId] = useState(11); 
  const [manualRegressionDescription, setManualRegressionDescription] = useState('')

  // this is for the clustering tasks
  const [clusteringTaskIds, setClusteringIds] = useState([]);
  // TODO
  const customClusteringId = 72  // TODO: remove this after the demo

  // this is for the external links
  const [linkIds, setLinkIds] = useState([]);
  const [links, setLinks] = useState([]);

  // this is for the quizzes
  const [quizIds, setQuizIds] = useState([]);
  const [quizData, setQuizData] = useState([]);

  // this is for the intros
  const [introIds, setIntroIds] = useState([]);
  const [introData, setIntroData] = useState([]);


  function setAf(index, value) {
    setAfs(prevAfs => {
      const newAfs = [...prevAfs];
      newAfs[index] = value;
      return newAfs;
    });
  };




  // ------- FETCHING TASK DATA -------
  const currentNInputs = [];
  const currentNOutputs = [];
  const currentTaskIds = [];
  const currentTaskNames = {};
  const currentTyp = [];
  const currentDataset = [];
  const currentIcons = [];

  const currentNNTaskIds = [];
  const currentMaxEpochs = [];
  const currentMaxLayers = [];
  const currentMaxNodes = [];
  const currentNormalizationVisibility = [];
  const currentAfVisibility = [];
  const currentIterationsSliderVisibility = [];
  const currentLRSliderVisibility = [];
  const currentImageVisibility = [];
  const currentWeights = [];

  const currentSVMTaskIds = [];
  // TODO

  const currentBasicsTaskIds = [];
  // TODO

  const currentClusteringTaskIds = [];
  // TODO

  const currentLinkIds = [];
  const currentLinks = [];

  function readTaskEntry(entry) {
    if (!entry.visibility) {
      console.log("Skipping task " + entry.task_id)
    } else {

    // set TaskDescription states
    currentNInputs.push(entry.n_inputs);
    currentNOutputs.push(entry.n_outputs);
    currentTaskIds.push(entry.task_id);
    currentWeights.push([]);
    currentTaskNames[entry.task_id] = entry.short_name;
    currentTyp.push(entry.type);
    currentDataset.push(entry.dataset);

    // set NeuralNetworkDescription states
    let nnDescription = entry.neural_network_description;
    if (nnDescription) {
      currentNNTaskIds.push(entry.task_id);
      currentMaxEpochs.push(nnDescription.max_epochs);
      currentMaxLayers.push(nnDescription.max_layers);
      currentMaxNodes.push(nnDescription.max_nodes);
      currentNormalizationVisibility.push(nnDescription.normalization_visibility);
      currentAfVisibility.push(nnDescription.af_visibility);
      currentIterationsSliderVisibility.push(nnDescription.iterations_slider_visibility);
      currentLRSliderVisibility.push(nnDescription.lr_slider_visibility);
      currentImageVisibility.push(nnDescription.decision_boundary_visibility);
      currentIcons.push(null);
    } else {

      // set svm states
      let svmDescription = entry.svm_description;
      if (svmDescription) {
        currentSVMTaskIds.push(entry.task_id);
        // TODO
        currentIcons.push(null);
      } else {

        // set basics states
        let basicsDescription = entry.basics_description;
        if (basicsDescription) {
          currentBasicsTaskIds.push(entry.task_id);
          // TODO
          currentIcons.push(null);
        } else {

          // set clustering states
          let clusteringDescription = entry.clustering_description;
          if (clusteringDescription) {
            currentClusteringTaskIds.push(entry.task_id);
            // TODO
            currentIcons.push(null);
          } else {

            // set external link states
            if (entry.external_link) {
            currentLinkIds.push(entry.task_id)
            currentLinks.push(entry.external_link.url)
            currentIcons.push(Link2Icon);
            } else {
              currentIcons.push(null);
              console.log("Task " + entry.task_id + " is not implemented in the frontend.")
            }
          }
        }
      }
    }
    }
  }
  
  const [loadedTasks, setLoadedTasks] = useState(false);
  useEffect(() => {
    axios.get('/api/all_tasks/')
      .then(response => {
        const currentTaskData = response.data;
        currentTaskData.sort((a, b) => a.task_id - b.task_id); // sort the taskData by taskIds
        setTaskData(currentTaskData); 
        // IMPORTANT: taskData will include challenges with 'visibility' set to false
        console.log('currentTaskData: ', currentTaskData)  // for debugging
    
        currentTaskData.forEach(entry => {
          readTaskEntry(entry);
        });
    
        // Set universal states
        setTaskIds(currentTaskIds);
        setGamesData(JSON.stringify(currentTaskData));
        setNInputs(currentNInputs);
        setNOutputs(currentNOutputs);
        setNObjects(currentTaskIds.map(() => 0));
        setTaskNames(currentTaskNames);
        setTaskIcons(currentIcons);

        // Set neural network states
        setNNTaskIds(currentNNTaskIds);
        setMaxEpochs(currentMaxEpochs);
        setMaxLayers(currentMaxLayers);
        setMaxNodes(currentMaxNodes);
        setWeights(currentWeights);
        setNormalizationVisibility(currentNormalizationVisibility);
        setAfVisibility(currentAfVisibility);
        setIterationsSliderVisibility(currentIterationsSliderVisibility);
        setLRSliderVisibility(currentLRSliderVisibility);
        setImageVisibility(currentImageVisibility);

        // Set svm states
        setSvmTaskIds(currentSVMTaskIds);
        // TODO

        // Set basics states
        setBasicsIds(currentBasicsTaskIds);
        // TODO

        // Set clustering states
        setClusteringIds(currentClusteringTaskIds);
        // TODO

        // Set link states
        setLinkIds(currentLinkIds)
        setLinks(currentLinks)

        // Initialise the rest of the states 
        setTyp(currentTyp);
        setDataset(currentDataset);
        setCytoLayers(currentTaskIds.map(() => []));
        setIsTraining(currentTaskIds.map(() => 0));
        setApiData(currentTaskIds.map(() => null));
        setAccuracy(currentTaskIds.map(() => 0));
        setIsResponding(currentTaskIds.map(() => false));
        setProgress(currentTaskIds.map(() => 0));
        setErrorList(currentTaskIds.map(() => [[], null]));
        setFeatureNames(currentTaskIds.map(() => []));  // TODO: load these somewhere else
        setBiases(currentTaskIds.map(() => []));
        setImgs(currentTaskIds.map(() => []));
        setInitPlots(currentTaskIds.map(() => []));

          // some custom taskIds
        console.log(taskNames) // TODO: remove
        setManualRegressionId(Object.keys(taskNames).find(key => taskNames[key] === 'Linear Regr.'));
        setManualRegressionDescription(taskData.find(task => task.task_id === manualRegressionId).description);
        console.log("manualRegressionId & Description: ", manualRegressionId, manualRegressionDescription); // TODO remove this

        setLoadedTasks(true);
      })
      .catch(error => {
        console.error('Error fetching tasks:', error);
      });

    axios.get('/api/all_quizzes/')
      .then(response => {
        const currentQuizData = response.data;
        currentQuizData.sort((a, b) => a.quiz_id - b.quiz_id)// sort the quizData by quizIds
        setQuizData(currentQuizData);
        
        const currentQuizIds = [];

        currentQuizData.forEach(entry => {
          currentQuizIds.push(entry.quiz_id);
        });
        setQuizIds(currentQuizIds);
      })
      .catch(error => {
        console.error('Error fetching quizzes:', error);
        const defaultQuizIds = [];
        setQuizIds(defaultQuizIds);
        console.log("Setting default states instead.")
      });

      axios.get('/api/all_intros/')
      .then(response => {
        const currentIntroData = response.data;
        currentIntroData.sort((a, b) => a.intro_id - b.intro_id)// sort the introData by introIds
        setIntroData(currentIntroData);
        
        const currentIntroIds = [];

        currentIntroData.forEach(entry => {
          currentIntroIds.push(entry.intro_id);
        });
        setIntroIds(currentIntroIds);
      })
      .catch(error => {
        console.error('Error fetching intros:', error);
        const defaultIntroIds = [];
        setIntroIds(defaultIntroIds);
        console.log("Setting default states instead.")
      });
    
    setTimeout(() => {
      const isLikelyMobile = (window.innerWidth <= 768 && window.innerHeight/window.innerWidth <= 0.6) || window.innerWidth <= 480 || (window.innerHeight/window.innerWidth >= 1.75 && window.innerHeight <= 768);
      const message = isLikelyMobile
        ? "Welcome to brAIn bUIlder! Looks like you might be using a phone and we don't support mobile browsers just yet... Hope to see you soon on a computer!"
        : "Welcome to brAIn bUIlder! Please keep in mind that this is still a work in progress so bugs are possible. We'd love to hear your feedback. Have fun!";
      alert(message);
    }, 1000);

  }, []);



  // ------- PROCESSING TASK DATA -------
  
  const linksDict = linkIds.reduce((acc, curr, index) => {
    acc[curr] = links[index];
    return acc;
  }, {});
  
  useEffect(() => { 
    if (cytoLayers.every(subArray => subArray.length === 0)) {
      console.log("cytoLayers is empty, setting to default.");
      // cytoLayers is empty, set it to a default value
      NNTaskIds.forEach((taskId, index) => {
        localStorage.setItem(`cytoLayers${taskId}`, JSON.stringify([nInputs[index], nOutputs[index]]));
      });
    } else {
      // cytoLayers is not empty, proceed as usual
      cytoLayers.forEach((cytoLayer, index) => {
        localStorage.setItem(`cytoLayers${NNTaskIds[index]}`, JSON.stringify(cytoLayer));  // TODO: check if this works
        if (isTraining[index] !== -1) {
        setIsTraining(prevIsTraining => {
        const newIsTraining = [...prevIsTraining];
        newIsTraining[index] = 0;
        return newIsTraining;
      });
    }
    });
    }
  }, [cytoLayers, NNTaskIds, nInputs, nOutputs]);

  
  const loadLastCytoLayers = (setCytoLayers, apiData, setApiData, propertyName, taskId, index, nInputs, nOutputs) => {
    // Check localStorage for a saved setting
    const savedSetting = localStorage.getItem(propertyName);
    let goToStep2 = false;

    if (savedSetting && savedSetting !== '[]' && !JSON.parse(savedSetting).some(element => element === undefined)) {
        try {
            // If a saved setting is found, try to parse it from JSON
            const cytoLayersSetting = JSON.parse(savedSetting);
            // try to set the cytoLayers to the saved setting, if there is an error, set it to default
            setCytoLayers(prevCytoLayers => {
              const newCytoLayers = [...prevCytoLayers];
              console.log("setting cytoLayers to saved setting");
              newCytoLayers[index] = cytoLayersSetting;
              // console.log("saved setting:", cytoLayersSetting);
              // make the number of nodes in the first and last layer match the number of inputs and outputs
              newCytoLayers[index][0] = nInputs;  
              newCytoLayers[index][newCytoLayers[index].length - 1] = nOutputs;
              // console.log("new setting: ", newCytoLayers)  // for debugging
              return newCytoLayers;
            });
        }
        catch (error) {
            console.error(error);
            goToStep2 = true;
        }
    }
    else {goToStep2 = true;};

    var userId = getCookie('user_id');
    var csrftoken = getCookie('csrftoken');

    if (goToStep2) {
      axios.get(window.location.origin + `/api/backend/?user_id=${userId}&task_id=${taskId}`, {
        headers: {
          'X-CSRFToken': csrftoken
        }
      })
      .then((response) => {
            setApiData(prevApiData => {
              const newApiData = [...prevApiData];
              newApiData[index] = response.data[0];
              return newApiData;
            });
            if (typeof response.data[0] === 'undefined' || !response.data[0]["in_out"] || JSON.parse(response.data[0]["in_out"]).length === 0) {
              throw new Error('response.data[0] is undefined or in_out is empty');
            }
            setCytoLayers(prevCytoLayers => {
              const newCytoLayers = [...prevCytoLayers];
              newCytoLayers[index] = JSON.parse(response.data[0]["in_out"]);
              // make the number of nodes in the first and last layer match the number of inputs and outputs
              newCytoLayers[index][0] = nInputs;
              newCytoLayers[index][newCytoLayers[index].length - 1] = nOutputs;
              return newCytoLayers;
            });
      })
      .catch((error) => {
        console.error(error);
        console.log("setting cytoLayers to default");
            setCytoLayers(prevCytoLayers => {
              const newCytoLayers = [...prevCytoLayers];
              newCytoLayers[index] = [nInputs, nOutputs];
              return newCytoLayers;
            });
      });
    }
  };

  const [cytoElements, setCytoElements] = useState([]);
  const [cytoStyle, setCytoStyle] = useState([]);

  // Update the state when the dependencies change
  useEffect(() => {
    setCytoElements(NNTaskIds.map((taskId, index) => {
      return generateCytoElements(cytoLayers[index], apiData[index], isTraining[index], weights[index], biases[index])
      }
    ));
  }, [NNTaskIds, cytoLayers, apiData, isTraining, weights, biases]);

  useEffect(() => {
    setCytoStyle(NNTaskIds.map((taskId, index) => 
      generateCytoStyle(cytoLayers[index])
    ));
  }, [NNTaskIds, cytoLayers]);


  const cancelRequestRef = useRef(null);



  // ------- FORMS -------

  const handleSubmit = (event, setIsResponding, setApiData, taskId, index) => {
  event.preventDefault();
  setIsResponding(prevIsResponding => {
    const newIsResponding = [...prevIsResponding];
    newIsResponding[index] = 1;
    return newIsResponding;
  });

  var userId = getCookie('user_id');
  var csrftoken = getCookie('csrftoken');

  axios.get(window.location.origin + `/api/backend/?user_id=${userId}&task_id=${taskId}`, {
    headers: {
      'X-CSRFToken': csrftoken
    }
  })
    .then((response) => {
      const networkData = response.data[0];
      const formData = new FormData(event.target);
      const values = Array.from(formData.values()).map((value) => Number(value));
      networkData.network_input = JSON.stringify(values);
      networkData.action = 2;
      networkData.games_data = gamesData;
      axios.put(window.location.origin + `/api/backend/${networkData.pk}`, networkData, {
        headers: {
          'X-CSRFToken': csrftoken
        }
      })
        .then((response) => {
          console.log(`response status: ${response.status}`);
          fetchQueryResponse(setApiData, setIsResponding, taskId, index);
        })
        .catch((error) => {
          console.error(error);
        });
    })
    .catch((error) => {
      console.error(error);
    });
  };


  // ------- SLIDERS -------

  // initialize an array to store the state for each slider
  const [iterations, setIterations] = useState(Array(NNTaskIds.length).fill(100));
  const [learningRate, setLearningRate] = useState(Array(NNTaskIds.length).fill(0.01));

  const handleIterationChange = (index, value) => {
    setIterations(prev => {
      const newIterations = [...prev];
      newIterations[index] = value[0] * 2;
      return newIterations;
    });
  };
  
  const handleLearningRateChange = (index, value) => {
    setLearningRate(prev => {
      const newLearningRates = [...prev];
      newLearningRates[index] = (10 ** ((value[0]/-20)-0.33)).toFixed(Math.round((value[0]+10) / 20));
      return newLearningRates;
    });
  };

  const iterationsSliders = NNTaskIds.map((taskId, index) => {
    return (
      <Slider.Root
        key={index}
        className="SliderRoot"
        defaultValue={[null]} //maxEpochs[index] ? maxEpochs[index] / 4 : 25
        onValueChange={(value) => handleIterationChange(index, value)}
        max={maxEpochs[index] ? maxEpochs[index] / 2 : 50}
        step={0.5}
        style={{ width: Math.round(0.19 * (window.innerWidth * 0.97)) }}
        disabled={isTraining[index] === 1}
      >
        <Slider.Track className="SliderTrack" style={{ height: 3 }}>
          <Slider.Range className="SliderRange" />
        </Slider.Track>
        <Slider.Thumb className="SliderThumb" aria-label="Iterations" />
      </Slider.Root>
    );
  });

  const learningRateSliders = NNTaskIds.map((challenge, index) => {
    return (
      <Slider.Root
        key={index}
        className="SliderRoot"
        defaultValue={[null]} //40
        onValueChange={(value) => handleLearningRateChange(index, value)}
        max={70}
        step={10}
        style={{ width: Math.round(0.19 * (window.innerWidth * 0.97)) }}
        disabled={isTraining[index] === 1}
      >
        <Slider.Track className="SliderTrack" style={{ height: 3 }}>
          <Slider.Range className="SliderRange" />
        </Slider.Track>
        <Slider.Thumb className="SliderThumb" aria-label="Learning Rate" />
      </Slider.Root>
    );
  });


  const updateCytoLayers = (setCytoLayers, nOfInputs, nOfOutputs, index) => {
    setCytoLayers(prevCytoLayers => {
      const newCytoLayers = [...prevCytoLayers];
      newCytoLayers[index] = newCytoLayers[index].map((layer, i) => {
        if (i === 0) {
          return nOfInputs;
        } else if (i === newCytoLayers[index].length - 1) {
          return nOfOutputs;
        } else {
          return layer;
        }
      });
  
      return newCytoLayers;
    });
  };

  const [levelNames, setLevelNames] = useState(["Introduction to AI", "Classification", "Neural Networks Part 1", "Neural Networks Part 2", "Dimensionality Reduction", "Ethics & Green AI", "Clustering"]);
  
  // ------- RETURN THE APP CONTENT -------
  return (
    <body class='light-theme' >
      <Theme accentColor="cyan" grayColor="slate" panelBackground="solid" radius="large" appearance='light'>
      <Router>
        <Routes>
          <Route path="/" element={<StartPage levelNames={levelNames} taskNames={taskNames} introData={introData} quizData={quizData} taskIds={taskIds} taskIcons={taskIcons} quizIds={quizIds} introIds={introIds} links={linksDict} userId={getCookie('user_id')} />} />
          
          {introIds.map((introId, index) => (
            <>
            { introData[index].visibility &&
              <Route path={`/introduction${introId}`} element={
                <Introduction introId={introId}/>
              } />
            }
            </>
          ))}

          <Route path="/tutorial" element={
            <Tutorial
              nOfInputs={4}
              nOfOutputs={3}
              maxLayers={10}
              taskId={0}
              index={null}
              updateCytoLayers={null}
              loadLastCytoLayers={null}
              iterations={null}
              setIterations={null}
              learningRate={null}
              setLearningRate={null}
              isTraining={0}
              setIsTraining={null}
              apiData={null}
              setApiData={null}
              taskData={null}
              setTaskData={null}
              putRequest={null}
              accuracy={null}
              setAccuracy={null}
              accuracyColor={accuracyColor}
              handleSubmit={null}
              isResponding={null}
              setIsResponding={null}
              progress={null}
              featureNames={null}
              errorList={null}
              img={null}
              loadData={null}
              normalization={null}
              normalizationVisibility={true}
              af={null}
              afVisibility={true}
              iterationsSliderVisibility={true}
              lrSliderVisibility={true}
              initPlot={null}
              setProgress={null}
              setErrorList={null}
              setWeights={null}
              setBiases={null}
              maxNodes={maxNodes}
            />
          }/>

          <Route path="/notebookTest" element={
            <NotebookView
            host = {window.location.host}
            notebookPath = {'test.ipynb'}
            userId = {getCookie('user_id')}
            />
          } />

          <Route path="/jupyterLite" element={<JupyterLite />}/>

          <Route path="/clusteringTest" element={<ClusteringTest />}/>

          <Route path={`/exercise${customClusteringId/10}`} element={<ClusteringTest />} />

          <Route path={`/exercise${manualRegressionId/10}`} element={
            <ManualTask
            type = {'ManualRegression'}
            host = {window.location.host}
            customId = {manualRegressionId}
            userId = {getCookie('user_id')}
            description = {manualRegressionDescription}
            />
          } />

          {NNTaskIds.map((taskId, index) => (
            <>
            <Route
              key={taskId}
              path={`/exercise${taskId/10}`}
              element={
                <>
                <BuildView
                  nOfInputs={nInputs[index]}
                  nOfOutputs={nOutputs[index]}
                  nOfObjects={nObjects[index]}
                  maxLayers={maxLayers[index]}
                  taskId={taskId}
                  index={index}
                  cytoElements={cytoElements[index]}
                  cytoStyle={cytoStyle[index]}
                  cytoLayers={cytoLayers[index]}
                  setCytoLayers={setCytoLayers}
                  updateCytoLayers={updateCytoLayers}
                  loadLastCytoLayers={loadLastCytoLayers}
                  iterationsSlider={iterationsSliders[index]}
                  iterations={iterations[index]}
                  setIterations={setIterations}
                  learningRateSlider={learningRateSliders[index]}
                  learningRate={learningRate[index]}
                  setLearningRate={setLearningRate}
                  isTraining={isTraining[index]}
                  setIsTraining={setIsTraining}
                  apiData={apiData[index]}
                  setApiData={setApiData}
                  taskData={taskData}
                  setTaskData={setTaskData}
                  putRequest={putRequest}
                  accuracy={accuracy[index]}
                  setAccuracy={setAccuracy}
                  accuracyColor={accuracyColor}
                  handleSubmit={handleSubmit}
                  isResponding={isResponding[index]}
                  setIsResponding={setIsResponding}
                  progress={progress[index]}
                  featureNames={featureNames[index]}
                  errorList={errorList[index]}
                  weights={weights[index]}
                  biases={biases[index]}
                  imgs={imgs[index]}
                  initPlot={initPlots[index]}
                  loadData={loadData}
                  normalization={false}
                  normalizationVisibility={normalizationVisibility[index]}
                  af={afs[index]}
                  setAf={setAf}
                  afVisibility={afVisibility[index]}
                  iterationsSliderVisibility={iterationsSliderVisibility[index]}
                  lrSliderVisibility={lrSliderVisibility[index]}
                  imageVisibility={imageVisibility[index]}
                  setProgress={setProgress}
                  setErrorList={setErrorList}
                  setWeights={setWeights}
                  setBiases={setBiases}
                  pendingTime={pendingTime}
                  cancelRequestRef={cancelRequestRef}
                  maxNodes={maxNodes}
                  setImgs={setImgs}
                  userId={getCookie('user_id')}
                  intervalTimeout={intervalTimeout}
                  typ={typ[index]}
                  dataset={dataset[index]}
                />
                </>
              }
            />
            </>
          ))}
          {quizIds.map((quizId, index) => (
            <>
            { quizData[index].visibility &&
            <Route
            key={quizId}
            path={`/quiz${quizId}`}
            element={
              <div className="App">
                <Box py="2" style={{ backgroundColor: "var(--cyan-10)"}}>
                <Grid columns='3' mt='1'>
                  <Box ml='3' style={{display:"flex"}}>  
                    <Link to="/">
                      <IconButton aria-label="navigate to home" height='21' style={{ marginLeft: 'auto', color: 'inherit', textDecoration: 'none' }}>
                        <HomeIcon color="white" height='18' style={{ marginTop: 2 }} />
                      </IconButton>
                    </Link>
                  </Box>
                  <Link to={window.location.origin} style={{ textDecoration: 'none' }}>
                  <Heading as='h1' align='center' size='6' style={{ color: 'var(--gray-1)', marginTop: 2, marginBottom: 0, textDecoration: 'none', fontFamily:'monospace, Courier New, Courier' }}>brAIn builder</Heading>
                  </Link>
                  <Box align='end' mr='3' >
                      <Link to="https://www.tudelft.nl/en/" target="_blank" style={{ textDecoration: 'none'}}>
                      <img src={tu_delft_pic} alt='Tu Delft Logo' width='auto' height='30'/>
                      </Link>
                  </Box>
                </Grid>
                </Box>
                <QuizApp quizId={quizId} />
              </div>
            }/>
            }
            </>
          ))}

          <Route path={`/feedback`} element={
            <div className="App">
            <Box py="2" style={{ backgroundColor: "var(--cyan-10)"}}>
            <Grid columns='3' mt='1'>
              <Box ml='3' style={{display:"flex"}}>  
                <Link to="/">
                  <IconButton aria-label="navigate to home" height='21' style={{ marginLeft: 'auto', color: 'inherit', textDecoration: 'none' }}>
                    <HomeIcon color="white" height='18' style={{ marginTop: 2 }} />
                  </IconButton>
                </Link>
              </Box>
              <Link to={window.location.origin} style={{ textDecoration: 'none' }}>
              <Heading as='h1' align='center' size='6' style={{ color: 'var(--gray-1)', marginTop: 2, marginBottom: 0, textDecoration: 'none', fontFamily:'monospace, Courier New, Courier' }}>brAIn builder</Heading>
              </Link>
              <Box align='end' mr='3' >
                  <Link to="https://www.tudelft.nl/en/" target="_blank" style={{ textDecoration: 'none'}}>
                  <img src={tu_delft_pic} alt='Tu Delft Logo' width='auto' height='30'/>
                  </Link>
              </Box>
            </Grid>
            </Box>
            <FeedbackApp host={window.location.origin} cookie={getCookie('csrftoken')} />
          </div>
          } />
          <Route path={`/links`} element={
            <LinksPage/>
          } />

          <Route path="/exercise:id" element={
            <DefaultView/>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      </Theme>
    </body>
  );
}

export default App;