function updateProgress(data, params) {

    /*update the progress if it changed*/

    params.setProgress(prevProgress => {
        const newProgress = [...prevProgress];
        newProgress[params.index] = data.progress;
        return newProgress;
    });
}

function checkTrainingComplete(data, params, ws) {

    /*check if training is complete and close the websocket if it is*/

    if (data.progress >= 0.98 || (params.iterations <=30 && data.progress >= 0.95) || (params.iterations <=20 && data.progress*params.iterations >= (params.iterations - 1))) {
      ws.close();
      clearTimeout(params.timeoutId);
      params.setIsTraining(prevIsTraining => {
        const newIsTraining = [...prevIsTraining];
        newIsTraining[params.index] = 2;
        return newIsTraining;
      });
      console.log("Training finished")
    }
}

function updateErrorListIfNeeded(data, params) {

    /*update the error list if it changed*/
    
    if (data.error_list[0].length !== params.errorList[0].length || data.error_list[1] !== params.errorList[1]) {
        console.log("updating error list");  // for debugging
        params.setErrorList(prevErrorList => {
          const newErrorList = [...prevErrorList];
          newErrorList[params.index] = data.error_list;
          return newErrorList;
        });
      }
}

function updateWeightsIfNeeded(data, params) {

    /*update the weights if they changed*/

    if (params.weights[params.index].length === 0 || data.network_weights[0][0] !== params.weights[params.index][0][0]) {
        params.setWeights(prevWeights => {
          const newWeights = [...prevWeights];
          newWeights[params.index] = data.network_weights;
          return newWeights;
        });
    }
}

function updateBiasesIfNeeded(data, params) {

    /*update the biases if they changed*/

    if (params.biases[params.index].length !== 0 || data.network_biases[0] !== params.biases[params.index][0]) {
        params.setBiases(prevBiases => {
          const newBiases = [...prevBiases];
          newBiases[params.index] = data.network_biases;
          return newBiases;
        });
    }
}

function updateImagesIfNeeded(data, params) {

    /*decompress and parse the images in 'plots', but only if it's not empty or the same as the current params.imgs*/

    if (data.plot.length > 0 && data.plot.length !== params.imgs[params.index].length) {
        params.setImgs(prevImgs => {
          const newImgs = [...prevImgs];
          const binaryString = atob(data.plot);  // decode from base64 to binary string
          const bytes = new Uint8Array(binaryString.length);  // convert from binary string to byte array
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);  // now bytes contains the binary image data
          }
          const blob = new Blob([bytes.buffer], { type: 'image/jpeg' });
          const url = URL.createObjectURL(blob);
          // now images can be accessed with <img src={url} />
          newImgs[params.index] = url
          return newImgs;
        });
      }
}

export { updateProgress, checkTrainingComplete, updateErrorListIfNeeded, updateWeightsIfNeeded, updateBiasesIfNeeded, updateImagesIfNeeded };