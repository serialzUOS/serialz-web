'use client';

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
  const maxProbability = Math.max(...probabilities);
  const minProbability = Math.min(...probabilities);

  // 데이터가 모두 동일한 경우 대비
  const isFlat = maxProbability === minProbability;
  const padding = isFlat ? 2 : (maxProbability - minProbability) * 0.05; // 최소 패딩 추가
  const yMax = isFlat ? Math.min(100, maxProbability + padding) : Math.min(100, maxProbability + padding);
  const yMin = isFlat ? Math.max(0, maxProbability - padding) : Math.max(0, minProbability - padding);

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
    maintainAspectRatio: false, // 비율 유지 비활성화
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        title: { display: true, text: 'Time (s)' },
        ticks: {
          callback: function (value, index, values) {
            return parseFloat(this.getLabelForValue(value)).toFixed(2); // 소수점 둘째 자리까지 표시
          },
        },
      },
      y: {
        title: { display: true, text: 'Probability (%)' },
        min: yMin, // 자동 계산된 최소값 또는 고정값
        max: yMax, // 자동 계산된 최대값 또는 고정값
      },
    },
  };

  return (
    <div className="mt-8 w-full overflow-x-auto"> {/* 가로 스크롤 가능 */}
      <div className="min-w-[1400px] h-[500px]"> {/* 더 넓고 높게 설정 */}
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default VideoInferenceGraph;
