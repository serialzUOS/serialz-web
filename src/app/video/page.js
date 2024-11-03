// src/app/video/page.jsx
import VideoUploader from '@/components/VideoUploader';

const VideoUploadPage = () => {
  return (
    <main className="min-h-screen py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Video Upload & Player
      </h1>
      <VideoUploader />
    </main>
  );
};

export default VideoUploadPage;