import { CdkDrag, DragDropModule } from '@angular/cdk/drag-drop';
import { NgIf, NgStyle, NgFor, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { ThreeServiceService } from '../../services/three/three-service.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-upload-form',
  imports: [
    NgIf,
    DragDropModule,
    CdkDrag,
    NgStyle,
    NgFor,
    MatButtonModule,
    NgClass,
    MatCardModule,
  ],
  templateUrl: './upload-form.component.html',
  styleUrl: './upload-form.component.css',
})
export class UploadFormComponent {
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
    { type: 'oct', label: 'Octaedro' },
    { type: 'box', label: 'Box' },
  ];

  constructor(private ThreeService: ThreeServiceService) {}

  handleOrbitControls() {
    this.OrbitControls = !this.OrbitControls;
    console.log('orbitControls true/false', this.OrbitControls);
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
