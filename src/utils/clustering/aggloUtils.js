import { v4 as uuidv4 } from 'uuid';
import * as d3 from 'd3';

function initAgglo(numPoints, setGroups, setFlag, setDots, width, height) {
  const N = numPoints;

  let newGroups = [];
  let newDots = [];

  // Initialize each point as its own cluster
  for (let i = 0; i < N; i++) {
    let dot = {
      id: uuidv4(), // Add unique identifier for each dot
      x: Math.random() * (width - 20),
      y: Math.random() * (height - 20),
      group: {
        id: uuidv4(), // Add unique identifier for each group
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

function stepAgglo(setIsStepDisabled, draw, linegRef, dotgRef, centergRef, groups, setGroups, dots) {
  if (groups.length <= 1) {
    setIsStepDisabled(true);
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
    color: averageColor(groups[i].color, groups[j].color),
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
  draw(linegRef.current, dotgRef.current, centergRef.current, newGroups, dots);
}

function restartAgglo(groups, setGroups, dots, setDots, setFlag) {
  setFlag(false);

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

function averageColor(color1, color2) {
  const hsl1 = d3.hsl(color1);
  const hsl2 = d3.hsl(color2);

  const avgH = Math.max(0, Math.min(360, (hsl1.h + hsl2.h) / 2 + (Math.random() - 0.5) * 60)); // Add randomness to hue
  const avgS = Math.max(0, Math.min(1, (hsl1.s + hsl2.s) / 2 + (Math.random() - 0.5) * 0.4)); // Add randomness to saturation
  const avgL = Math.max(0, Math.min(1, (hsl1.l + hsl2.l) / 2 + (Math.random() - 0.5) * 0.4)); // Add randomness to lightness

  return d3.hsl(avgH, avgS, avgL).toString();
}

export { initAgglo, stepAgglo, restartAgglo };