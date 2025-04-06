import { CdkDrag, DragDropModule } from '@angular/cdk/drag-drop';
import { NgIf, NgStyle } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { fromEvent } from 'rxjs';
import { switchMap, takeUntil, pairwise, filter } from 'rxjs/operators';
import { ImageServiceService } from '../../services/images/image-service.service';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-painting-area',
  imports: [NgIf, DragDropModule, CdkDrag, NgStyle],
  templateUrl: './painting-area.component.html',
  styleUrl: './painting-area.component.css',
})
export class PaintingAreaComponent {
  width = 400;
  height = 400;
  isDown: boolean = false;
  isSelected = false;
  steps: any = [];
  undo: any = [];

  previewImage: string | ArrayBuffer | null | undefined = '';

  @ViewChild('canvas') public canvas!: ElementRef;
  @ViewChild('image', { static: false })
  imageRef!: ElementRef<HTMLImageElement>;

  constructor(private imageService: ImageServiceService) {}

  public ngAfterViewInit() {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;

    const cx = canvasEl.getContext('2d');
    console.log('context', cx);

    // set the width and height

    const parentEl = canvasEl.parentElement;
    console.log(parentEl);

    const width = parentEl?.clientWidth || window.innerWidth;
    const height = parentEl?.clientHeight || window.innerHeight;

    canvasEl.width = width;
    canvasEl.height = height;
    // set some default properties about the line
    if (cx) {
      cx.lineWidth = 3;
      cx.lineCap = 'round';
      cx.strokeStyle = '#000';
    }

    // we'll implement this method to start capturing mouse events
    this.captureEvents(canvasEl);
  }

  ngOnInit() {
    this.imageService.previewImage$.subscribe((img) => {
      console.log(img);
      this.previewImage = img;
    });
  }

  captureEvents(canvasEl: HTMLCanvasElement) {
    let isDrawing = false;

    fromEvent<MouseEvent>(canvasEl, 'mousedown').subscribe(() => {
      isDrawing = true;
    });

    fromEvent<MouseEvent>(document, 'mouseup').subscribe(() => {
      isDrawing = false;
    });

    fromEvent<MouseEvent>(canvasEl, 'mousedown')
      .pipe(
        filter(() => isDrawing),
        switchMap((e) => {
          // after a mouse down, we'll record all mouse moves
          return fromEvent<MouseEvent>(canvasEl, 'mousemove').pipe(
            // we'll stop (and unsubscribe) once the user releases the mouse
            // this will trigger a 'mouseup' event
            takeUntil(fromEvent<MouseEvent>(canvasEl, 'mouseup')),
            // we'll also stop (and unsubscribe) once the mouse leaves the canvas (mouseleave event)

            // pairwise lets us get the previous value to draw a line from
            // the previous point to the current point
            pairwise()
          );
        })
      )
      .subscribe((res: [MouseEvent, MouseEvent]) => {
        const rect = canvasEl.getBoundingClientRect();

        const prevPos = {
          x: res[0].clientX - rect.left,
          y: res[0].clientY - rect.top,
        };

        const currentPos = {
          x: res[1].clientX - rect.left,
          y: res[1].clientY - rect.top,
        };

        this.drawOnCanvas(prevPos, currentPos);
      });
  }

  teste() {
    const prevPos = {
      x: 150,
      y: 300,
    };
    const currentPos = {
      x: 400,
      y: 500,
    };

    console.log('test button');

    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    const cx = canvasEl.getContext('2d');

    // incase the context is not set
    if (!cx) {
      return;
    }

    // start our drawing path
    cx.beginPath();

    console.log('context canvas', cx);

    // we're drawing lines so we need a previous position
    if (prevPos) {
      // sets the start point
      cx.moveTo(prevPos.x, prevPos.y); // from

      // draws a line from the start pos until the current position
      cx.lineTo(currentPos.x, currentPos.y);

      // strokes the current path with the styles we set earlier
      cx.stroke();

      cx.closePath();
    }
  }

  erase() {
    const prevPos = {
      x: 150,
      y: 300,
    };
    const currentPos = {
      x: 400,
      y: 500,
    };

    console.log('erase button');

    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    const cx = canvasEl.getContext('2d');

    if (!cx) {
      return;
    }

    // Salva o estado atual do pincel
    const previousStrokeStyle = cx.strokeStyle;
    const previousLineWidth = cx.lineWidth;

    // Modo "borracha"
    cx.strokeStyle = '#ffffff'; // ou 'rgba(0,0,0,0)' para fundo transparente
    cx.lineWidth = 5;

    cx.beginPath();
    cx.moveTo(prevPos.x, prevPos.y);
    cx.lineTo(currentPos.x, currentPos.y);
    cx.stroke();
    cx.closePath();

    // Restaura o estilo original do pincel
    cx.strokeStyle = previousStrokeStyle;
    cx.lineWidth = previousLineWidth;
  }

  drawOnCanvas(
    prevPos: { x: number; y: number },
    currentPos: { x: number; y: number }
  ) {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;

    const cx = canvasEl.getContext('2d');

    // incase the context is not set
    if (!cx) {
      return;
    }

    // start our drawing path
    cx.beginPath();

    console.log('context canvas', cx);

    // we're drawing lines so we need a previous position
    if (prevPos) {
      // sets the start point
      cx.moveTo(prevPos.x, prevPos.y); // from

      // draws a line from the start pos until the current position
      cx.lineTo(currentPos.x, currentPos.y);

      // strokes the current path with the styles we set earlier
      cx.stroke();

      cx.closePath();
    }
  }
}
