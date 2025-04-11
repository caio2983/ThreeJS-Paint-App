import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChild,
  OnDestroy,
  OnInit,
  Input,
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
import { BrushServiceService } from '../../services/brush/brush-service.service';

@Component({
  selector: 'app-three',
  standalone: true,
  templateUrl: './three.component.html',
  styleUrl: './three.component.css',
})
export class ThreeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() geometryType: 'sphere' | 'plane' | 'box' | 'ring' | 'oct' = 'sphere';

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private animationId!: number;
  geometry = this.createGeometry(this.geometryType);
  private texture!: THREE.CanvasTexture;
  OrbitControls: boolean = false;
  animation: boolean = true;
  private newCanvas!: HTMLCanvasElement;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private mesh!: THREE.Mesh;
  private brushColor: string = 'black';

  constructor(
    private threeService: ThreeServiceService,
    private brushService: BrushServiceService
  ) {}

  ngAfterViewInit(): void {
    this.OrbitControls = false;
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
      .subscribe(([eventPrev, eventCurr]) => {
        const uv1 = this.getUvFromMouse(eventPrev);
        const uv2 = this.getUvFromMouse(eventCurr);

        // the following removes the possiblity of concentric circunferences around the sphere
        if (uv1 && uv2) {
          if (Math.abs(uv1.x - uv2.x) > 0.5) {
            return;
          }

          const prevPos = {
            x: uv1.x * this.newCanvas.width,
            y: (1 - uv1.y) * this.newCanvas.height, // y invertido
          };

          const currPos = {
            x: uv2.x * this.newCanvas.width,
            y: (1 - uv2.y) * this.newCanvas.height,
          };

          this.drawOnCanvas(prevPos, currPos);
        }
      });
  }

  getUvFromMouse(event: MouseEvent): THREE.Vector2 | null {
    // this.renderer.domElement is the <canvas> element
    const rect = this.renderer.domElement.getBoundingClientRect();

    // event.clientX - rect.left means the relative position of mouse x's in the canvas
    // *2-1 , *2+1 convert the mouse click's coordinates to NDC coordinates (normalized device coordinates)
    // why use NDC ? because different devices have differente screen sizes , and NDC maps different mouse coordinates
    // from different screen sizes into x : [-1,+1] and y: [-1,+1]

    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // raytracing then uses the NDC to create the traces
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster.intersectObject(this.mesh);

    if (intersects.length > 0 && intersects[0].uv) {
      return intersects[0].uv.clone();
    }

    return null;
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
    if (!this.OrbitControls) {
      if (prevPos) {
        this.controls?.update();
        // sets the start point
        cx.moveTo(prevPos.x, prevPos.y); // from

        // draws a line from the start pos until the current position
        cx.lineTo(currentPos.x, currentPos.y);
        cx.strokeStyle = this.brushColor;

        // strokes the current path with the styles we set earlier
        cx.stroke();

        cx.closePath();

        this.texture.needsUpdate = true;
      }
    }
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
  }

  ngOnInit(): void {
    console.log('teste plane', new THREE.PlaneGeometry());

    this.threeService.Solid$.subscribe((solid: any) => {
      this.geometryType = solid;

      const newGeometry = this.createGeometry(this.geometryType);

      this.geometry.dispose();

      this.geometry = newGeometry;

      this.mesh.geometry = this.geometry;
    });

    this.threeService.Animation$.subscribe((Animation: boolean) => {
      this.animation = Animation;
      console.log('teste animation', this.animation);
    });

    this.threeService.OrbitControls$.subscribe((OrbitControlss: boolean) => {
      this.OrbitControls = OrbitControlss;
      console.log('ligou orbit', this.OrbitControls);
      if (this.OrbitControls) {
        console.log('teste 1,5');
        // turn on orbit controls

        this.controls = new OrbitControls(
          this.camera,
          this.renderer.domElement
        );
        console.log('teste 2');

        this.controls.enabled = true;
        this.controls.update();
      } else {
        // turn off orbit controls

        if (this.controls) {
          this.controls.enabled = false;
          console.log('teste 3');
        }
      }

      console.log(this.OrbitControls, this.controls, 'testeee');

      return;
    });

    this.brushService.brushColor$.subscribe((color: string) => {
      this.brushColor = color;
      console.log('cor setada', this.brushColor);
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

    return textureCanvas;
  }

  private createGeometricGridBackground(): void {
    const gridColor = new THREE.Color('midnightblue');
    const gridHelper = new THREE.GridHelper(1000, 1000, gridColor, gridColor);
    gridHelper.rotation.x = Math.PI / 2;
    gridHelper.position.z = -5;
    this.scene.add(gridHelper);
  }

  private initThree(): HTMLCanvasElement {
    const canvas = this.canvasRef.nativeElement;

    this.scene = new THREE.Scene();

    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.z = 3;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef.nativeElement,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0xffffff);

    // starts with orbit controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // Desliga completamente os controles
    this.controls.enabled = false;

    const light = new THREE.PointLight(0xffffff, 3);
    light.position.set(1, 1, 1);
    this.scene.add(light);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    this.scene.add(ambientLight);

    this.createGeometricGridBackground();

    const newCanvas = this.createNewCanvas();

    this.texture = new THREE.CanvasTexture(newCanvas);
    this.texture.magFilter = THREE.NearestFilter;
    this.texture.minFilter = THREE.NearestFilter;

    let material: THREE.MeshStandardMaterial;

    material = new THREE.MeshStandardMaterial({
      map: this.texture,
      side: THREE.DoubleSide,
    });

    const geometry = this.createGeometry(this.geometryType);

    this.mesh = new THREE.Mesh(geometry, material);

    this.scene.add(this.mesh);

    const canvasEl = this.renderer.domElement;

    this.captureEvents(canvasEl);

    return newCanvas;
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);

    this.controls?.update();
    this.texture.needsUpdate = true;

    if (this.animation) {
      this.mesh.rotation.x += 0.02;
      this.mesh.rotation.y += 0.02;
    }

    this.renderer.render(this.scene, this.camera);
    this.renderer.setClearColor(new THREE.Color('#8087b3'), 1);
  };

  createGeometry(type: string): THREE.BufferGeometry {
    switch (type) {
      case 'sphere':
        return new THREE.SphereGeometry(1, 32, 32);
      case 'plane':
        return new THREE.PlaneGeometry(2, 2);
      case 'box':
        return new THREE.BoxGeometry(1, 1, 1);
      case 'ring':
        return new THREE.RingGeometry(0.8, 1, 32);
      case 'oct':
        return new THREE.OctahedronGeometry(1);
      default:
        console.warn(
          `Geometria desconhecida: ${type}, usando Sphere por padrão`
        );
        return new THREE.SphereGeometry(1, 32, 32);
    }
  }
}
