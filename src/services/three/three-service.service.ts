import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThreeServiceService {
  private OrbitControls = new BehaviorSubject<boolean>(true);
  OrbitControls$ = this.OrbitControls.asObservable();

  toggleOrbitControls(OrbitControls: boolean) {
    this.OrbitControls.next(OrbitControls);
    console.log('obs', this.OrbitControls);
  }

  constructor() {}
}
