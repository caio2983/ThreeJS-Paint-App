import {
  Component,
  ViewChild,
  Input,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';

import * as THREE from 'three';

@Component({
  selector: 'app-three-thumbnail',
  standalone: true,
  templateUrl: './three-thumbnail.component.html',
  styleUrl: './three-thumbnail.component.css',
})
export class ThreeThumbnailComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() geometryType: 'sphere' | 'plane' | 'box' | 'ring' | 'oct' = 'sphere';

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private mesh!: THREE.Mesh;
  private animationId: number = 0;

  ngAfterViewInit(): void {
    this.initThree();
    this.animate();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
  }

  private initThree(): void {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('skyblue');

    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 2;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    this.scene.add(light);

    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0x0077ff });
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);

    this.createGeometricGridBackground();
  }

  private createGeometricGridBackground(): void {
    const gridColor = new THREE.Color('midnightblue');
    const gridHelper = new THREE.GridHelper(10, 20, gridColor, gridColor);
    gridHelper.rotation.x = Math.PI / 2;
    this.scene.add(gridHelper);
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());

    this.mesh.rotation.y += 0.01;
    this.mesh.rotation.x += 0.005;

    this.renderer.render(this.scene, this.camera);
  }
}
