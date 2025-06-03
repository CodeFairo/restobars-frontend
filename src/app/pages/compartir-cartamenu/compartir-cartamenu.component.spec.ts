import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompartirCartamenuComponent } from './compartir-cartamenu.component';

describe('CompartirCartamenuComponent', () => {
  let component: CompartirCartamenuComponent;
  let fixture: ComponentFixture<CompartirCartamenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompartirCartamenuComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CompartirCartamenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
