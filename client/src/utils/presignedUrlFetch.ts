export const presignedUrlFetch = async (presignedUrl: string, file: File) => {
  const res = await fetch(presignedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type
    },
    body: file
  });

  if (!res.ok) {
    throw new Error('Failed to upload file');
  }
};
