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