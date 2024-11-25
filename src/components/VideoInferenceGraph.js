import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const VideoInferenceGraph = ({ csvData }) => {
  if (!Array.isArray(csvData) || csvData.length === 0) {
    return <p className="text-center text-gray-500">No inference data available.</p>;
  }

  const labels = csvData.map((row) => row.time || 'Unknown');
  const probabilities = csvData.map((row) => parseFloat(row.deepfake_probability) || 0);

  const data = {
    labels,
    datasets: [
      {
        label: 'Deepfake Probability',
        data: probabilities,
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: { enabled: true },
    },
    scales: {
      x: { title: { display: true, text: 'Time (s)' } },
      y: { title: { display: true, text: 'Probability (%)' }, min: 0, max: 100 },
    },
  };

  return (
    <div className="mt-8">
      <h2 className="text-center text-xl font-bold mb-4">Deepfake Analysis Results</h2>
      <Line data={data} options={options} />
    </div>
  );
};

export default VideoInferenceGraph;