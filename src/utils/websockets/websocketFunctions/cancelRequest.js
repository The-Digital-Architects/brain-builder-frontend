export default function cancelRequest(NNIndex, index, ws, timeoutId, params) {

    /*cancel the training process*/

    if (ws && ws.readyState === WebSocket.OPEN) {
        const message = {'header': 'cancel', 'task_id': params.taskId};
        try {
            ws.send(JSON.stringify(message));
            ws.close();
        } catch (error) {
            console.error("Error cancelling the training request:", error);
        }
    }

    clearTimeout(timeoutId);

    if (params.progress[NNIndex] >= 0.8 && params.isTraining[index] === 1) {
            params.setIsTraining(prevIsTraining => {
                const newIsTraining = [...prevIsTraining];
                newIsTraining[index] = 2;
                return newIsTraining;
            });
            console.log("Setting isTraining to 2 - the progress is over 80%!!!")
        } else {
        params.setIsTraining(prevIsTraining => {
            const newIsTraining = [...prevIsTraining];
            newIsTraining[index] = 0;
            return newIsTraining;
        });
    }
    
    console.log("Training cancelled")

};