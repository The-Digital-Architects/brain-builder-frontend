function init(numPoints, numClusters, setGroups, setIsRestartDisabled, setFlag, setDots, width, height) {
  console.log("init");  
  setIsRestartDisabled(false);

    const N = numPoints;
    const K = numClusters;

    setGroups([]);

    for (let i = 0; i < K; i++) {
      let g = {
        dots: [],
        color: 'hsl(' + (i * 360 / K) + ',100%,50%)',
        center: {
          x: Math.random() * width,
          y: Math.random() * height
        },
        init: {
          center: {}
        }
      };
      g.init.center = {
        x: g.center.x,
        y: g.center.y
      };
      setGroups(currentGroups => [...currentGroups, g]);
    }
  

    setDots([]);
    setFlag(false);

    for (let i = 0; i < N; i++) {
      let dot ={
        x: Math.random() * width,
        y: Math.random() * height,
        group: undefined
      };
      dot.init = {
        x: dot.x,
        y: dot.y,
        group: dot.group
      };
      setDots(currentGroups => [...currentGroups, dot]);
    }
}

function step(setIsRestartDisabled, flag, setFlag, draw, svgRef, linegRef, dotgRef, centergRef, groups, setGroups, dots, setDots) {
  console.log("step");
  setIsRestartDisabled(false);
  if (flag) {
    moveCenter(groups, setGroups);
    draw(svgRef.current, linegRef.current, dotgRef.current, centergRef.current, groups, dots);
  } else {
    updateGroups(dots, setDots, groups, setGroups);
    draw(svgRef.current, linegRef.current, dotgRef.current, centergRef.current, groups, dots);
  }
  setFlag(!flag);
}

function restart(groups, setGroups, dots, setDots, setFlag, setIsRestartDisabled) {
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
  
}

function updateGroups(dots, setDots, groups, setGroups) {
  console.log("updateGroups");
  
  setGroups(groups.map(g => ({ ...g, dots: [] })));

  const newDots = dots.map(dot => ({ ...dot }));

  newDots.forEach(function(dot) {
    // find the nearest group
    let min = Infinity;
    let group;
    groups.forEach(function(g) {
      let d = Math.pow(g.center.x - dot.x, 2) + Math.pow(g.center.y - dot.y, 2);
      if (d < min) {
        min = d;
        group = g;
      }
    });

    // update group
    group.dots.push(dot);
    dot.group = group;
  });

  setDots(newDots);
}

export { init, step, restart };