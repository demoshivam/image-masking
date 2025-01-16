import { Component, AfterViewInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import Konva from 'konva';
declare global {
  interface Window {
    Konva: any;
  }
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent {
  title = 'polygon-masking';
  private stage!: Konva.Stage; // Use definite assignment assertion
  private layer!: Konva.Layer; // Use definite assignment assertion
  private vertices: { x: number; y: number }[] = []; // Store vertices as objects
  private polygon: Konva.Line | null = null;
  private connectingLines: Konva.Line | null = null; // For connecting lines

  ngAfterViewInit() {
    this.stage = new Konva.Stage({
      container: 'container',
      width: window.innerWidth,
      height: window.innerHeight,
    });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

    this.addBackgroundImage('assets/bg-img.jpg')

    // Handle clicks to add vertices
    this.stage.on('click', (e) => {
      const pos = this.stage.getPointerPosition();
      if (pos) { // Check if pos is not null
        if (this.vertices.length > 0 && this.isNearFirstVertex(pos)) {
          // If user clicks the first vertex again, close the polygon
          this.closePolygon();
        } else {
          this.vertices.push({ x: pos.x, y: pos.y }); // Store x and y coordinates as objects
          this.addVertexCircle(pos.x, pos.y); // Add a circle at the vertex
          this.drawConnectingLines(); // Draw lines between vertices
        }
      }
    });



    // Handle the 'N' key press to close the polygon
    document.addEventListener('keydown', (e) => {
      if (e.key === 'n' || e.key === 'N') {
        this.closePolygon();
      }
    });
  }


  private isNearFirstVertex(pos: { x: number; y: number }): boolean {
    const firstVertex = this.vertices[0];
    const distance = Math.sqrt((pos.x - firstVertex.x) ** 2 + (pos.y - firstVertex.y) ** 2);
    return distance < 10; // Adjust the threshold as needed
  }

  private drawConnectingLines() {
    if (this.connectingLines) {
      this.connectingLines.destroy(); // Remove the old connecting lines
    }

    if (this.vertices.length > 1) {
      const points = this.vertices.flatMap(v => [v.x, v.y]); // Flatten the vertices for the line points
      this.connectingLines = new Konva.Line({
        points: [...points], // Close the line back to the first point if needed
        stroke: 'orange',
        strokeWidth: 2,
      });
      this.layer.add(this.connectingLines);
      this.layer.draw();
    }
  }

  private drawPolygon() {
    if (this.polygon) {
      this.polygon.destroy(); // Remove the old polygon
    }

    if (this.vertices.length > 2) {
      const points = this.vertices.flatMap(v => [v.x, v.y]); // Flatten the vertices for the polygon points
      const selectionColor = '#00d2ff59';

      this.polygon = new Konva.Line({
        points: [...points, this.vertices[0].x, this.vertices[0].y], // Close the polygon
        stroke: 'black',
        strokeWidth: 2,
        fill: selectionColor,
        closed: true,
      });
      this.layer.add(this.polygon);
      this.layer.draw();
    }
  }

  private addVertexCircle(x: number, y: number) {
    const circle = new Konva.Circle({
      x: x,
      y: y,
      radius: 5, // Adjust radius for size
      fill: 'blue', // Color of the circle
      stroke: 'orange',
      strokeWidth: 1,
    });

    this.layer.add(circle); // Add the circle to the layer
    this.layer.draw(); // Redraw the layer
  }

  private addBackgroundImage(imageUrl: string) {
    const imageObj = new Image();
    imageObj.src = imageUrl;

    imageObj.onload = () => {
      const backgroundImage = new Konva.Image({
        image: imageObj,
        x: 0,
        y: 0,
        width: this.stage.width(),
        height: this.stage.height(),
      });
      this.layer.add(backgroundImage);
      this.layer.draw();
    };
  }

  private closePolygon() {
    if (this.vertices.length > 2) {
      this.drawPolygon(); // Draw the final polygon
      this.vertices = []; // Reset vertices for the next polygon
      if (this.connectingLines) {
        this.connectingLines.destroy(); // Remove the connecting lines
      }
    }
  }
  public exportMask() {
    if (this.vertices.length < 3) {
        console.warn('Not enough vertices to create a mask');
        return; // Exit if there are not enough vertices
    }

    const maskCanvas = document.createElement('canvas');
    const context = maskCanvas.getContext('2d');
    if (!context) return;

    // Set canvas dimensions
    maskCanvas.width = this.stage.width();
    maskCanvas.height = this.stage.height();

    // Fill the entire canvas with a solid background color (white)
    context.fillStyle = 'white';
    context.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

    // Set the composite operation to cut out the polygon area
    context.globalCompositeOperation = 'destination-out';

    // Create the polygon path
    context.beginPath();
    this.vertices.forEach((vertex, index) => {
        if (index === 0) {
            context.moveTo(vertex.x, vertex.y);
        } else {
            context.lineTo(vertex.x, vertex.y);
        }
    });
    context.closePath();
    context.fill(); // Cut out the polygon area

    // Reset the composite operation to default
    context.globalCompositeOperation = 'source-over';

    // Export the mask as a data URL
    const maskDataUrl = maskCanvas.toDataURL('image/png');
    this.downloadMask(maskDataUrl, 'mask.png'); // Call the download function
}


  public downloadMask(dataUrl: string, filename: string) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);


}
}
