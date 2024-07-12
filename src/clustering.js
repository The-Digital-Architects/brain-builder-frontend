import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import Header from './common/header';
import { Flex, Button } from '@radix-ui/themes';
const { kmeans } = require('ml-kmeans');

function generateData(numPoints) {
    const data = [];
    for (let i = 0; i < numPoints; i++) {
        const x = Math.random() * 500;
        const y = Math.random() * 500;
        data.push({ x, y });
    }
    return data;
}

function applyKMeansClustering(data, numClusters) {
    // Convert your data into a format suitable for the KMeans library
    const points = data.map(d => [d.x, d.y]);
    const KMeans = new kmeans(points, numClusters);
    return data.map((d, i) => ({ ...d, cluster: KMeans.clusters[i] }));
}

function KMeansClusteringVisualization() {
    const svgRef = useRef(null);
    const [data, setData] = useState([]);
    const [numPoints, setNumPoints] = useState(200);
    const [numClusters, setNumClusters] = useState(4);

    useEffect(() => {
        if (data.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        svg.attr('width', '50%')
           .attr('height', '50%')
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
    }, [data]);

    useEffect(() => {
        const generatedData = generateData(numPoints, numClusters);
        // Apply KMeans clustering here
        const clusteredData = applyKMeansClustering(generatedData, numClusters);
        setData(clusteredData);
    }, [numPoints, numClusters, applyKMeansClustering]);


    return (
        <Flex direction="column" gap="2">
            <Header showHomeButton={true} />
            <Flex gap="2">
                <label>
                    Number of Points:
                    <input
                        type="number"
                        value={numPoints}
                        onChange={(e) => setNumPoints(Number(e.target.value))}
                    />
                </label>
                <label>
                    Number of Clusters:
                    <input
                        type="number"
                        value={numClusters}
                        onChange={(e) => setNumClusters(Number(e.target.value))}
                    />
                </label>
                <Button onClick={() => setData(generateData(numPoints, numClusters))}>
                    Generate
                </Button>
            </Flex>
            <svg ref={svgRef}></svg>
        </Flex>
    );
}

export default KMeansClusteringVisualization;