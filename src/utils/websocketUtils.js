import prepareTrainingData from './websocketFunctions/prepareTrainingData';
import initializeWebSocket from './websocketFunctions/initializeWebsocket';

const putRequest = (e, params) => {
    
    /*send the training data to the server and start the training process*/
  
    e.preventDefault();

    let trainingData = prepareTrainingData(params);

    initializeWebSocket(trainingData, params);
}

export default putRequest;