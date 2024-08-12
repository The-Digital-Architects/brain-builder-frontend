import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import Header from './common/header';
import { Flex, Button } from '@radix-ui/themes';
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
      .attr('d', d3.symbol().type(d3.symbolCross))
      .attr('stroke', '#aabbcc'));
    updateCenters(c
      .transition()
      .duration(500));
}

function KMeansClusteringVisualization() {
    const [numPoints, setNumPoints] = useState(200);
    const [numClusters, setNumClusters] = useState(2);
    const [isRestartDisabled, setIsRestartDisabled] = useState(true);
    const [flag, setFlag] = useState(false);
    const [groups, setGroups] = useState([]);
    const [dots, setDots] = useState([]);
    const [width, setWidth] = useState(500);
    const [height, setHeight] = useState(500);

    // Refs for SVG and D3 groups
    const svgRef = useRef(null);
    const linegRef = useRef(null);
    const dotgRef = useRef(null);
    const centergRef = useRef(null);

    useEffect(() => {
        console.log("useEffect (initialization)");

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
                    handleStep();
                });
            svgRef.current = svg;

            // Initialize groups
            linegRef.current = svg.append('g');
            dotgRef.current = svg.append('g');
            centergRef.current = svg.append('g');
        }

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

        init(numPoints, numClusters, setGroups, setIsRestartDisabled, setFlag, setDots, width, height);
        console.log("Groups & dots after init", { groups, dots });
        // Use refs to access SVG and groups
        draw(svgRef.current, linegRef.current, dotgRef.current, centergRef.current, groups, dots);
    };

    const handleStep = () => {
        console.log("handleStep");

        step(setIsRestartDisabled, flag, setFlag, draw, svgRef, linegRef, dotgRef, centergRef, groups, setGroups, dots, setDots);
    };
    
    const handleRestart = () => {
        console.log("handleRestart");

        restart(groups, setGroups, dots, setDots, setFlag, setIsRestartDisabled);
        console.log("Groups & dots after restart", { groups, dots });
        draw(svgRef.current, linegRef.current, dotgRef.current, centergRef.current, groups, dots);
    };

    return (
        <Flex direction="column" gap="2" style={{padding: '10px'}}>

            <Header showHomeButton={true} />

            <Flex gap="1">
                <label>
                    Number of Points:{" "}
                    <input
                        type="number"
                        value={numPoints}
                        onChange={(e) => setNumPoints(Number(e.target.value))}
                    />
                </label>
                <label>
                    Number of Clusters:{" "}
                    <input
                        type="number"
                        value={numClusters}
                        onChange={(e) => setNumClusters(Number(e.target.value))}
                    />
                </label>
            </Flex>

            <div id="kmeans"/>

            <Flex gap="1">
                <Button id="run" onClick={handleReset}>
                    Reset
                </Button>
                <Button id="step" onClick={handleStep}>
                    Step
                </Button>
                <Button id="restart" onClick={handleRestart} disabled={isRestartDisabled}>
                    Restart
                </Button>
            </Flex>

        </Flex>
    );
}

export default KMeansClusteringVisualization;