
import React, { useCallback } from 'react';
import { PlusIcon, MinusIcon, ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { styled } from '@stitches/react';
import { IconButton } from '@radix-ui/themes';



// ------- STYLED COMPONENT -------

const FloatingButton = styled(IconButton, {
    position: 'absolute',
    zIndex: 9999,
    borderRadius: 'var(--radius-3)',
    width: 33,
    height: 33,
    boxShadow: '0 2px 8px var(--slate-a11)'
  });



// ------- FUNCTIONS -------

function LayerRemoveButton({setCytoLayers, index, taskId, cytoLayers, isTraining}) {

    // function to remove a layer
    const removeLayer = useCallback((setCytoLayers, index) => {
        setCytoLayers(prevLayers => {
          const newLayers = [...prevLayers];
          if (newLayers[index].length > 2) {newLayers[index].splice(-2, 1)}
          return newLayers;
        });
    }, []);

    return (
        <FloatingButton
            variant="outline"
            onClick = {taskId !== 0 ? () => removeLayer(setCytoLayers, index) : () => {}}
            size="0"
            disabled={cytoLayers.length<3 || isTraining===1}
            style= {{ top: window.innerHeight*0.285, 
                        left: window.innerWidth*0.56,
                        position: 'absolute',
                        zIndex: 9999,
                        borderRadius: 'var(--radius-5)',
                        width: 35,
                        height: 60,
                        boxShadow: '0 2px 8px var(--slate-a11)'
                    }}
            >

            {<ChevronLeftIcon style={{height: 30, width: 30}}/>}
            
        </FloatingButton>
    );
}

function LayerAddButton({setCytoLayers, index, taskId, cytoLayers, nOfOutputs, maxLayers, isTraining}) {

    // function to add a layer
    const addLayer = useCallback((setCytoLayers, nOfOutputs, index, max_layers) => {
        setCytoLayers(prevLayers => {
        const newLayers = [...prevLayers];
        console.log("max_layers: ", max_layers);  // for debugging");
        if (newLayers[index].length < max_layers) {newLayers[index].push(nOfOutputs)};
        return newLayers;
        });
    }, []);

    return (
        <FloatingButton
            variant="outline"
            onClick = {taskId !== 0 ? () => addLayer(setCytoLayers, nOfOutputs, index, maxLayers) : () => {}}
            size="0"
            disabled={cytoLayers.length>maxLayers-1 || isTraining===1}
            style={{top: window.innerHeight*0.285, 
                    left: window.innerWidth*0.60, 
                    position: 'absolute',
                    zIndex: 9999,
                    borderRadius: 'var(--radius-5)',
                    width: 35,
                    height: 60,
                    boxShadow: '0 2px 8px var(--slate-a11)'
            }}
            >

            {<ChevronRightIcon style={{height: 30, width: 30}}/> }

        </FloatingButton>
    );
}


function GenerateFloatingButtons(top, left, dist, isItPlus, nLayers, cytoLayers, setCytoLayers, taskId, index, maxNodes, isTraining) {

  // function to add a node to a layer
  const addNode = useCallback((column, setCytoLayers, taskId, index, max_nodes) => {
    setCytoLayers(prevLayers => {
      const newLayers = [...prevLayers];
      newLayers[index][column] < max_nodes ? newLayers[index][column] += 1 : newLayers[index][column] = max_nodes;
      document.getElementById(taskId + "-input" + column).value = newLayers[index][column];
      return newLayers;
    });
  }, []);

  // function to remove a node from a layer
  const removeNode = useCallback((column, setCytoLayers, taskId, index) => {
    setCytoLayers(prevLayers => {
      const newLayers = [...prevLayers];
      newLayers[index][column] > 1 ? newLayers[index][column] -= 1 : newLayers[index][column] = 1;
      document.getElementById(taskId + "-input" + column).value = newLayers[index][column];
      return newLayers;
    });
  }, []);

  // function to set a custom number of nodes for a layer
  const setNodes = useCallback((column, cytoLayers, setCytoLayers, taskId, index) => {
    try {
      var nodeInput = Number(document.getElementById(taskId + "-input" + column).value)
    } catch (error) {
      console.log(`Error when getting nodeInput: ${error}`);
      console.log(`taskId + "-input" + column: ${taskId + "-input" + column}`);
    }
    if (nodeInput && Number.isInteger(nodeInput)) {
      if (nodeInput < 1) {
        nodeInput = 1;
      } else if (nodeInput > maxNodes[index]) {
        nodeInput = maxNodes[index];
      }
      try {
        setCytoLayers(prevLayers => {
          const newLayers = [...prevLayers];
          newLayers[index][column] = nodeInput;
          return newLayers;
        });
      } catch (error) {
        console.log(`Error when setting cytoLayers (maybe wrong type?): ${error}`);
      }
    } else {
      nodeInput = cytoLayers[index][column];
      console.log("Invalid input: ", nodeInput);
    }
    document.getElementById(taskId + "-input" + column).value = nodeInput;
  }, [maxNodes]);


    const buttons = [];
    const icon = isItPlus ? <PlusIcon /> : <MinusIcon />;
    for (let i = 1; i < nLayers-1; i++) {
        const style = { top: top, left: left + i * dist };
        const button = (
        <div>
            <FloatingButton
            variant="outline"
            disabled={(isItPlus && cytoLayers[i] >= maxNodes[index]) | (!isItPlus && cytoLayers[i] < 2) | isTraining[index] === 1}
            onClick = {taskId !== 0 ? (isItPlus ? () => addNode(i, setCytoLayers, taskId, index, maxNodes[index]) : () => removeNode(i, setCytoLayers, taskId, index)) : () => {}}
            style={{...style}}
            key={i}
            >
            {icon}
            </FloatingButton>
            {isItPlus &&
            <form>
            {console.log(taskId + "-input" + i)}
            <input
            id={taskId + "-input" + i}
            type="text"
            defaultValue={cytoLayers[i]}
            style={{
                border: 'none',
                width: 0.02 * (window.innerWidth * 0.97),
                textAlign: 'center',
                position: 'absolute',
                top: window.innerHeight - 258,
                left: left + i * dist + 16.5,
                transform: 'translateX(-50%)',
                fontSize: 'var(--font-size-2)',
                color: 'var(--cyan-12)',
                fontWeight: 'bold'
            }}
            onBlur={(taskId !== 0 && isTraining[index] !== 1) ? () => setNodes(i, cytoLayers, setCytoLayers, taskId, index) : () => {}}
            onKeyDown={(event) => {
                if (event.key === "Enter" && taskId !== 0 && isTraining[index] !== 1) {
                event.preventDefault();
                setNodes(i, cytoLayers, setCytoLayers, taskId, index);
                }
            }}
            />
            </form>
            }
        </div>
        );
        buttons.push(button);
    }
return buttons;
}

export { GenerateFloatingButtons, LayerRemoveButton, LayerAddButton};