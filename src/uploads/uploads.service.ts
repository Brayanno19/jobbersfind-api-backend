import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class UploadsService {
  /**
   * Upload un fichier vers Cloudinary et retourne l'URL sécurisée
   */
  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto', // Permet d'accepter image, video ou raw pdf
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Cloudinary upload returned no result'));
          resolve(result.secure_url);
        },
      );
      
      Readable.from(file.buffer).pipe(uploadStream);
    });
  }
}
