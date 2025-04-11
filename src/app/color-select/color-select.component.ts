import { Component } from '@angular/core';
import * as color from 'ngx-color-picker';
import { BrushServiceService } from '../../services/brush/brush-service.service';

@Component({
  selector: 'app-color-select',
  imports: [color.ColorPickerComponent, color.ColorPickerDirective],
  templateUrl: './color-select.component.html',
  styleUrl: './color-select.component.css',
})
export class ColorSelectComponent {
  color = '';

  constructor(private brushService: BrushServiceService) {}

  handleColorChange() {
    this.brushService.setBrushColor(this.color);
  }
}
