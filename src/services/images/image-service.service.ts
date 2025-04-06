import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImageServiceService {
  private previewImageSource = new BehaviorSubject<string | null>(null);
  previewImage$ = this.previewImageSource.asObservable();

  setPreviewImage(data: string) {
    this.previewImageSource.next(data);
  }

  clearImage() {
    this.previewImageSource.next(null);
  }
}
