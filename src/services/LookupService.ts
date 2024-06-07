import { randImg } from '@ngneat/falso';

export interface VideoMetadata {
  source: string;
  title: string;
  thumbnailImage: string;
  html: string;
}

export class LookupService {
  static async getVideoMetadata(url: string | undefined): Promise<VideoMetadata> {
    return {
      title: 'Video Title',
      thumbnailImage: randImg(),
      source: 'YouTube',
      html: '<iframe src="https://youtube.com/"></iframe>',
    }
  }
}
