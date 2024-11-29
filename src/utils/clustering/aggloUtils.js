import { v4 as uuidv4 } from 'uuid';

function initAgglo(numPoints, numClusters, setGroups, setIsRestartDisabled, setFlag, setDots, width, height) {
  console.log("initAgglo");
  setIsRestartDisabled(false);

  const N = numPoints;
  const K = numClusters;

  let newGroups = [];
  let newDots = [];

  // Initialize each point as its own cluster
  for (let i = 0; i < N; i++) {
    let dot = {
      x: Math.random() * (width - 20),
      y: Math.random() * (height - 20),
      group: {
        id: uuidv4(),
        dots: [],
        color: 'hsl(' + (i * 360 / N) + ',100%,50%)',
        center: {}
      }
    };
    dot.group.dots.push(dot);
    dot.group.center = { x: dot.x, y: dot.y };
    dot.init = {
      x: dot.x,
      y: dot.y,
      group: dot.group
    };
    newDots.push(dot);
    newGroups.push(dot.group);
  }

  setGroups(newGroups);
  setDots(newDots);
  setFlag(false);

  return { newGroups, newDots };
}

function stepAgglo(setIsRestartDisabled, flag, setFlag, draw, svgRef, linegRef, dotgRef, centergRef, groups, setGroups, dots, setDots) {
  console.log("stepAgglo");
  setIsRestartDisabled(false);

  if (groups.length <= 1) {
    console.log("All points have been clustered into one group.");
    return;
  }

  // Find the two closest groups
  let minDistance = Infinity;
  let closestPair = [];

  for (let i = 0; i < groups.length; i++) {
    for (let j = i + 1; j < groups.length; j++) {
      let distance = Math.pow(groups[i].center.x - groups[j].center.x, 2) + Math.pow(groups[i].center.y - groups[j].center.y, 2);
      if (distance < minDistance) {
        minDistance = distance;
        closestPair = [i, j];
      }
    }
  }

  // Merge the two closest groups
  let [i, j] = closestPair;
  let mergedGroup = {
    id: uuidv4(),
    dots: [...groups[i].dots, ...groups[j].dots],
    color: groups[i].color,
    center: {}
  };

  // Update the center of the merged group
  const { x, y } = mergedGroup.dots.reduce((acc, dot) => {
    acc.x += dot.x;
    acc.y += dot.y;
    return acc;
  }, { x: 0, y: 0 });

  mergedGroup.center = {
    x: x / mergedGroup.dots.length,
    y: y / mergedGroup.dots.length
  };

  // Update the group references in the dots
  mergedGroup.dots.forEach(dot => {
    dot.group = mergedGroup;
  });

  // Remove the merged groups and add the new merged group
  let newGroups = groups.filter((_, index) => index !== i && index !== j);
  newGroups.push(mergedGroup);

  setGroups(newGroups);
  draw(svgRef.current, linegRef.current, dotgRef.current, centergRef.current, newGroups, dots);
}

function restartAgglo(groups, setGroups, dots, setDots, setFlag, setIsRestartDisabled) {
  console.log("restartAgglo");
  setFlag(false);
  setIsRestartDisabled(true);

  const updatedGroups = dots.map(dot => ({
    id: uuidv4(),
    dots: [dot],
    color: dot.group.color,
    center: { x: dot.init.x, y: dot.init.y }
  }));

  const updatedDots = dots.map(dot => ({
    ...dot,
    x: dot.init.x,
    y: dot.init.y,
    group: updatedGroups.find(group => group.dots.includes(dot))
  }));

  setGroups(updatedGroups);
  setDots(updatedDots);

  return { newGroups: updatedGroups, newDots: updatedDots };
}

export { initAgglo, stepAgglo, restartAgglo };