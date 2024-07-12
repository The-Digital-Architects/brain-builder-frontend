import { updateProgress, checkTrainingComplete, updateErrorListIfNeeded, updateWeightsIfNeeded, updateBiasesIfNeeded, updateImagesIfNeeded } from './updatesOnMessage';

export default function handleMessage(event, ws, params) {

    /*handle incoming messages from the websocket*/

    resetTimeout(ws, params);

    const data = JSON.parse(event.data);
    console.log("Message received with header: ", data.header)  // for debugging
    if (data.header === 'update') {  // every 1%; includes params.progress, error_list, network_weights and network_biases, sometimes also plots

      if (JSON.stringify(data.progress) !== JSON.stringify(params.progress[params.index])) {

        console.log(`isTraining = ${params.isTraining}`);  // for debugging
        
        updateProgress(data, params);

        checkTrainingComplete(data, params, ws);

        updateErrorListIfNeeded(data, params);
        
        updateWeightsIfNeeded(data, params);

        updateBiasesIfNeeded(data, params);

        updateImagesIfNeeded(data, params);
      }
    }
}

function resetTimeout(ws, params) {

    /*reset the timeout to close the websocket if no message is received for a certain amount of time*/

    clearTimeout(params.timeoutId);
    params.timeoutId = setTimeout(() => {
      ws.close();
      params.setIsTraining(prevIsTraining => {
        const newIsTraining = [...prevIsTraining];
        newIsTraining[params.globalIndex] = 0;
        return newIsTraining;
      });
      console.log("Training failed")
      alert("Training failed. Please try again. If the problem persists, please contact us.");
    }, params.intervalTimeout); // stop after n milliseconds
}