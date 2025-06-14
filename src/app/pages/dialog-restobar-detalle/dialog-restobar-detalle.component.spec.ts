import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogRestobarDetalleComponent } from './dialog-restobar-detalle.component';

describe('DialogRestobarDetalleComponent', () => {
  let component: DialogRestobarDetalleComponent;
  let fixture: ComponentFixture<DialogRestobarDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogRestobarDetalleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogRestobarDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
