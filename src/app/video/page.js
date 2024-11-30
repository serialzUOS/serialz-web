// src/app/video/page.jsx
import VideoUploader from '@/components/VideoUploader';

const VideoUploadPage = () => {
  return (
    <main className="min-h-screen py-8 bg-white">
      <h1 className="text-3xl font-bold text-center mb-8 text-black">
        Realeyez
      </h1>
      <VideoUploader />
    </main>
  );
};

export default VideoUploadPage;