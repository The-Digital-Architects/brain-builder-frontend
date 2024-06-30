import getCookie from './cookieUtils';

export const prepareTrainingData = (cytoLayers, learningRate, iterations, taskId, nOfInputs, nOfOutputs, index, setProgress, setErrorList, setWeights, setBiases, setImgs, setApiData, setAccuracy, setIsTraining, af) => {
    if (!learningRate) {learningRate = 0.01};  // set learning rate to default if it's undefined
    if (!iterations) {iterations = 50};  // set learning rate to default if it's undefined
    let normalization = false;  // TODO: replace this with the actual normalization value
    if (taskId === 11){
      learningRate = 0.0005;
      normalization = false;
      af = false;
    }
    if (taskId === 12){
      normalization = false;
      af = false;
    }

    var userId = getCookie('user_id');

    setProgress(prevProgress => {
      const newProgress = [...prevProgress]; // create a copy of the old progress array
      newProgress[index] = 0; // update the specific element
      return newProgress; // return the new array
    });
    setErrorList(prevErrorList => {
      const newErrorList = [...prevErrorList];
      newErrorList[index] = [[], null];
      return newErrorList;
    });
    setWeights(prevWeights => {
      const newWeights = [...prevWeights];
      newWeights[index] = [];
      return newWeights;
    });
    setBiases(prevBiases => {
      const newBiases = [...prevBiases];
      newBiases[index] = [];
      return newBiases;
    });

    setImgs(prevImgs => {
      const newImgs = [...prevImgs];
      newImgs[index] = [];
      return newImgs;
    });

    // make sure the cytoLayers have the right input and output nodes
    cytoLayers[0] = nOfInputs;
    cytoLayers[cytoLayers.length - 1] = nOfOutputs;
    const trainingData = {
      //action: 1,
      header: 'start',
      file_name: 'building',
      function_name: 'main',
      user_id: userId,
      task_id: taskId,
      learning_rate: parseFloat(learningRate),
      epochs: iterations,
      normalization: normalization,
      activations_on: af,
      nodes: JSON.stringify(cytoLayers),
      //network_input: JSON.stringify(cytoLayers),
      //games_data: gamesData,  
    };
    console.log("trainingData: ", trainingData);  // for debugging
    setApiData(prevApiData => {
      const newApiData = [...prevApiData];
      newApiData[index] = trainingData;
      return newApiData;
    });
    setAccuracy(prevAccuracy => {
      const newAccuracy = [...prevAccuracy];
      newAccuracy[index] = null;
      return newAccuracy;
    });
    setIsTraining(prevIsTraining => {
      const newIsTraining = [...prevIsTraining];
      newIsTraining[index] = 1;
      return newIsTraining;
    });

    return trainingData;
}