function initKMeans(numPoints, numClusters, setGroups, setIsRestartDisabled, setFlag, setDots, width, height) {
  console.log("init");  
  setIsRestartDisabled(false);

  const N = numPoints;
  const K = numClusters;

  let newGroups = [];

  for (let i = 0; i < K; i++) {
    let g = {
      dots: [],
      color: 'hsl(' + (i * 360 / K) + ',100%,50%)',
      center: {
        x: Math.random() * (width - 30) + 5,
        y: Math.random() * (height - 30) + 5,
      },
      init: {
        center: {}
      }
    };
    g.init.center = {
      x: g.center.x,
      y: g.center.y
    };
    newGroups.push(g);
  }
  setGroups(newGroups);

  let newDots = [];
  setFlag(false);

  for (let i = 0; i < N; i++) {
    let dot ={
      x: Math.random() * (width - 20),
      y: Math.random() * (height - 20),
      group: undefined
    };
    dot.init = {
      x: dot.x,
      y: dot.y,
      group: dot.group
    };
    newDots.push(dot);
  }
  setDots(newDots);

  return { newGroups, newDots };
}

function stepKMeans(setIsRestartDisabled, flag, setFlag, draw, svgRef, linegRef, dotgRef, centergRef, groups, setGroups, dots, setDots) {
  console.log(`step, flag: ${flag} which means we are ${flag ? "moving the center" : "updating the groups"}`);
  setIsRestartDisabled(false);

  let newGroups = null
  let newDots = null;
  let updateOutput = null;

  if (flag) {
    console.log("Groups & dots before moveCenter", { groups, dots });

    newGroups = moveCenter(groups, setGroups);
    newDots = dots;

    console.log("Groups & dots after moveCenter", { newGroups, newDots });

    draw(svgRef.current, linegRef.current, dotgRef.current, centergRef.current, newGroups, newDots, "kmeans");
  } else {
    console.log("Groups & dots before updateGroups", { groups, dots });

    updateOutput = updateGroups(dots, setDots, groups, setGroups);
    newGroups = updateOutput.newGroups;
    newDots = updateOutput.newDots;

    console.log("Groups & dots after updateGroups", { newGroups, newDots });
    
    draw(svgRef.current, linegRef.current, dotgRef.current, centergRef.current, newGroups, newDots, "kmeans");
  }
  setFlag(!flag);
}

function restartKMeans(groups, setGroups, dots, setDots, setFlag, setIsRestartDisabled) {
    console.log("restart");
    setFlag(false);
    setIsRestartDisabled(true);
  
    const updatedGroups = groups.map(g => ({
        ...g,
        dots: [],
        center: { ...g.center, x: g.init.center.x, y: g.init.center.y },
    }));

    setGroups(updatedGroups);
  
    const updatedDots = dots.map(dot => ({
        ...dot,
        x: dot.init.x,
        y: dot.init.y,
        group: undefined,
    }));

    setDots(updatedDots);

    return { newGroups: updatedGroups, newDots: updatedDots };
}

function moveCenter(groups, setGroups) {
  console.log("moveCenter");

  const newGroups = groups.map(group => {
    if (group.dots.length === 0) return { ...group };

    const { x, y } = group.dots.reduce((acc, dot) => {
      acc.x += dot.x;
      acc.y += dot.y;
      return acc;
    }, { x: 0, y: 0 });

    return {
      ...group,
      center: {
        x: x / group.dots.length,
        y: y / group.dots.length,
      },
    };
  });

  setGroups(newGroups);
  
  return newGroups;
}

function updateGroups(dots, setDots, groups, setGroups) {
  console.log("updateGroups");
  
  // Step 1: Reset the dots array in groups
  const resetGroups = groups.map(g => ({ ...g, dots: [] }));

  // Step 2: Copy dots
  const newDots = dots.map(dot => ({ ...dot }));

  // Step 3: Assign dots to groups
  const groupAssignments = new Map();
  newDots.forEach(function(dot) {
    // find the nearest group
    let min = Infinity;
    let nearestGroupIndex = null;
    resetGroups.forEach((g, index) => {
      let d = Math.pow(g.center.x - dot.x, 2) + Math.pow(g.center.y - dot.y, 2);
      if (d < min) {
        min = d;
        nearestGroupIndex = index;
      }
    });

    // update group
    if (!groupAssignments.has(nearestGroupIndex)) {
      groupAssignments.set(nearestGroupIndex, []);
    }
    groupAssignments.get(nearestGroupIndex).push(dot);
    dot.group = resetGroups[nearestGroupIndex];
  });

  // Step 4: Update groups with new dots
  const updatedGroups = resetGroups.map((group, index) => ({
    ...group,
    dots: groupAssignments.get(index) || []
  }));

  // Step 5: Update the states
  setDots(newDots);
  setGroups(updatedGroups);

  return { newGroups: updatedGroups, newDots };
}

export { initKMeans, stepKMeans, restartKMeans };