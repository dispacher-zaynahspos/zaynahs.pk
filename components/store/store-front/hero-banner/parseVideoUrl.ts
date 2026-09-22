import { ParsedVideo } from './types';

export function parseVideoUrl(url: string | undefined, autoplay: boolean, muted: boolean): ParsedVideo {
  if (!url) return { type: null };

  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
  const ytMatch = url.match(ytRegex);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    const params = new URLSearchParams();
    params.set('enablejsapi', '1');
    if (autoplay) {
      params.set('autoplay', '1');
      params.set('loop', '1');
      params.set('playlist', videoId);
      params.set('controls', '0');
    } else {
      params.set('autoplay', '0');
      params.set('controls', '1');
    }
    if (muted) {
      params.set('mute', '1');
    } else {
      params.set('mute', '0');
    }
    params.set('playsinline', '1');

    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${videoId}?${params.toString()}`,
    };
  }

  const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    const params = new URLSearchParams();
    if (autoplay) {
      params.set('autoplay', '1');
      params.set('loop', '1');
      params.set('background', '1');
    } else {
      params.set('autoplay', '0');
    }
    if (muted) {
      params.set('muted', '1');
    } else {
      params.set('muted', '0');
    }
    params.set('playsinline', '1');
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${videoId}?${params.toString()}`,
    };
  }

  return {
    type: 'direct',
    directUrl: url,
  };
}
