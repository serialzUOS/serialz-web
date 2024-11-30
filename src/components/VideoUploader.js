'use client';

import React, { useState, useRef } from 'react';
import VideoInferenceGraph from './VideoInferenceGraph';
import { sampleData } from './sampleData';
import Image from 'next/image';

const VideoUploader = () => {
  const [video, setVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnalyzingFrame, setIsAnalyzingFrame] = useState(false); // 프레임 분석 상태
  const [isAnalyzingVideo, setIsAnalyzingVideo] = useState(false); // 비디오 분석 상태
  const [csvData, setCsvData] = useState(sampleData);
  const [deepfakeProbability, setDeepfakeProbability] = useState(0.0);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const calculateAverageProbability = (data) => {
    if (!data || data.length === 0) return 0;
    const sum = data.reduce((acc, curr) => acc + parseFloat(curr.deepfake_probability), 0);
    return sum / data.length;
  };
  

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

  // 실시간 프레임 분석
  const handleAnalyzeRealtime = async () => {
    if (!videoRef.current || !video) return;
    setIsAnalyzingFrame(true); // 프레임 분석 상태 시작

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    let isRunning = true;

    const processFrame = async () => {
      if (!isRunning || videoRef.current.paused || videoRef.current.ended) {
        setIsAnalyzingFrame(false); // 프레임 분석 종료
        return;
      }

      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg'));

      if (blob) {
        const formData = new FormData();
        formData.append('image', blob);

        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/image-inference/`, {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const result = await response.json();
            setDeepfakeProbability(result.deepfake_probability || 0);
          } else {
            console.error('Frame analysis failed');
          }
        } catch (error) {
          console.error('Error analyzing frame:', error);
        }
      }

      if (isRunning) {
        requestAnimationFrame(processFrame);
      }
    };

    videoRef.current.play();
    requestAnimationFrame(processFrame);

    return () => {
      isRunning = false;
      setIsAnalyzingFrame(false); // 프레임 분석 종료
    };
  };

  // 전체 비디오 분석
  const handleAnalyzeVideo = async () => {
    if (!video) return;
    setIsAnalyzingVideo(true); // 비디오 분석 상태 시작

    try {
      const formData = new FormData();
      formData.append('video', video.file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/video-inference/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Video analysis failed');
      }

      const csvText = await response.text();
      console.log('CSV Response:', csvText);

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
      setIsAnalyzingVideo(false); // 비디오 분석 종료
    }
  };

  const handleVideoEnd = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0; // 영상 재생 위치를 0초로 설정
      setIsPlaying(false); // 버튼을 'Play' 상태로 변경
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-8">
      {isAnalyzingVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white text-lg font-bold">Analyzing video, please wait...</p>
          </div>
        </div>
      )}
      <div className="flex flex-row space-x-12">
        <div className="relative flex flex-col">
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
              className="bg-white hover:bg-blue-200 text-blue-500 font-bold text-l my-2 py-2 px-4 rounded-lg border border-blue-500"
            >
              Upload Video
            </button>
          </div>
          {video && (
            <div className="mt-4 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">File name</div>
                  <div className="text-lg font-medium text-gray-900">{video.file.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Size</div>
                  <div className="text-lg font-medium text-gray-900">
                    {(video.file.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="relative">
            {video ? (
              <>
                <video
                  ref={videoRef}
                  src={video.url}
                  className="w-[520px] h-[270px] rounded-lg shadow-lg bg-black"
                  controls={true}
                  onEnded={handleVideoEnd}
                />
             {calculateAverageProbability(csvData) > 50 && (
              <div className="absolute top-2 right-2 pointer-events-none"> {/* 위치 수정 */}
                <Image
                  src="/assets/deepfake.png"
                  alt="Deepfake Detected"
                  width={100}
                  height={24}
                  priority
                />
              </div>
            )}
              </>
            ) : (
              <div className="w-[520px] h-[270px] rounded-lg shadow-lg bg-gray-300 flex items-center justify-center">
                <span className="text-gray-500 text-2xl">No video uploaded</span>
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-center">
            <button
              onClick={handlePlayPause}
              className="w-full max-w-3xl bg-blue-500 hover:bg-blue-700 text-white font-bold text-xl py-3 px-6 rounded-lg"
              disabled={!video}
            >
              {isPlaying ? 'Pause ■' : 'Play ▶'}
            </button>
          </div>
          <div className="mt-6 flex justify-center space-x-4">
            <button
              onClick={handleAnalyzeRealtime}
              className="w-full max-w-xl bg-blue-200 hover:bg-blue-700 text-blue-500 font-bold text-xl py-3 px-6 rounded-lg"
              disabled={!video || isAnalyzingFrame}
            >
              Analyze Frame-by-Frame
            </button>
            <button
              onClick={handleAnalyzeVideo}
              className="w-full max-w-xl bg-blue-200 hover:bg-blue-700 text-blue-500 font-bold text-xl py-3 px-6 rounded-lg"
              disabled={!video || isAnalyzingVideo}
            >
              Analyze Full Video
            </button>
          </div>
        </div>
        <div className="h-10rm w-px bg-black mr-4"></div>
        <div className="flex flex-col justify-center">
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-s font-bold text-gray-800">Deepfake Probability</h2>
            <p
              className={`text-4xl font-extrabold mt-8 rounded-lg px-4 ${
                deepfakeProbability > 50 ? 'bg-red-600 text-white' : 'bg-green-400 text-white'
              }`}
            >
              {deepfakeProbability.toFixed(2)}%
            </p>
          </div>
          <div className="w-full max-w-4xl">
            <VideoInferenceGraph csvData={csvData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoUploader;
