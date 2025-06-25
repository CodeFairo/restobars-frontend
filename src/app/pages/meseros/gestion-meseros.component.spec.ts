import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionMeserosComponent } from './gestion-meseros.component';

describe('GestionMeserosComponent', () => {
  let component: GestionMeserosComponent;
  let fixture: ComponentFixture<GestionMeserosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionMeserosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GestionMeserosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
