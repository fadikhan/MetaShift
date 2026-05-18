/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ImageMetadata } from '../types';

export const getRandomMetadata = (): ImageMetadata => {
  const models = ['Sony A7III', 'Canon EOS R5', 'Nikon Z7 II', 'Fujifilm X-T4', 'iPhone 15 Pro'];
  const authors = ['Alex Rivers', 'Jordan Smith', 'Taylor Green', 'Morgan Gray'];
  const soft = ['Adobe Lightroom', 'Capture One', 'Photoshop 2024', 'Darktable'];
  const dates = ['2023-05-12 14:30:11', '2024-01-05 08:15:32', '2022-11-20 19:45:00'];

  return {
    cameraModel: models[Math.floor(Math.random() * models.length)],
    author: authors[Math.floor(Math.random() * authors.length)],
    software: soft[Math.floor(Math.random() * soft.length)],
    copyright: `© ${new Date().getFullYear()} ${authors[Math.floor(Math.random() * authors.length)]}`,
    timestamp: dates[Math.floor(Math.random() * dates.length)],
    gpsCoordinates: `${(Math.random() * 180 - 90).toFixed(4)}, ${(Math.random() * 360 - 180).toFixed(4)}`,
    deviceInfo: `SN: ${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    exposureTime: `1/${Math.floor(Math.random() * 4000)}s`,
    fNumber: `f/${(Math.random() * 16 + 1.2).toFixed(1)}`,
    iso: `${Math.floor(Math.random() * 3200 + 100)}`,
  };
};

export const getEmptyMetadata = (): ImageMetadata => ({
  cameraModel: '',
  gpsCoordinates: '',
  author: '',
  timestamp: '',
  copyright: '',
  deviceInfo: '',
  make: '',
  software: '',
  exposureTime: '',
  fNumber: '',
  iso: '',
  focalLength: '',
});

export const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const resizeImageForGemini = async (file: File, maxWidth = 1024, maxHeight = 1024): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8).split(',')[1]);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
