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

  // 여유 공간을 위해 범위를 약간 확장 (5% 정도)
  const padding = (maxProbability - minProbability) * 0.05;
  const yMax = Math.min(100, maxProbability + padding); // 100을 넘지 않도록
  const yMin = Math.max(0, minProbability - padding);   // 0보다 작아지지 않도록

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
          callback: function(value, index, values) {
            return parseFloat(this.getLabelForValue(value)).toFixed(2); // 소수점 둘째 자리까지 표시
          },
        },
      },
      y: { 
        title: { display: true, text: 'Probability (%)' }, 
        min: yMin,  // 자동 계산된 최소값
        max: yMax,  // 자동 계산된 최대값
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
