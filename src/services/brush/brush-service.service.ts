import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BrushServiceService {
  private brushColor = new BehaviorSubject<string>('black');
  brushColor$ = this.brushColor.asObservable();

  setBrushColor(data: string) {
    this.brushColor.next(data);
  }
}
