import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

function generateData(numPoints, numClusters) {
    const data = [];
    for (let i = 0; i < numClusters; i++) {
        const centerX = Math.random() * 500;
        const centerY = Math.random() * 500;
        for (let j = 0; j < numPoints / numClusters; j++) {
            const x = centerX + Math.random() * 50 - 25;
            const y = centerY + Math.random() * 50 - 25;
            data.push({ x, y, cluster: i });
        }
    }
    return data;
}

function KMeansClusteringVisualization() {
    const svgRef = useRef(null);
    const [data, setData] = useState([]);
    const [numPoints, setNumPoints] = useState(200);
    const [numClusters, setNumClusters] = useState(4);

    useEffect(() => {
        const generatedData = generateData(numPoints, numClusters);
        setData(generatedData);

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        svg.attr('width', '100%')
           .attr('height', '100%')
           .attr('viewBox', '0 0 500 500');

        const xScale = d3.scaleLinear().domain([0, 500]).range([50, 450]);
        const yScale = d3.scaleLinear().domain([0, 500]).range([450, 50]);
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        svg.selectAll('circle')
        .data(data)
        .join('circle')
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y))
        .attr('r', 5)
        .attr('fill', d => colorScale(d.cluster))
        .attr('aria-label', d => `Cluster ${d.cluster}: (${d.x.toFixed(2)}, ${d.y.toFixed(2)})`);

        svg.append('g')
        .attr('transform', 'translate(0, 450)')
        .call(d3.axisBottom(xScale));

        svg.append('g')
        .attr('transform', 'translate(50, 0)')
        .call(d3.axisLeft(yScale));
    }, [numPoints, numClusters]); // React to changes in numPoints and numClusters

    return <svg ref={svgRef}></svg>;
}

export default KMeansClusteringVisualization;