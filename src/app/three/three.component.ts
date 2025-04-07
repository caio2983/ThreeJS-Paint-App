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

  constructor(private threeService: ThreeServiceService) {}

  ngAfterViewInit(): void {
    this.initThree();
    this.animate();
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

  private initThree(): void {
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

    const textureCanvas = document.createElement('canvas');
    textureCanvas.width = 512;
    textureCanvas.height = 512;
    const ctx = textureCanvas.getContext('2d')!;
    ctx.fillStyle = '#00FFCC';
    ctx.fillRect(0, 0, textureCanvas.width, textureCanvas.height);

    ctx.fillStyle = 'black';
    ctx.font = '48px sans-serif';
    ctx.fillText('sphere !!!', 150, 256);

    this.texture = new THREE.CanvasTexture(textureCanvas);
    this.texture.magFilter = THREE.NearestFilter;
    this.texture.minFilter = THREE.NearestFilter;

    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      map: this.texture,
    });
    const sphere = new THREE.Mesh(geometry, material);
    this.scene.add(sphere);
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);

    this.controls.update();

    this.renderer.render(this.scene, this.camera);
  };
}
