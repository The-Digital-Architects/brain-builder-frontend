import getCookie from '../cookieUtils';

// Extracted task-specific configurations for better separation of concerns
const getTaskConfiguration = (taskId) => ({
  11: { learningRate: 0.0005, normalization: false, activationFunctionsEnabled: false },
  12: { normalization: false, activationFunctionsEnabled: false }
}[taskId] || {});

const prepareTrainingData = ({
  learningRate = 0.01,
  iterations = 50,
  taskId,
  setProgress,
  setErrorList,
  setWeights,
  setBiases,
  setImgs,
  setApiData,
  setAccuracy,
  setIsTraining,
  cytoLayers,
  nOfInputs,
  nOfOutputs,
  typ,
  dataset,
  index
}) => {

  /*prepare the training data to be sent to the server*/

  const taskConfig = getTaskConfiguration(taskId);
  const finalLearningRate = taskConfig.learningRate || learningRate;
  const normalization = taskConfig.normalization ?? true;
  const activationFunctionsEnabled = taskConfig.activationFunctionsEnabled ?? true;

  let userId = getCookie('user_id');

  // State update function that doesn't directly manipulate the state
  const updateState = (setter, newValue) => {
    setter(prev => {
      const updated = Array.isArray(prev) ? [...prev] : {};
      updated[index] = newValue;
      return updated;
    });
  };

  // Simplified state updates
  [setProgress, setErrorList, setWeights, setBiases, setImgs].forEach(setter => updateState(setter, []));
  updateState(setErrorList, [[], null]); // Specific update for setErrorList

  // Direct manipulation of cytoLayers for clarity
  const updatedCytoLayers = [nOfInputs, ...cytoLayers.slice(1, -1), nOfOutputs];

  const trainingData = {
    header: 'start',
    file_name: 'building',
    function_name: 'main',
    user_id: userId,
    task_id: taskId,
    learning_rate: parseFloat(finalLearningRate),
    epochs: iterations,
    normalization,
    activations_on: activationFunctionsEnabled,
    nodes: updatedCytoLayers,
    n_inputs: nOfInputs,
    n_outputs: nOfOutputs,
    typ,
    dataset,
  };

  // State updates for training data
  [setApiData, setAccuracy, setIsTraining].forEach(setter => updateState(setter, trainingData));

  return trainingData;
}

export default prepareTrainingData;