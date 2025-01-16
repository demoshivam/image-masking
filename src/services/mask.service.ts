import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class MaskService {

  constructor() { }

  // Function to generate mask data based on polygon coordinates
  generateMaskData(vertices: { x: number, y: number }[], width: number, height: number): Uint8Array {
    const maskData = new Uint8Array(width * height);

    // Create a canvas to draw the polygon
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    if (!context) throw new Error('Failed to get canvas context');

    // Draw the polygon
    context.beginPath();
    context.moveTo(vertices[0].x, vertices[0].y);
    for (let i = 1; i < vertices.length; i++) {
      context.lineTo(vertices[i].x, vertices[i].y);
    }

    // Fill the polygon
    context.closePath();
    context.fill();

    // Get pixel data
    const imageData = context.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Fill mask data based on pixel values
    for (let i = 0; i < maskData.length; i++) {
      // If the pixel is opaque (alpha > 0), it is inside the polygon
      maskData[i] = data[i * 4 + 3] > 0 ? 1 : 0; // Use alpha channel to determine inside/outside
    }

    return maskData;
  }

  // Function to visualize the mask
  visualizeMask(maskData: Uint8Array, width: number, height: number) {
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = width;
    maskCanvas.height = height;
    const context = maskCanvas.getContext('2d');

    if (!context) throw new Error('Failed to get canvas context');

    const imageData = context.createImageData(width, height);
    for (let i = 0; i < maskData.length; i++) {
      const value = maskData[i] * 255; // Scale to 0-255
      imageData.data[i * 4] = value;     // Red
      imageData.data[i * 4 + 1] = value; // Green
      imageData.data[i * 4 + 2] = value; // Blue
      imageData.data[i * 4 + 3] = 255;   // Alpha
    }

    context.putImageData(imageData, 0, 0);
  }

  // Function to process the mask
  processMask(vertices: { x: number, y: number }[], width: number, height: number) {
    const maskData = this.generateMaskData(vertices, width, height);
    this.visualizeMask(maskData, width, height);
    return maskData;
  }
}
