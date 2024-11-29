import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import Header from './common/header';
import { Flex, Button, TextField, Box } from '@radix-ui/themes';
import { init, step, restart } from './utils/clustering/clusteringUtils';

function draw(svg, lineg, dotg, centerg, groups, dots) {
    console.log("draw", { groups, dots });

    let circles = dotg.selectAll('circle')
      .data(dots);
    circles.enter()
      .append('circle');
    circles.exit().remove();
    circles
      .transition()
      .duration(500)
      .attr('cx', function(d) { return d.x; })
      .attr('cy', function(d) { return d.y; })
      .attr('fill', function(d) { return d.group ? d.group.color : '#ffffff'; })
      .attr('r', 5);
  
    if (dots[0]?.group) {
      console.log("draw lines", { dots });
      let l = lineg.selectAll('line')
        .data(dots);
      const updateLine = function(lines) {
        lines
          .attr('x1', function(d) { return d.x; })
          .attr('y1', function(d) { return d.y; })
          .attr('x2', function(d) { return d.group.center.x; })
          .attr('y2', function(d) { return d.group.center.y; })
          .attr('stroke', function(d) { return d.group.color; });
      };
      updateLine(l.enter().append('line'));
      updateLine(l.transition().duration(500));
      l.exit().remove();
    } else {
      console.log("remove lines");
      lineg.selectAll('line').remove();
    }
  
    let c = centerg.selectAll('path')
      .data(groups);
    const updateCenters = function(centers) {
      centers
        .attr('transform', function(d) { return "translate(" + d.center.x + "," + d.center.y + ") rotate(45)";})
        .attr('fill', function(d,i) { return d.color; })
        .attr('stroke', '#aabbcc');
    };
    c.exit().remove();
    updateCenters(c.enter()
      .append('path')
      .attr('d', d3.symbol().type(d3.symbolCross).size(200))
      .attr('stroke', '#aabbcc'));
    updateCenters(c
      .transition()
      .duration(500));
}

function KMeansClusteringVisualization(clusteringId) {
    const [numPoints, setNumPoints] = useState(200);
    const [numClusters, setNumClusters] = useState(2);
    const [isRestartDisabled, setIsRestartDisabled] = useState(true);
    const [flag, setFlag] = useState(false);
    const [groups, setGroups] = useState([]);
    const [dots, setDots] = useState([]);
    const [nOfSteps, setNOfSteps] = useState(0);
    const [width, setWidth] = useState(500);
    const [height, setHeight] = useState(500);

    // Refs for SVG and D3 groups
    const svgRef = useRef(null);
    const linegRef = useRef(null);
    const dotgRef = useRef(null);
    const centergRef = useRef(null);

    useEffect(() => {
        console.log("useEffect (initialization)");
        console.log("clusteringId", clusteringId);

        if (!svgRef.current) {
            // Initialize SVG and groups if not already initialized
            const svg = d3.select("#kmeans").append("svg")
                .attr('width', width)
                .attr('height', height)
                .style('padding', '10px')
                .style('background', '#223344')
                .style('cursor', 'pointer')
                .style('user-select', 'none')
                .on('click', function(event) {
                    event.preventDefault();
                    //handleStep();
                });
            svgRef.current = svg;

            // Initialize groups
            linegRef.current = svg.append('g');
            dotgRef.current = svg.append('g');
            centergRef.current = svg.append('g');
        }

        handleReset();
        //not elegant but fixes the issue of not rendering the dots on the first render
        handleReset();

        console.log("initialization completed")

        // Cleanup function
        return () => {
            if (svgRef.current) {
                svgRef.current.on('click', null); // Remove click event listener
            }
        };
    }, []); // this runs only once on mount
    
    const handleReset = () => {
        console.log("handleReset");

        setNOfSteps(0);

        const initOutput = init(numPoints, numClusters, setGroups, setIsRestartDisabled, setFlag, setDots, width, height);
        console.log("Groups & dots after init", initOutput);
        // Use refs to access SVG and groups
        draw(svgRef.current, linegRef.current, dotgRef.current, centergRef.current, initOutput.newGroups, initOutput.newDots);
    };

    const handleStep = () => {
        console.log("handleStep");

        setNOfSteps(nOfSteps + 1);

        step(setIsRestartDisabled, flag, setFlag, draw, svgRef, linegRef, dotgRef, centergRef, groups, setGroups, dots, setDots);
    };
    
    const handleRestart = () => {
        console.log("handleRestart");

        setNOfSteps(0);

        const restartOutput = restart(groups, setGroups, dots, setDots, setFlag, setIsRestartDisabled);
        console.log("Groups & dots after restart", restartOutput);
        draw(svgRef.current, linegRef.current, dotgRef.current, centergRef.current, restartOutput.newGroups, restartOutput.newDots);
    };

    const SSE = groups.reduce((acc, group) => {
        const groupWCSS = group.dots.reduce((groupAcc, dot) => {
          const distanceSquared = (Math.pow(dot.x - group.center.x, 2) + Math.pow(dot.y - group.center.y, 2))/2500; // divided by 50 squared to change svg size from 500x500 to 10x10
          return groupAcc + distanceSquared;
        }, 0);
        return acc + groupWCSS;
      }, 0);

    return (
        <Flex direction="column" gap="1">

            <Header showHomeButton={true} />

            <Flex gap="3" direction="column" style={{padding: '10px'}}>
            
                <Flex gap="3">

                    <Flex gap="2" style={{ alignItems: 'center' }}>
                        <label style={{ verticalAlign: 'middle', fontSize: "var(--font-size-2)" }}>
                            Number of points:
                        </label>
                        
                        <Box maxWidth="15vw">
                            <TextField.Root size="2">
                                <TextField.Input type="number" value={numPoints} onChange={(e) => setNumPoints(Number(e.target.value))} />
                            </TextField.Root>
                        </Box>
                    </Flex>

                    <Flex gap="2" style={{ alignItems: 'center' }}>
                        <label style={{ verticalAlign: 'middle', fontSize: "var(--font-size-2)" }}>
                            Number of clusters:
                        </label>

                        <Box maxWidth="15vw">
                            <TextField.Root size="2">
                                <TextField.Input type="number" value={numClusters} onChange={(e) => setNumClusters(Number(e.target.value))} />
                            </TextField.Root>
                        </Box>
                    </Flex>

                </Flex>

                <div id="kmeans"/>

                <Flex gap="2">
                    <Button id="run" onClick={handleReset}>
                        Generate new points
                    </Button>
                    <Button id="step" onClick={handleStep}>
                        Step
                    </Button>
                    <Button id="restart" onClick={handleRestart} disabled={isRestartDisabled}>
                        Restart
                    </Button>
                </Flex>

                <label style={{ fontSize: "var(--font-size-2)" }}>
                    Steps: {nOfSteps}
                </label>

                <label style={{ fontSize: "var(--font-size-2)" }}>
                    SSE(WCSS): {SSE.toFixed(3)}
                </label>

            </Flex>

        </Flex>
    );
}

export default KMeansClusteringVisualization;