'use client';

import React, { useState, useRef } from 'react';
import VideoInferenceGraph from './VideoInferenceGraph';

const VideoUploader = () => {
  const [video, setVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [csvData, setCsvData] = useState([]); // 비디오 추론 데이터
  const [deepfakeProbability, setDeepfakeProbability] = useState(0.01); // 이미지 추론 데이터
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        alert('Please upload a valid video file.');
        return;
      }
      const url = URL.createObjectURL(file);
      setVideo({ file, url });
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // 이미지 추론 (Frame-by-Frame)
  const handleAnalyzeRealtime = async () => {
    if (!videoRef.current || !video) return;
    setIsAnalyzing(true);

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const interval = setInterval(async () => {
      if (videoRef.current.paused || videoRef.current.ended) {
        clearInterval(interval);
        setIsAnalyzing(false);
        return;
      }

      videoRef.current.pause();
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg'));

      try {
        const formData = new FormData();
        formData.append('image', blob);

        const response = await fetch('${process.env.REACT_APP_API_BASE_URL}/image-inference/', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Frame analysis failed');
        }

        const result = await response.json();
        setDeepfakeProbability(result.deepfake_probability || 0);
      } catch (error) {
        console.error('Error analyzing frame:', error);
      } finally {
        videoRef.current.play();
      }
    }, 333); // 1초에 3프레임

    return () => clearInterval(interval);
  };

  // 비디오 추론 (전체 분석)
  const handleAnalyzeVideo = async () => {
    if (!video) return;
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('video', video.file);

      const response = await fetch('${process.env.REACT_APP_API_BASE_URL}/api/video-inference/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Video analysis failed');
      }

      const csvText = await response.text();
      console.log('CSV Response:', csvText);

      // CSV 데이터 파싱
      const parsedCsvData = csvText
        .trim()
        .split('\n')
        .slice(1) // 첫 번째 줄 (헤더) 제외
        .map((line) => {
          const [time, deepfake_probability] = line.split(',');
          return { time: time.trim(), deepfake_probability: deepfake_probability.trim() };
        });

      setCsvData(parsedCsvData); // 그래프 데이터 상태 설정
    } catch (error) {
      console.error('Error analyzing video:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-8">
      {/* 파일 업로드 및 버튼 */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold text-2xl py-4 px-8 rounded-lg"
        >
          Upload Video
        </button>
      </div>

      <div className="flex flex-row space-x-12">
        {/* 비디오 플레이어 */}
        <div className="relative">
          {video ? (
            <video
              ref={videoRef}
              src={video.url}
              className="w-[720px] h-[405px] rounded-lg shadow-lg bg-black"
              controls={true}
            />
          ) : (
            <div className="w-[720px] h-[405px] rounded-lg shadow-lg bg-gray-300 flex items-center justify-center">
              <span className="text-gray-500 text-2xl">No video uploaded</span>
            </div>
          )}
          <div className="mt-6 flex justify-center space-x-4">
            <button
              onClick={handlePlayPause}
              className="bg-green-500 hover:bg-green-700 text-white font-bold text-xl py-3 px-6 rounded-lg"
              disabled={!video}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              onClick={handleAnalyzeRealtime}
              className="bg-red-500 hover:bg-red-700 text-white font-bold text-xl py-3 px-6 rounded-lg"
              disabled={!video || isAnalyzing}
            >
              Analyze Frame-by-Frame
            </button>
            <button
              onClick={handleAnalyzeVideo}
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold text-xl py-3 px-6 rounded-lg"
              disabled={!video || isAnalyzing}
            >
              Analyze Full Video
            </button>
          </div>
          {video && (
            <div className="mt-4 text-gray-600 text-lg">
              File name: {video.file.name}
              <br />
              Size: {(video.file.size / (1024 * 1024)).toFixed(2)} MB
            </div>
          )}
        </div>

        {/* 딥페이크 확률 표시 */}
        <div className="flex flex-col items-center justify-center bg-gray-200 p-12 rounded-lg shadow-lg">
          <h2 className="text-4xl font-bold text-gray-800">Deepfake Probability</h2>
          <p
            className={`text-6xl font-extrabold mt-8 ${
              deepfakeProbability > 50 ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {deepfakeProbability.toFixed(2)}%
          </p>
        </div>

        {/* 그래프 컴포넌트 */}
        <div className="w-full max-w-4xl">
          <VideoInferenceGraph csvData={csvData} />
        </div>
      </div>
    </div>
  );
};

export default VideoUploader;