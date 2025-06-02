import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizarMenuComponent } from './visualizar-menu.component';

describe('VisualizarMenuComponent', () => {
  let component: VisualizarMenuComponent;
  let fixture: ComponentFixture<VisualizarMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisualizarMenuComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VisualizarMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
