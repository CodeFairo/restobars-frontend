import { Component, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { FooterComponent } from "../../layout/footer/footer.component";
import { Restobar } from '../../interfaces/Restobar';
import { RestobarService } from '../../services/restobar.service';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Breakpoints } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import { RestobarMenuComplementoService } from '../../services/restobarMenuComplemento.service';
import { DialogRestobarDetalleComponent } from '../../pages/dialog-restobar-detalle/dialog-restobar-detalle.component';
import { RestobarMenuComplemento } from '../../interfaces/RestobarMenuComplemento';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    FooterComponent,
    MatCardModule,
    CommonModule,
    FormsModule,
    MatInputModule,
    MatIconModule

  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit {
  private router = inject(Router);
  private restobarService = inject(RestobarService);
  busquedaNombre: string = '';
  breakpointObserver: any;
  constructor(private dialog: MatDialog, private menuService: RestobarMenuComplementoService) { }

  restobares: Restobar[] = [];
  urlMenu: string = '';
  loading = false

  @ViewChild('carousel') carouselRef!: ElementRef;

  ingresar() {
    this.router.navigate(['login']);
  }

  registrarse() {
    this.router.navigate(['registro']);
  }

  verDetalle(restobar: Restobar) {
    this.loading = true;
    const id = Number(restobar.id);
    const isSmallScreen = this.breakpointObserver.isMatched([Breakpoints.XSmall, Breakpoints.Small]);

    this.menuService.getByRestobarId(id).subscribe({
      next: (res: RestobarMenuComplemento | null) => {
        this.urlMenu = res?.urlMenu || '';
        this.dialog.open(DialogRestobarDetalleComponent, {
          width: isSmallScreen ? '90%' : '50%',
          panelClass: 'full-dialog',
          data: { restobar, urlMenu: this.urlMenu },
          //width: 'auto',
          maxWidth: 'none'
        });
        this.loading = false;
        console.log('Menú cargado correctamente:', this.urlMenu);
      },
      error: (err) => {
        console.error('Error obteniendo menú', err);
        this.loading = false;
      }
    });

    console.log('Detalle de:', restobar);
  }

  ngOnInit(): void {
    this.restobarService.listaAll().subscribe({
      next: (data) => {
        this.restobares = data;
      },
      error: (error) => {
        console.error('Error al cargar los restobares:', error);
      }
    });
  }

  scrollCarousel(direction: 'left' | 'right') {
    const el = this.carouselRef.nativeElement as HTMLElement;
    const scrollAmount = 300;
    el.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  }

  buscarPorNombre() {
    if (!this.busquedaNombre || this.busquedaNombre.trim() === '') {
      return;
    }
    this.restobarService.buscarPorNombre(this.busquedaNombre.trim()).subscribe({
      next: (data) => {
        this.restobares = data;
      },
      error: (err) => console.error('Error al buscar:', err)
    });
  }

  buscarPorUbicacion() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        this.restobarService.buscarPorUbicacion(lat, lng, this.busquedaNombre).subscribe({
          next: (data) => {
            this.restobares = data;
          },
          error: (err) => console.error('Error al buscar por ubicación:', err)
        });
      }, (err) => {
        console.error('No se pudo obtener ubicación:', err);
      });
    } else {
      console.error('Geolocalización no soportada por el navegador.');
    }
  }
}
