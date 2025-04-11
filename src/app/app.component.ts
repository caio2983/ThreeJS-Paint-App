import { Component } from '@angular/core';

import { ToolsComponent } from './tools/tools.component';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { ColorSelectComponent } from './color-select/color-select.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { ThreeComponent } from './three/three.component';

@Component({
  selector: 'app-root',
  imports: [
    ToolsComponent,
    DragDropModule,
    ThreeComponent,
    ColorSelectComponent,
    MatExpansionModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'image-editor';
}
