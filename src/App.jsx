import * as d3 from "d3";
import React, { useState, useEffect } from "react";
import "./styles.css";
import { LinePlot } from "./LinePlot.jsx";

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const response = await fetch(
          "dynamicapp/req/CSVDataServlet?" +
            new URLSearchParams({
              Stations: "SLI",
              SensorNums: "18",
              dur_code: "H",
              Start: "2025-11-01",
              End: today,
            }).toString()
        );
        /* Stations=SWM&SensorNums=3&dur_code=D&Start=2025-11-01&End=2026-03-24"*/

        if (!response.ok) {
          throw new Error(`HTTP error, status: $(response.status}`);
        }
        let csv = await response.text();
        let parsedData = d3.csvParse(csv, (d) => {
          return {
            date: d3.timeParse("%Y%m%d %H%M")(d["DATE TIME"]), // Adjust format to match your CSV
            value: d["VALUE"],
          };
        });

        setData(parsedData);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // The empty dependency array ensures this runs once on mount

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return (
    <>
      <LinePlot data={data} />
    </>
  );
}
