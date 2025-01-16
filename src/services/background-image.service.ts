import { Injectable } from '@angular/core';
import Konva from 'konva';

@Injectable({
  providedIn: 'root'
})
export class BackgroundImageService {
  private cachedImage: Konva.Image | null = null;

  constructor() {}

  addBackgroundImage(layer: Konva.Layer, imageUrl: string) {
    // use cahce image for efficiency
    if (this.cachedImage) {
      layer.add(this.cachedImage);
      layer.batchDraw();
      return;
    }

    const imageObj = new Image();
    imageObj.src = imageUrl;

    imageObj.onload = () => {
      this.cachedImage = new Konva.Image({
        image: imageObj,
        x: 0,
        y: 0,
        width: layer.getStage()?.width(),
        height: layer.getStage()?.height(),
      });

      this.cachedImage.cache();
      layer.add(this.cachedImage);
      layer.batchDraw();
    };
  }
}
