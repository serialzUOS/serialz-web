self.onmessage = async (event) => {
    const { blob, apiUrl, requestId } = event.data; // requestId가 포함되어야 함
  
    try {
      const formData = new FormData();
      formData.append('image', blob);
  
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('Failed to analyze frame');
      }
  
      const result = await response.json();
      self.postMessage({ success: true, result, requestId }); // requestId 포함
    } catch (error) {
      self.postMessage({ success: false, error: error.message, requestId }); // requestId 포함
    }
  };
  