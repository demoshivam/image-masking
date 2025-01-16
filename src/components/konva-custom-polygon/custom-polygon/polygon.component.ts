import { Component, AfterViewInit } from '@angular/core';
import { MaskService } from '../../../services/mask.service';
import { BackgroundImageService } from '../../../services/background-image.service';
import Konva from 'konva';

@Component({
  selector: 'polygon-component',
  templateUrl: './polygon.component.html',
  styleUrls: ['./polygon.component.scss']
})

export class PolygonComponent implements AfterViewInit {
  private stage!: Konva.Stage;
  private mainLayer!: Konva.Layer;
  private tempLayer!: Konva.Layer;
  private currentVertices: { x: number; y: number }[] = [];
  private connectingLines: Konva.Line | null = null;
  private allPolygons: { x: number; y: number }[][] = [];
  private backgroundImage: Konva.Image | null = null;

  // Store polygons with vertices
  private polygons: { vertices: { x: number; y: number }[], polygon: Konva.Line | null }[] = [];

  constructor(private maskService: MaskService, private backgroundImageService: BackgroundImageService) {}

  ngAfterViewInit() {
    this.stage = new Konva.Stage({
      container: 'container',
      width: window.innerWidth - 80,
      height: window.innerHeight - 80,
    });

    // Main layer for finalized polygons
    this.mainLayer = new Konva.Layer();
    this.stage.add(this.mainLayer);

    // Temporary layer for drawing the current polygon
    this.tempLayer = new Konva.Layer();
    this.stage.add(this.tempLayer);

    this.backgroundImageService.addBackgroundImage(this.mainLayer, 'assets/bg-img.jpg');


    //add vertices or close polygon
    this.stage.on('click touchstart', (e) => {
      const pos = this.stage.getPointerPosition();
      if (pos) {
        if (this.currentVertices.length > 0 && this.isNearFirstVertex(pos)) {
          this.closePolygon();
        } else {
          this.currentVertices.push({ x: pos.x, y: pos.y });
          this.addVertexCircle(pos.x, pos.y);
          this.drawConnectingLines();
        }
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'n' || e.key === 'N') {
        this.closePolygon();
      }
    });
  }


  // Close the polygon if user clicks near to first vertex
  private isNearFirstVertex(pos: { x: number; y: number }): boolean {
    const firstVertex = this.currentVertices[0];
    const distance = Math.sqrt((pos.x - firstVertex.x) ** 2 + (pos.y - firstVertex.y) ** 2);
    return distance < 10;
  }

  // Connects Polygons vertices - when creating
  private drawConnectingLines() {
    if (this.connectingLines) {
      this.connectingLines.destroy();
    }

    if (this.currentVertices.length > 1) {
      const points = this.currentVertices.flatMap(v => [v.x, v.y]);
      this.connectingLines = new Konva.Line({
        points: points,
        stroke: 'orange',
        strokeWidth: 2,
        lineCap: 'round',
        lineJoin: 'round',
      });
      this.tempLayer.add(this.connectingLines);
      this.tempLayer.batchDraw(); // Batch draw for performance
    }
  }

  private drawPolygon() {
    if (this.currentVertices.length > 2) {
      const points = this.currentVertices.flatMap(v => [v.x, v.y]);
      const polygon = new Konva.Line({
        points: [...points, this.currentVertices[0].x, this.currentVertices[0].y],
        stroke: 'black',
        strokeWidth: 2,
        fill: '#00d2ff59',
        closed: true,
      });
      this.mainLayer.add(polygon);
      polygon.cache();
      this.polygons.push({ vertices: [...this.currentVertices], polygon });
      this.mainLayer.batchDraw();
    }
  }

  // Draws circle of clicked vertices
  private addVertexCircle(x: number, y: number) {
    const circle = new Konva.Circle({
      x: x,
      y: y,
      radius: 5,
      fill: 'blue',
      stroke: 'orange',
      strokeWidth: 1,
    });
    this.tempLayer.add(circle);
    this.tempLayer.batchDraw();
  }

  private closePolygon() {
    if (this.currentVertices.length > 2) {
      this.drawPolygon();
      this.allPolygons.push([...this.currentVertices]);
    }
    this.currentVertices = [];

    // Remove connecting lines
    if (this.connectingLines) {
      this.connectingLines.destroy();
    }

    // Clear temporary layer after closing the polygon
    this.tempLayer.clear();
  }

  public resetPolygons() {
    this.polygons.forEach(p => p.polygon?.destroy());

    this.polygons = [];
    this.allPolygons = [];
    this.currentVertices = [];

    // Clear both layers
    this.mainLayer.clear();
    this.tempLayer.clear();

    this.tempLayer.removeChildren();

    // Re-add background image to main layer
    this.backgroundImageService.addBackgroundImage(this.mainLayer, 'assets/bg-img.jpg');
  }


  public exportMask() {
    if (this.allPolygons.length === 0) {
        console.warn('No polygons to export');
        return;
    }

    const masksData: { [key: string]: any } = {};

    console.log('All polygon vertices', this.allPolygons);

    this.allPolygons.forEach((vertices, index) => {
        const maskData = this.maskService.processMask(vertices, 200, 200);
        masksData[`polygon${index + 1}Mask`] = maskData;
    });

    console.log('All Mask Data:', masksData);
    alert('Mask data has been successfully exported to the console. You can check the console for details on the polygons you created.');
}

}
