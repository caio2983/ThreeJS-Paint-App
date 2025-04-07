import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChild,
  OnDestroy,
  OnInit,
} from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ThreeServiceService } from '../../services/three/three-service.service';
import { fromEvent } from 'rxjs';
import {
  switchMap,
  takeUntil,
  pairwise,
  filter,
  finalize,
  last,
} from 'rxjs/operators';

@Component({
  selector: 'app-three',
  standalone: true,
  templateUrl: './three.component.html',
  styleUrl: './three.component.css',
})
export class ThreeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private animationId!: number;
  private texture!: THREE.CanvasTexture;
  OrbitControls!: boolean;
  private newCanvas!: HTMLCanvasElement;

  constructor(private threeService: ThreeServiceService) {}

  ngAfterViewInit(): void {
    this.newCanvas = this.initThree();
    this.animate();

    // document.body.appendChild(this.newCanvas);

    const newCanvasEl: HTMLCanvasElement = this.newCanvas;

    const newCx = newCanvasEl.getContext('2d');
    console.log('context', newCx);

    // set some default properties about the line
    if (newCx) {
      newCx.lineWidth = 3;
      newCx.lineCap = 'round';
      newCx.strokeStyle = 'white';
    }

    // we'll implement this method to start capturing mouse events
    this.captureEvents(newCanvasEl);
  }

  captureEvents(canvasEl: HTMLCanvasElement) {
    let isDrawing = false;

    fromEvent<MouseEvent>(canvasEl, 'mousedown').subscribe(() => {
      isDrawing = true;
      console.log('drawing teste');
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
            finalize(() => {
              // this.undo.push(this.steps);
              // console.log('Test undo', this.undo);
              // this.steps = [];
            }),
            pairwise()
          );
        })
      )
      .subscribe((res: [MouseEvent, MouseEvent]) => {
        const rendererCanvas = this.renderer.domElement;

        const prevPos = {
          x:
            (res[0].clientX / rendererCanvas.clientWidth) *
            this.newCanvas.width,
          y:
            (res[0].clientY / rendererCanvas.clientHeight) *
            this.newCanvas.height,
        };

        const currentPos = {
          x:
            (res[1].clientX / rendererCanvas.clientWidth) *
            this.newCanvas.width,
          y:
            (res[1].clientY / rendererCanvas.clientHeight) *
            this.newCanvas.height,
        };

        this.drawOnCanvas(prevPos, currentPos);
      });
  }

  drawOnCanvas(
    prevPos: { x: number; y: number },
    currentPos: { x: number; y: number }
  ) {
    const canvasEl: HTMLCanvasElement = this.newCanvas;

    const cx = canvasEl.getContext('2d');

    // incase the context is not set
    if (!cx) {
      return;
    }

    // start our drawing path
    cx.beginPath();

    // we're drawing lines so we need a previous position
    if (prevPos) {
      this.controls?.update();
      // sets the start point
      cx.moveTo(prevPos.x, prevPos.y); // from

      // draws a line from the start pos until the current position
      cx.lineTo(currentPos.x, currentPos.y);

      // strokes the current path with the styles we set earlier
      cx.stroke();

      cx.closePath();

      this.texture.needsUpdate = true;
    }
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
  }

  ngOnInit(): void {
    this.threeService.OrbitControls$.subscribe((OrbitControlss: boolean) => {
      this.OrbitControls = OrbitControlss;

      if (this.OrbitControls) {
        // turn on orbit controls
        if (!this.controls) {
          this.controls = new OrbitControls(
            this.camera,
            this.renderer.domElement
          );
        }
      } else {
        // turn off orbit controls
        if (this.controls) {
          this.controls.dispose();
          this.controls = null as any;
        }
      }
    });
  }

  private createNewCanvas(): HTMLCanvasElement {
    const textureCanvas = document.createElement('canvas');
    textureCanvas.width = 512;
    textureCanvas.height = 512;
    const ctx = textureCanvas.getContext('2d')!;
    ctx.fillStyle = '#00FFCC';
    ctx.fillRect(0, 0, textureCanvas.width, textureCanvas.height);
    ctx.fillStyle = 'black';
    ctx.font = '48px sans-serif';
    ctx.fillText('sphere !!!', 150, 256);

    return textureCanvas;
  }

  private initThree(): HTMLCanvasElement {
    const canvas = this.canvasRef.nativeElement;

    this.scene = new THREE.Scene();

    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.z = 3;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0xffffff);

    // starts with orbit controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.update();

    const light = new THREE.PointLight(0xffffff, 4);
    light.position.set(1, 1, 1);
    this.scene.add(light);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    const newCanvas = this.createNewCanvas();

    this.texture = new THREE.CanvasTexture(newCanvas);
    this.texture.magFilter = THREE.NearestFilter;
    this.texture.minFilter = THREE.NearestFilter;

    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      map: this.texture,
    });
    const sphere = new THREE.Mesh(geometry, material);
    this.scene.add(sphere);

    const canvasEl = this.renderer.domElement;

    // fromEvent<MouseEvent>(canvasEl, 'mousedown').subscribe(() => {
    //   console.log('mousedown na cena 3D!');
    // });

    this.captureEvents(canvasEl);

    return newCanvas;
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);

    this.controls?.update();

    this.renderer.render(this.scene, this.camera);
  };
}
