export const normalizeAttachments = (attachments) => {
    if (!Array.isArray(attachments)) return [];

    return attachments
        .filter(url => typeof url === 'string' && url.trim() !== '')
        .map((url) => {
            const extension = url.split('.').pop()?.toLowerCase() || '';
            const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
            const isVideo = ['mp4', 'webm', 'ogg'].includes(extension);

            return {
                url,
                type: isImage ? 'image' : isVideo ? 'video' : 'image',
                thumbnail: isVideo ? null : undefined
            };
        });
};
