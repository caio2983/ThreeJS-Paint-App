import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UploadFormComponent } from './upload-form/upload-form.component';
import { DragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { PaintingAreaComponent } from './painting-area/painting-area.component';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    UploadFormComponent,
    DragDropModule,
    PaintingAreaComponent,
    HeaderComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'image-editor';
}
