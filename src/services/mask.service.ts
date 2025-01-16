import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MaskService {

  constructor() { }

  // Function to generate mask data based on multiple polygon coordinates
  generateCombinedMaskData(polygons: { x: number, y: number }[][], width: number, height: number): Uint8Array {
    const maskData = new Uint8Array(width * height);

    // Create a canvas to draw the polygons
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    if (!context) throw new Error('Failed to get canvas context');

    // Draw each polygon
    polygons.forEach(vertices => {
      context.beginPath();
      context.moveTo(vertices[0].x, vertices[0].y);
      for (let i = 1; i < vertices.length; i++) {
        context.lineTo(vertices[i].x, vertices[i].y);
      }
      context.closePath();
      context.fill();
    });

    // Get pixel data
    const imageData = context.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Fill mask data based on pixel values
    for (let i = 0; i < maskData.length; i++) {
      maskData[i] = data[i * 4 + 3] > 0 ? 1 : 0; // Use alpha channel to determine inside/outside
    }

    return maskData;
  }

  // Function to visualize the combined mask
  visualizeCombinedMask(maskData: Uint8Array, width: number, height: number) {
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = width;
    maskCanvas.height = height;
    const context = maskCanvas.getContext('2d');

    if (!context) throw new Error('Failed to get canvas context');

    const imageData = context.createImageData(width, height);
    for (let i = 0; i < maskData.length; i++) {
      const value = maskData[i] * 255;
      imageData.data[i * 4] = value;
      imageData.data[i * 4 + 1] = value;
      imageData.data[i * 4 + 2] = value;
      imageData.data[i * 4 + 3] = 255;
    }

    context.putImageData(imageData, 0, 0);
  }

  // Function to process the combined mask
  processCombinedMask(polygons: { x: number, y: number }[][], width: number, height: number) {
    const maskData = this.generateCombinedMaskData(polygons, width, height);
    this.visualizeCombinedMask(maskData, width, height);
    return maskData;
  }
}
