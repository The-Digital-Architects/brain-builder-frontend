import { prepareTrainingData } from './trainingDataUtils';


function initializeWebSocket(trainingData, index, intervalTimeout, progress, errorList, weights, biases, imgs, isTraining, setProgress, setErrorList, setWeights, setBiases, setImgs, setIsTraining, userId, iterations, cancelRequest) {
  // first, set up the websocket
  /*if (oldWs && oldWs.readyState !== WebSocket.CLOSED) {
    oldWs.close();
  }*/
  const ws = new WebSocket(`wss://${window.location.host}/ws/${userId}/`);

  let timeoutId = null;

  ws.onclose = () => {
    console.log('WebSocket connection closed', isTraining[index], progress[index]);
  };

  ws.onerror = function(event) {
    console.error('Error:', event);
    cancelRequest();
    alert("A websocket error occurred. Please try again. If the problem persists, please contact us.");
  };

  ws.onopen = () => {
    console.log('WebSocket connection opened');

    ws.send(JSON.stringify(trainingData));

    timeoutId = setTimeout(() => {
      ws.close();
      setIsTraining(prevIsTraining => {
        const newIsTraining = [...prevIsTraining];
        newIsTraining[index] = 0;
        return newIsTraining;
      });
      console.log("Training failed")
      alert("Training failed. Please try again. If the problem persists, please contact us.");
    }, intervalTimeout); // stop after n milliseconds
  };

  ws.onmessage = function(event) {
    
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      ws.close();
      setIsTraining(prevIsTraining => {
        const newIsTraining = [...prevIsTraining];
        newIsTraining[index] = 0;
        return newIsTraining;
      });
      console.log("Training failed")
      alert("Training failed. Please try again. If the problem persists, please contact us.");
    }, intervalTimeout); // stop after n milliseconds

    const data = JSON.parse(event.data);
    if (data.header === 'progress') {  // every 1%; includes progress, error_list, and network_weights

      if (JSON.stringify(data.progress) !== JSON.stringify(progress[index])) {
        setProgress(prevProgress => {
          const newProgress = [...prevProgress];
          newProgress[index] = data.progress;
          return newProgress;
        });

        if (data.progress >= 0.98 || (iterations <=30 && data.progress >= 0.95) || (iterations <=20 && data.progress*iterations >= (iterations - 1))) {
          ws.close();
          clearTimeout(timeoutId);
          setIsTraining(prevIsTraining => {
            const newIsTraining = [...prevIsTraining];
            newIsTraining[index] = 2;
            return newIsTraining;
          });
          console.log("Training finished")
        }

        // update the error list if it changed
        if (data.error_list[0].length !== errorList[index][0].length || data.error_list[1] !== errorList[index][1]) {
          console.log("updating error list");  // for debugging
          setErrorList(prevErrorList => {
            const newErrorList = [...prevErrorList];
            newErrorList[index] = data.error_list;
            return newErrorList;
          });
        }
        
      }
    } else if (data.header === 'update') {  // every 2%; includes network_biases and plots
      // update the weights if they changed 
      if (weights[index].length === 0 || data.network_weights[0][0] !== weights[index][0][0]) {
        setWeights(prevWeights => {
          const newWeights = [...prevWeights];
          newWeights[index] = data.network_weights;
          return newWeights;
        });
      }

      // update the biases if they changed
      if (biases[index].length !== 0 || data.network_biases[0] !== biases[index][0]) {
        setBiases(prevBiases => {
          const newBiases = [...prevBiases];
          newBiases[index] = data.network_biases;
          return newBiases;
        });
      }

      // decompress and parse the images in 'plots', but only if it's not empty or the same as the current imgs
      if (data.plot.length > 0 && data.plot.length !== imgs[index].length) {
        setImgs(prevImgs => {
          const newImgs = [...prevImgs];
          const binaryString = atob(data.plot);  // decode from base64 to binary string
          const bytes = new Uint8Array(binaryString.length);  // convert from binary string to byte array
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);  // now bytes contains the binary image data
          }
          const blob = new Blob([bytes.buffer], { type: 'image/jpeg' });
          const url = URL.createObjectURL(blob);
          // now images can be accessed with <img src={url} />
          newImgs[index] = url
          return newImgs;
        });
      }
    }
  };

  return [ws, timeoutId];
}




export const putRequest = (e, cytoLayers, learningRate, iterations, taskId, nOfInputs, nOfOutputs, index, setProgress, setErrorList, setWeights, setBiases, setImgs, setApiData, setAccuracy, setIsTraining, userId, intervalTimeout, progress, errorList, weights, biases, imgs, isTraining, af, cancelRequestRef) => {
    e.preventDefault();

    let trainingData = prepareTrainingData(cytoLayers, learningRate, iterations, taskId, nOfInputs, nOfOutputs, index, setProgress, setErrorList, setWeights, setBiases, setImgs, setApiData, setAccuracy, setIsTraining, af);
    
    let [ws, timeoutId] = initializeWebSocket(trainingData, index, intervalTimeout, progress, errorList, weights, biases, imgs, isTraining, setProgress, setErrorList, setWeights, setBiases, setImgs, setIsTraining, userId, iterations, cancelRequest);

    function cancelRequest() {
      if (ws && ws.readyState === WebSocket.OPEN) {
        let message = {'header': 'cancel'};
        ws.send(JSON.stringify(message));
    
        ws.close();
      }
      clearTimeout(timeoutId);
      if (progress[index] >= 0.8 && isTraining[index] === 1) {
          setIsTraining(prevIsTraining => {
            const newIsTraining = [...prevIsTraining];
            newIsTraining[index] = 2;
            return newIsTraining;
          });
          console.log("Setting isTraining to 2 - the progress is over 80%!!!")
        } else {
        setIsTraining(prevIsTraining => {
          const newIsTraining = [...prevIsTraining];
          newIsTraining[index] = 0;
          return newIsTraining;
        });
      }
        console.log("Training cancelled")
    };

    cancelRequestRef.current = cancelRequest;
}