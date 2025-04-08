import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThreeServiceService {
  private OrbitControls = new BehaviorSubject<boolean>(false);
  OrbitControls$ = this.OrbitControls.asObservable();

  private Animation = new BehaviorSubject<boolean>(true);
  Animation$ = this.Animation.asObservable();

  private Solid = new BehaviorSubject<string>('sphere');
  Solid$ = this.Solid.asObservable();

  toggleOrbitControls(OrbitControls: boolean) {
    this.OrbitControls.next(OrbitControls);
    console.log('obs', this.OrbitControls);
  }

  toggleAnimation(animation: boolean) {
    this.Animation.next(animation);
  }

  changeSolidType(solid: string) {
    this.Solid.next(solid);
    console.log('changed solid: ', solid);
  }

  constructor() {}
}
