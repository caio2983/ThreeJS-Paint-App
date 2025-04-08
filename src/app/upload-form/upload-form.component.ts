import { CdkDrag, DragDropModule } from '@angular/cdk/drag-drop';
import { NgIf, NgStyle } from '@angular/common';
import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { ImageServiceService } from '../../services/images/image-service.service';
import { ThreeServiceService } from '../../services/three/three-service.service';

@Component({
  selector: 'app-upload-form',
  imports: [NgIf, DragDropModule, CdkDrag, NgStyle],
  templateUrl: './upload-form.component.html',
  styleUrl: './upload-form.component.css',
})
export class UploadFormComponent {
  outputBoxVisible = false;
  progress = `0%`;
  uploadResult = '';
  fileName = '';
  fileSize = '';
  previewImage: string | ArrayBuffer | null | undefined = ''; // Send this to painting-area
  OrbitControls: boolean = false;
  uploadStatus: number | undefined;
  isDown: boolean = false;
  isSelected = false;
  width = 400;
  height = 400;

  constructor(
    private imageService: ImageServiceService,
    private ThreeService: ThreeServiceService
  ) {}

  onFileSelected(event: any, inputFile: File | null) {
    this.outputBoxVisible = false;
    this.progress = `0%`;
    this.uploadResult = '';
    this.fileName = '';
    this.fileSize = '';
    this.uploadStatus = undefined;
    const file: File = inputFile || event.target.files[0];

    if (file) {
      this.fileName = file.name;
      this.fileSize = `${(file.size / 1024).toFixed(2)} KB`;
      this.outputBoxVisible = true;

      const formData = new FormData();
      formData.append('file', file);

      // const mimeType = files[0].type;
      // if (mimeType.match(/image\/*/) == null) {
      //     this.message = "Only images are supported.";
      //     return;
      // }

      const reader = new FileReader();

      const files = event.target.files;
      reader.readAsDataURL(files[0]);
      reader.onload = () => {
        this.previewImage = reader.result as string;
        this.imageService.setPreviewImage(this.previewImage);
      };

      // Send file to server
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://localhost:4000/upload', true);

      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            this.uploadResult = 'Uploaded';
          } else if (xhr.status === 400) {
            this.uploadResult = JSON.parse(xhr.response)!.message;
          } else {
            this.uploadResult = 'File upload failed!';
          }
          this.uploadStatus = xhr.status;
        }
      };

      xhr.send(formData);
    }
  }

  handleDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  handleDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      const file: File = event.dataTransfer.files[0];
      this.onFileSelected(event, event.dataTransfer.files[0]);
    }
  }

  handleMoveClick() {
    this.isSelected = !this.isSelected;
    console.log(this.isSelected);
  }

  handleOrbitControls() {
    this.OrbitControls = !this.OrbitControls;
    console.log('orbitControls true/false', this.OrbitControls);
    this.ThreeService.toggleOrbitControls(this.OrbitControls);
  }

  // ngOnInit(): void {
  //   console.log('testeeee');
  //   this.OrbitControls = false;
  //   this.handleOrbitControls();
  // }
}
