import * as d3 from "d3";
import { useRef, useEffect, useMemo } from "react";

export function LinePlot({
  data,
  width = 640,
  height = 400,
  marginTop = 20,
  marginRight = 20,
  marginBottom = 30,
  marginLeft = 40,
}) {
  const gx = useRef();
  const gy = useRef();
  const cleanData = useMemo(() => {
    const initialParse = data
      .map((d) => ({
        ...d,
        value: +d.value,
        date: d.date,
      }))
      .filter((d) => !isNaN(d.value) && d.value !== null);

    const mu = d3.mean(initialParse, (d) => d.value);
    const omega = d3.deviation(initialParse, (d) => d.value);
    const threshold = 3;

    const removeOutliers = initialParse.filter((d) => {
      const distance = Math.abs(d.value - mu);
      return distance <= omega * threshold;
    });
    return removeOutliers;
  }, [data]);
  console.log(cleanData);

  const x = d3
    .scaleTime()
    .domain(d3.extent(cleanData, (d) => d.date))
    .range([marginLeft, width - marginRight]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(cleanData, (d) => +d.value)]) //the + converts strings to int
    .nice()
    .range([height - marginBottom, marginTop]);

  const line = d3
    .line()
    .x((d) => x(d.date))
    .y((d) => y(d.value));

  useEffect(() => void d3.select(gx.current).call(d3.axisBottom(x)), [gx, x]);
  useEffect(() => void d3.select(gy.current).call(d3.axisLeft(y)), [gy, y]);
  return (
    <svg width={width} height={height}>
      <g ref={gx} transform={`translate(0,${height - marginBottom})`} />
      <g ref={gy} transform={`translate(${marginLeft},0)`} />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        d={line(cleanData)}
      />
      <g fill="white" stroke="currentColor" strokeWidth="1.5">
        {cleanData.map((d, i) => (
          <circle key={i} cx={x(d.date)} cy={y(d.value)} r="2.5" />
        ))}
      </g>
    </svg>
  );
}
