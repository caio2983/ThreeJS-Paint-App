import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgIf, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { ThreeServiceService } from '../../services/three/three-service.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ThreeThumbnailComponent } from '../three-thumbnail/three-thumbnail.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-tools',
  imports: [
    NgIf,
    DragDropModule,

    NgFor,
    MatButtonModule,

    MatCardModule,
    ThreeThumbnailComponent,
    MatSlideToggleModule,
  ],
  templateUrl: './tools.component.html',
  styleUrl: './tools.component.css',
})
export class ToolsComponent {
  OrbitControls: boolean = false;
  animation: boolean = true;
  uploadStatus: number | undefined;
  isDown: boolean = false;
  selectedSolid: string = 'sphere';
  isSelected = false;
  width = 400;
  height = 400;

  solids = [
    { type: 'sphere', label: 'Sphere' },
    { type: 'plane', label: 'Plane' },
    { type: 'oct', label: 'Octahedron' },
    { type: 'box', label: 'Box' },
  ];

  constructor(private ThreeService: ThreeServiceService) {}

  handleOrbitControls() {
    this.OrbitControls = !this.OrbitControls;

    this.ThreeService.toggleOrbitControls(this.OrbitControls);
  }

  handleToggleAnimation() {
    this.animation = !this.animation;
    this.ThreeService.toggleAnimation(this.animation);
  }

  changeSolid(solid: string) {
    this.selectedSolid = solid;
    this.ThreeService.changeSolidType(solid);
  }
}
