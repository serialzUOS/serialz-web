'use client';

import React, { useState, useRef } from 'react';

const VideoUploader = () => {
  const [video, setVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      // 파일 유효성 검사
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

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={handleUploadClick}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Upload Video
        </button>
      </div>

      {video && (
        <div className="relative">
          <video
            ref={videoRef}
            src={video.url}
            className="w-full rounded-lg shadow-lg"
            controls={false}
          />
          <div className="mt-4 flex justify-center">
            <button
              onClick={handlePlayPause}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
          </div>
          <div className="mt-2 text-gray-600">
            File name: {video.file.name}
            <br />
            Size: {(video.file.size / (1024 * 1024)).toFixed(2)} MB
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUploader;