/* eslint-disable no-lone-blocks */
import React, { useState, useEffect, useRef } from 'react';
import './css/App.css';
import { Theme, Box, Heading, Grid, IconButton } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import tu_delft_pic from './images/tud_black_new.png';
import { Link, BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { HomeIcon, Link2Icon } from '@radix-ui/react-icons';
import axios from 'axios';
import BuildView from './newBuildView';
import Introduction from './introduction';
import QuizApp from './quiz';
import OtherTask from './otherTasks';
import FeedbackApp from './feedback';
import LinksPage from './links';
import NotFound from './common/notFound';
import Header from './common/header';
import SvmView from './svmView';
import ConstructionView from './common/constructionView';
import StartPage from './startpage/startPage';
import { generateCytoElements, generateCytoStyle } from './utils/cytoUtils';
import getCookie from './utils/cookieUtils';
import putRequest from './utils/websockets/websocketUtils';
import ClusteringTest from './clustering'
import sensitiveDataPlot from './images/sensitive_kerbals.png';

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

  const loadData = (taskId, index) => {
    // TODO: INDICES !!!

    setIsTraining(prevIsTraining => {
      const newIsTraining = [...prevIsTraining];
      newIsTraining[index] = -1;
      return newIsTraining;
    });
    var userId = getCookie('user_id');
    var csrftoken = getCookie('csrftoken');

    let normalization = false;  // TODO: make this an actual variable

    const checkGamesData = () => {
      if (gamesData) {

        const inData = {
          learning_rate: 0,
          epochs: 0,
          normalization: normalization, 
          activations_on: true,
          network_input: JSON.stringify([]),
          games_data: gamesData,
        };
        
        const dataData = {
          action: 0,
          user_id: userId,
          task_id: taskId,
          in_out: JSON.stringify(inData),
        };

        // set up the websocket
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
              if (newInitPlots[index]) {URL.revokeObjectURL(newInitPlots[index])};  // revoke the old URL
    
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
      } else {
        console.log(`Waiting for gamesData to be populated... (it's now ${gamesData}, nInputs is ${nInputs})`)
        setTimeout(checkGamesData, 500); // Check again after 0.5 second
      }
    };

    checkGamesData();
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
  const defaultTaskIds = [11, 12, 13, 21, 22, 31, 41, 51, 61, 71];
  const [taskData, setTaskData] = useState([]);
  const [taskNames, setTaskNames] = useState({})
  const [taskIds, setTaskIds] = useState(defaultTaskIds);
  const [taskIcons, setTaskIcons] = useState(defaultTaskIds.map(() => null));
  const [fileNames, setFileNames] = useState(defaultTaskIds.map(() => ''));
  const [functionNames, setFunctionNames] = useState(defaultTaskIds.map(() => ''));
  const [gamesData, setGamesData] = useState("");
  const [typ, setTyp] = useState(defaultTaskIds.map(() => 1));
  const [dataset, setDataset] = useState(defaultTaskIds.map(() => 'Clas2.csv'));
  const [featureNames, setFeatureNames] = useState(defaultTaskIds.map(() => []));
  const [initPlots, setInitPlots] = useState(defaultTaskIds.map(() => null));
  const [nInputs, setNInputs] = useState(defaultTaskIds.map(() => 1));
  const [nOutputs, setNOutputs] = useState(defaultTaskIds.map(() => 1));
  const [nObjects, setNObjects] = useState(defaultTaskIds.map(() => 0));  // TODO are we using this?
  const [isResponding, setIsResponding] = useState(defaultTaskIds.map(() => 0));
  const [isTraining, setIsTraining] = useState(defaultTaskIds.map(() => false));
  const [apiData, setApiData] = useState(defaultTaskIds.map(() => null));
  const [accuracy, setAccuracy] = useState(defaultTaskIds.map(() => 0));

  // this is for the neural network tasks
  const [NNTaskIds, setNNTaskIds] = useState(defaultTaskIds);
  const [sensitiveIds, setSensitiveIds] = useState([])
  const [maxEpochs, setMaxEpochs] = useState(defaultTaskIds.map(() => 200));
  const [maxLayers, setMaxLayers] = useState(defaultTaskIds.map(() => 10));
  const [maxNodes, setMaxNodes] = useState(defaultTaskIds.map(() => 16));
  const [normalizationVisibility, setNormalizationVisibility] = useState([false]);
  const [afVisibility, setAfVisibility] = useState(defaultTaskIds.map(() => false));
  const [afOptions, setAfOptions] = useState(defaultTaskIds.map(() => []));
  const [optimOptions, setOptimOptions] = useState(defaultTaskIds.map(() => []));
  const [iterationsSliderVisibility, setIterationsSliderVisibility] = useState([false]);
  const [lrSliderVisibility, setLRSliderVisibility] = useState(defaultTaskIds.map(() => false));
  const [imageVisibility, setImageVisibility] = useState(defaultTaskIds.map(() => false));
  const [cytoLayers, setCytoLayers] = useState(defaultTaskIds.map(() => []));
  // setting default values for the network-related states
  const [NNProgress, setNNProgress] = useState(defaultTaskIds.map(() => -1));
  const [errorList, setErrorList] = useState(defaultTaskIds.map(() => [[], null]));
  const [weights, setWeights] = useState(defaultTaskIds.map(() => []));
  const [biases, setBiases] = useState(defaultTaskIds.map(() => []));
  const [imgs, setImgs] = useState(defaultTaskIds.map(() => null));

  // this is for the SVM tasks
  const [SVMTaskIds, setSVMTaskIds] = useState([21]);
  const [cSliderVisibility, setCSliderVisibility] = useState([]);
  const [gammaSliderVisibility, setGammaSliderVisibility] = useState([]);
  const [rbfVisibility, setRbfVisibility] = useState([]);
  // TODO

  // this is for the basics tasks
  const [basicsTaskIds, setBasicsIds] = useState([]);
  // TODO

  // this is for the clustering tasks
  const [clusteringTaskIds, setClusteringIds] = useState([]);

  // this is for the external links
  const [linkIds, setLinkIds] = useState([]);
  const [links, setLinks] = useState([]);

  // this is for the quizzes
  const [quizIds, setQuizIds] = useState([]);
  const [quizData, setQuizData] = useState([]);

  // this is for the intros
  const [introIds, setIntroIds] = useState([]);
  const [introData, setIntroData] = useState([]);

  const [otherTasks, setOtherTasks] = useState({11: 'ManualLinReg', 12: 'ManualPolyReg', 13: 'ManualMatrix', 51: 'ManualPCA', 61: 'ManualEmissions'});	
  const [otherDescriptions, setOtherDescriptions] = useState({11: 'ManualLinRegDescription', 12: 'ManualPolyRegDescription', 13: 'ManualMatrixDescription', 51: 'ManualPCADescription', 61: [["ManualEmissionsDescription", null]]});
  const [constructionTaskIds, setConstructionTaskIds] = useState([23]);



  // ------- FETCHING TASK DATA -------

  const currentFileNames = [];
  const currentFunctionNames = [];
  const currentNInputs = [];
  const currentNOutputs = [];
  const currentTaskIds = [];
  const currentTaskNames = {};
  const currentTyp = [];
  const currentDataset = [];
  const currentIcons = [];

  const currentNNTaskIds = [];
  const currentSensitiveIds = [];
  const currentMaxEpochs = [];
  const currentMaxLayers = [];
  const currentMaxNodes = [];
  const currentNormalizationVisibility = [];
  const currentAfVisibility = [];
  const currentAfOptions = [];
  const currentOptimOptions = [];
  const currentIterationsSliderVisibility = [];
  const currentLRSliderVisibility = [];
  const currentImageVisibility = [];
  const currentWeights = [];

  const currentSVMTaskIds = [];
  const currentCSliderVisibility = [];
  const currentGammaSliderVisibility = [];
  const currentRbfVisibility = [];
  // TODO

  const currentBasicsTaskIds = [];
  // TODO

  const currentClusteringTaskIds = [];
  // TODO

  const currentLinkIds = [];
  const currentLinks = [];

  const currentOtherTasks = {};
  const currentOtherDescriptions = {};
  const currentConstructionTaskIds = [];

  function convertToList(string, separator=';') {
    if (string) {
      if (string[0] === '[') {
        return JSON.parse(string);
      } else { 
      return string.split(separator).map((item) => item.trim());
    }} else {
      return [];
    }
  }

  function readTaskEntry(entry) {
    if (!entry.visibility) {
      console.log("Skipping task " + entry.task_id)
    } else {

    // set TaskDescription states
    currentFileNames.push(entry.file_name);
    currentFunctionNames.push(entry.function_name);
    currentNInputs.push(entry.n_inputs);
    currentNOutputs.push(entry.n_outputs);
    currentTaskIds.push(entry.task_id);
    currentWeights.push([]);
    currentTaskNames[entry.task_id] = entry.short_name;
    currentTyp.push(entry.type);
    currentDataset.push(entry.dataset);

    if (entry.other_task) {
      currentOtherTasks[entry.task_id] = entry.other_task;
      currentOtherDescriptions[entry.task_id] = JSON.parse(entry.description);
      currentIcons.push(null);
    } else {

      // set NN states
      let nnDescription = entry.neural_network_description;
      if (nnDescription) {
        if (nnDescription.sensitive_data) {currentSensitiveIds.push(entry.task_id)};
        currentNNTaskIds.push(entry.task_id);
        currentMaxEpochs.push(nnDescription.max_epochs);
        currentMaxLayers.push(nnDescription.max_layers);
        currentMaxNodes.push(nnDescription.max_nodes);
        currentNormalizationVisibility.push(nnDescription.normalization_visibility);
        currentAfVisibility.push(nnDescription.af_visibility);
        currentAfOptions.push(convertToList(nnDescription.af_options));
        currentOptimOptions.push(convertToList(nnDescription.optimizer_options));
        currentIterationsSliderVisibility.push(nnDescription.iterations_slider_visibility);
        currentLRSliderVisibility.push(nnDescription.lr_slider_visibility);
        currentImageVisibility.push(nnDescription.decision_boundary_visibility);
        currentIcons.push(null);
      } else {

        // set svm states
        let svmDescription = entry.svm_description;
        if (svmDescription) {
          currentSVMTaskIds.push(entry.task_id);
          currentCSliderVisibility.push(svmDescription.c_slider_visibility);
          currentGammaSliderVisibility.push(svmDescription.gamma_slider_visibility);
          currentRbfVisibility.push(svmDescription.rbf_visibility);
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
                currentConstructionTaskIds.push(entry.task_id);
                currentIcons.push(null);
                console.log("Task " + entry.task_id + " is not implemented in the frontend.")
              }
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
        setFileNames(currentFileNames);
        setFunctionNames(currentFunctionNames);
        setGamesData(JSON.stringify(currentTaskData));
        setNInputs(currentNInputs);
        setNOutputs(currentNOutputs);
        setNObjects(currentTaskIds.map(() => 0));
        setTaskNames(currentTaskNames);
        setTaskIcons(currentIcons);

        // Set neural network states
        setNNTaskIds(currentNNTaskIds);
        setSensitiveIds(currentSensitiveIds);
        setMaxEpochs(currentMaxEpochs);
        setMaxLayers(currentMaxLayers);
        setMaxNodes(currentMaxNodes);
        setWeights(currentWeights);
        setNormalizationVisibility(currentNormalizationVisibility);
        setAfVisibility(currentAfVisibility);
        setIterationsSliderVisibility(currentIterationsSliderVisibility);
        setLRSliderVisibility(currentLRSliderVisibility);
        setImageVisibility(currentImageVisibility);
        setAfOptions(currentAfOptions);
        setOptimOptions(currentOptimOptions);

        // Set svm states
        setSVMTaskIds(currentSVMTaskIds);
        setCSliderVisibility(currentCSliderVisibility);
        setGammaSliderVisibility(currentGammaSliderVisibility);
        setRbfVisibility(currentRbfVisibility);

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
        setIsTraining(currentTaskIds.map(() => 0));
        setApiData(currentTaskIds.map(() => null));
        setIsResponding(currentTaskIds.map(() => false));
        setFeatureNames(currentTaskIds.map(() => []));  // TODO: load these somewhere else
        setImgs(currentTaskIds.map(() => null));
        setInitPlots(currentTaskIds.map(() => null));

        setCytoLayers(currentNNTaskIds.map(() => []));

        setAccuracy(currentNNTaskIds.map(() => 0));
        setNNProgress(currentNNTaskIds.map(() => 0));
        setErrorList(currentNNTaskIds.map(() => [[], null]));
        setBiases(currentNNTaskIds.map(() => []));

        // some custom taskIds
        setOtherTasks(currentOtherTasks);
        setOtherDescriptions(currentOtherDescriptions);
        setConstructionTaskIds(currentConstructionTaskIds);

        setLoadedTasks(true);
      })
      .catch(error => {
        setLoadedTasks(false);
        // making some things visible for exercise 3.1
        setIterationsSliderVisibility(prev => {
          const updated = [...prev];
          updated[5] = true;
          return updated;
        });
        setLRSliderVisibility(prev => {
          const updated = [...prev];
          updated[5] = true;
          return updated;
        });
        setAfOptions(prev => {
          const updated = [...prev];
          updated[5] = ['Linear', 'ReLU', 'Sigmoid', 'TanH'];
          return updated;
        });
        setOptimOptions(prev => {
          const updated = [...prev];
          updated[5] = ['SGD', 'Adam'];
          return updated;
        });
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
      
      if (isLikelyMobile) {
        alert("Welcome to brAIn bUIlder! Looks like you might be using a phone and we don't support mobile browsers just yet... Hope to see you soon on a computer!")
      }
    }, 1000);

  }, []);



  // ------- PROCESSING TASK DATA -------
  
  const linksDict = linkIds.reduce((acc, curr, index) => {
    acc[curr] = links[index];
    return acc;
  }, {});
  
  useEffect(() => { 
    const newCytoLayers = [...cytoLayers];
    let shouldUpdateCytoLayers = false;

    newCytoLayers.forEach((cytoLayer, index) => {
      if (cytoLayer.length === 0) {
        const taskIndex = taskIds.indexOf(NNTaskIds[index]);
        newCytoLayers[index] = [nInputs[taskIndex], nOutputs[taskIndex]];
        shouldUpdateCytoLayers = true;
      }
      const localStorageKey = `cytoLayers${NNTaskIds[index]}`;
      const newCytoLayerString = JSON.stringify(newCytoLayers[index]);
      if (newCytoLayerString !== localStorage.getItem(localStorageKey)) {
        localStorage.setItem(localStorageKey, newCytoLayerString);
      }
    });

    if (shouldUpdateCytoLayers) {
      setCytoLayers(newCytoLayers);
    }

    newCytoLayers.forEach((cytoLayer, index) => {
      const taskIndex = taskIds.indexOf(NNTaskIds[index]);
      if (isTraining[taskIndex] !== -1) {
        setIsTraining(prevIsTraining => {
          const newIsTraining = [...prevIsTraining];
          newIsTraining[taskIndex] = 0;
          return newIsTraining;
        });
      }
    });
  }, [cytoLayers, NNTaskIds, nInputs, nOutputs, taskIds]);

  
  const loadLastCytoLayers = (setCytoLayers, apiData, setApiData, propertyName, taskId, index, NNIndex, nInputs, nOutputs) => {
    // Check localStorage for a saved setting
    const savedSetting = localStorage.getItem(propertyName);
    let goToStep2 = false;
    let goToStep3 = false;

    if (savedSetting && savedSetting !== '[]' && !JSON.parse(savedSetting).some(element => element === undefined)) {
        try {
            // If a saved setting is found, try to parse it from JSON
            const cytoLayersSetting = JSON.parse(savedSetting);
            // try to set the cytoLayers to the saved setting, if there is an error, set it to default
            setCytoLayers(prevCytoLayers => {
              const newCytoLayers = [...prevCytoLayers];
              newCytoLayers[NNIndex] = cytoLayersSetting;
              // make the number of nodes in the first and last layer match the number of inputs and outputs
              newCytoLayers[NNIndex][0] = nInputs;  
              newCytoLayers[NNIndex][newCytoLayers[NNIndex].length - 1] = nOutputs;
              return newCytoLayers;
            });
        }
        catch (error) {
            console.print(`getting the saved setting didn't work: ${error}`);
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
        try {
            setApiData(prevApiData => {
              const newApiData = [...prevApiData];
              newApiData[index] = response.data[0];
              return newApiData;
            });
            setCytoLayers(prevCytoLayers => {
              const newCytoLayers = [...prevCytoLayers];
              newCytoLayers[NNIndex] = JSON.parse(response.data[0]["in_out"]);
              // make the number of nodes in the first and last layer match the number of inputs and outputs
              newCytoLayers[NNIndex][0] = nInputs;
              newCytoLayers[NNIndex][newCytoLayers[NNIndex].length - 1] = nOutputs;
              return newCytoLayers;
            });
          } catch (error) {
            console.print(`the db record didn't have a cytoLayers setting: ${error}`);
            goToStep3 = true;
          }
      })
      .catch((error) => {
        console.print(`getting cytoLayers from db failed: ${error}`);
        goToStep3 = true;
      });

      if (goToStep3) {
        setCytoLayers(prevCytoLayers => {
          const newCytoLayers = [...prevCytoLayers];
          newCytoLayers[NNIndex] = [nInputs, nOutputs];
          return newCytoLayers;
        });
      }
    }
  };

  const [cytoElements, setCytoElements] = useState([]);
  const [cytoStyle, setCytoStyle] = useState([]);

  // Update the state when the dependencies change
  useEffect(() => {
    console.log(`App.js weights = ${weights}`)  // weights logging
    if (Array.isArray(cytoLayers)) {
      setCytoElements(NNTaskIds.map((taskId, index) => {
        console.log(`App.js weights[index] = ${weights[index]}`)
        return generateCytoElements(cytoLayers[index], apiData[index], isTraining[taskIds.indexOf(NNTaskIds[index])], weights[index], biases[index])
      }
      ));
    }
  }, [NNTaskIds, cytoLayers, apiData, weights, biases, isTraining, taskIds]);

  useEffect(() => {
    setCytoStyle(NNTaskIds.map((taskId, index) => 
      generateCytoStyle(cytoLayers[index])
    ));
  }, [NNTaskIds, cytoLayers, cytoElements]);


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
      networkData.in_out['model_input'] = JSON.stringify(values);
      networkData.action = 2;
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



  // ------- CYTOSCAPE STUFF -------

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
          <Route path="/" element={<StartPage levelNames={levelNames} taskNames={taskNames} introData={introData} quizData={quizData} taskIds={taskIds} taskIcons={taskIcons} quizIds={quizIds} introIds={introIds} links={linksDict} />} />
          
          {introIds.map((introId, index) => (
            <>
            { introData[index].visibility &&
              <Route path={`/introduction${introId}`} element={
                <Introduction introId={introId}/>
              } />
            }
            </>
          ))}

          {clusteringTaskIds.map((clusteringId, index) => (
            <Route path={`/exercise${clusteringId/10}`} element={<ClusteringTest clusteringId={clusteringId} />} />
          ))}

          {Object.entries(otherTasks).map(([taskId, taskName], index) => (
            <>
            <Route key={taskId} path={`/exercise${taskId/10}`} element={<OtherTask
              type = {taskName}
              host = {window.location.host}
              customId = {parseInt(taskId)}
              userId = {getCookie('user_id')}
              description = {otherDescriptions[taskId]}
            />} />
            </>
          ))}

          {SVMTaskIds.map((taskId, SVMIndex) => (
            <>
            <Route
              key={taskId}
              path={`/exercise${taskId/10}`}
              element={
                <>
                <SvmView 
                isTraining={isTraining[taskIds.indexOf(taskId)]} setIsTraining={setIsTraining} userId={getCookie('user_id')} taskId={taskId} cancelRequestRef={cancelRequestRef} SVMIndex={SVMIndex} index={taskIds.indexOf(taskId)} name={taskNames[taskId]} pendingTime={pendingTime} intervalTimeout={intervalTimeout} isResponding={taskIds.indexOf(taskId)} apiData={apiData.indexOf(taskId)} setApiData={setApiData} handleSubmit={handleSubmit} featureNames={featureNames[taskIds.indexOf(taskId)]} img={imgs[taskIds.indexOf(taskId)]} setImgs={setImgs} initPlot={initPlots[taskIds.indexOf(taskId)]} typ={typ[taskIds.indexOf(taskId)]} loadData={loadData} normalization={false} dataset={dataset[taskIds.indexOf(taskId)]}
                fileName={fileNames[taskIds.indexOf(taskId)]} functionName={functionNames[taskIds.indexOf(taskId)]} startTraining={putRequest} tabs={['data', 'training']} sliderValues={{'CSlider': 10, 'GammaSlider': 0.1}} sliderVisibilities={{'CSlider': cSliderVisibility[SVMIndex], 'GammaSlider': gammaSliderVisibility[SVMIndex] }} inputFieldVisibilities={{}} dropdownVisibilities={{}} checkboxVisibilities={{'KernelCheckbox': rbfVisibility[SVMIndex] }} setIsResponding={setIsResponding} 
                />
                </>
              }
            />
            </>
          ))}

          {sensitiveIds.map((taskId, NNIndex) => (
            // TODO currently unused as this whole idea turned into a big stinky mess
            <>
            <Route
              key={taskId}
              path={`/exercise${taskId/10}`}
              element={
                <>
                <BuildView
                  nOfInputs={nInputs[taskIds.indexOf(taskId)]} nOfOutputs={nOutputs[taskIds.indexOf(taskId)]} maxLayers={maxLayers[taskIds.indexOf(taskId)]} taskId={taskId} NNIndex={NNIndex} index={taskIds.indexOf(taskId)} cytoElements={cytoElements[NNIndex]} cytoStyle={cytoStyle[NNIndex]} cytoLayers={cytoLayers[NNIndex]} setCytoLayers={setCytoLayers} updateCytoLayers={updateCytoLayers} loadLastCytoLayers={loadLastCytoLayers} 
                  isTraining={isTraining[taskIds.indexOf(taskId)]} setIsTraining={setIsTraining} apiData={apiData[taskIds.indexOf(taskId)]} setApiData={setApiData} accuracy={accuracy[NNIndex]} setAccuracy={setAccuracy} accuracyColor={accuracyColor} handleSubmit={handleSubmit} isResponding={isResponding[taskIds.indexOf(taskId)]} setIsResponding={setIsResponding} loadData={loadData} pendingTime={pendingTime} intervalTimeout={intervalTimeout} cancelRequestRef={cancelRequestRef}
                  progress={NNProgress[NNIndex]} setProgress={setNNProgress} featureNames={featureNames[taskIds.indexOf(taskId)]} errorList={errorList[NNIndex]} setErrorList={setErrorList} weights={weights[NNIndex]} setWeights={setWeights} biases={biases[NNIndex]} setBiases={setBiases} img={imgs[taskIds.indexOf(taskId)]} setImgs={setImgs} userId={getCookie('user_id')}
                  fileName={fileNames[taskIds.indexOf(taskId)]} functionName={functionNames[taskIds.indexOf(taskId)]} maxNodes={maxNodes[NNIndex]} maxEpochs={maxEpochs[NNIndex]} typ={typ[taskIds.indexOf(taskId)]} dataset={dataset[taskIds.indexOf(taskId)]} name={taskNames[taskId]} startTraining={putRequest} imageVisibility={imageVisibility[NNIndex]} gamesData={gamesData}
                  initPlot={sensitiveDataPlot}
                  tabs={['data', 'training']} sliderVisibilities={{}} inputFieldVisibilities={{}} dropdownVisibilities={{}} dropdownOptions={{'AFDropdown': afOptions[NNIndex], 'OptimizerDropdown': optimOptions[NNIndex]}} checkboxVisibilities={{'ColorCheckbox': true, 'HeightCheckbox': true, 'ResizeCheckbox': true}}
                />
                </>
              }
            />
            </>
          ))}
          {NNTaskIds.map((taskId, NNIndex) => (
            <>
            <Route
              key={taskId}
              path={`/exercise${taskId/10}`}
              element={
                <>
                <BuildView
                  nOfInputs={nInputs[taskIds.indexOf(taskId)]}
                  nOfOutputs={nOutputs[taskIds.indexOf(taskId)]}
                  // nOfObjects={nObjects[taskIds.indexOf(taskId)]}
                  maxLayers={maxLayers[NNIndex]}
                  taskId={taskId}
                  NNIndex={NNIndex}
                  index={taskIds.indexOf(taskId)}
                  cytoElements={cytoElements[NNIndex]}
                  cytoStyle={cytoStyle[NNIndex]}
                  cytoLayers={cytoLayers[NNIndex]}
                  setCytoLayers={setCytoLayers}
                  updateCytoLayers={updateCytoLayers}
                  loadLastCytoLayers={loadLastCytoLayers}
                  isTraining={isTraining[taskIds.indexOf(taskId)]}
                  setIsTraining={setIsTraining}
                  apiData={apiData[taskIds.indexOf(taskId)]}
                  setApiData={setApiData}
                  setAccuracy={setAccuracy}
                  accuracyColor={accuracyColor}
                  handleSubmit={handleSubmit}
                  isResponding={isResponding[taskIds.indexOf(taskId)]}
                  setIsResponding={setIsResponding}
                  progress={NNProgress[NNIndex]}
                  featureNames={featureNames[taskIds.indexOf(taskId)]}
                  errorList={errorList[NNIndex]}
                  weights={weights[NNIndex]}
                  biases={biases[NNIndex]}
                  img={imgs[taskIds.indexOf(taskId)]}
                  initPlot={initPlots[taskIds.indexOf(taskId)]}
                  loadData={loadData}
                  imageVisibility={imageVisibility[NNIndex]}
                  setProgress={setNNProgress}
                  setErrorList={setErrorList}
                  setWeights={setWeights}
                  setBiases={setBiases}
                  pendingTime={pendingTime}
                  cancelRequestRef={cancelRequestRef}
                  fileName={fileNames[taskIds.indexOf(taskId)]}
                  functionName={functionNames[taskIds.indexOf(taskId)]}
                  maxNodes={maxNodes[NNIndex]}
                  maxEpochs={maxEpochs[NNIndex]}
                  setImgs={setImgs}
                  userId={getCookie('user_id')}
                  intervalTimeout={intervalTimeout}
                  typ={typ[taskIds.indexOf(taskId)]}
                  dataset={dataset[taskIds.indexOf(taskId)]}
                  name={taskNames[taskId]}
                  startTraining={putRequest}
                  tabs={['data', 'training', 'testing']}
                  sliderVisibilities={{'EpochSlider': iterationsSliderVisibility[NNIndex], 'LRSlider': lrSliderVisibility[NNIndex]}}
                  inputFieldVisibilities={{}}
                  dropdownVisibilities={{'AFDropdown': !!afOptions[NNIndex].length, 'OptimizerDropdown': !!optimOptions[NNIndex].length}}
                  dropdownOptions={{'AFDropdown': afOptions[NNIndex], 'OptimizerDropdown': optimOptions[NNIndex]}}
                  checkboxVisibilities={{'AFCheckbox': afVisibility[NNIndex], 'NormCheckbox': normalizationVisibility[NNIndex]}}
                  gamesData={gamesData}
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
              <Header showHomeButton={true}/>
              <FeedbackApp host={window.location.origin} cookie={getCookie('csrftoken')} />
            </div>
          } />
          <Route path={`/links`} element={
            <LinksPage/>
          } />

          <Route path="/:ex" element={
            <ConstructionView taskIds={constructionTaskIds} />
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      </Theme>
    </body>
  );
}

export default App;