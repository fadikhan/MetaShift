/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ImageMetadata {
  cameraModel?: string;
  gpsCoordinates?: string;
  author?: string;
  timestamp?: string;
  copyright?: string;
  deviceInfo?: string;
  make?: string;
  software?: string;
  exposureTime?: string;
  fNumber?: string;
  iso?: string;
  focalLength?: string;
}

export interface ImageFile {
  id: string;
  file: File;
  preview: string;
  originalMetadata: ImageMetadata;
  editedMetadata: ImageMetadata;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
}
