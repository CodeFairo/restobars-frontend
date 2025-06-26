import { Component, inject, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { Restobar } from '../../interfaces/Restobar';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import { RestobarMenuComplementoService } from '../../services/restobarMenuComplemento.service';
import { RestobarMenuComplemento } from '../../interfaces/RestobarMenuComplemento';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { BannerService } from '../../services/banner.service';
import { DashBoardBanner } from '../../interfaces/DashBoardBanner';
import { LandingService } from '../../services/landing.service';
import { DialogRestobarDetalleComponent } from '../dialog-restobar-detalle/dialog-restobar-detalle.component';
import { FooterComponent } from '../footer/footer.component';

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
    MatIconModule,
    MatSidenavModule,
    MatMenuModule

  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit {
  private router = inject(Router);
  private landingService = inject(LandingService);
  private bannerService = inject(BannerService);
  busquedaNombre: string = '';
  private breakpointObserver = inject(BreakpointObserver);
  constructor(private dialog: MatDialog, private menuService: RestobarMenuComplementoService) { }

  restobares: Restobar[] = [];
  banners: DashBoardBanner[] = [];
  loading = false;
  menuDia: string[] = [];
  isPopoverOpen = false;
  isCollapsed = false;


  @ViewChild('carousel') carouselRef!: ElementRef;

  ingresar() {
    this.router.navigate(['login']);
  }

  registrarse() {
    this.router.navigate(['registro']);
  }

  // verDetalle(restobar: Restobar) {
  //   this.loading = true;
  //   const id = Number(restobar.id);
  //   const isSmallScreen = this.breakpointObserver.isMatched([Breakpoints.XSmall, Breakpoints.Small]);

  //   this.landingService.getDetalleRestobar(id).subscribe({
  //     next: (res: RestobarMenuComplemento | null) => {

  //       if (res?.menuDiario) {
  //         try {
  //           this.menuDia = JSON.parse(res.menuDiario);
  //         } catch (e) {
  //           console.error('Error al parsear menú del día', e);
  //           this.menuDia = [];
  //         }
  //       }
  //       this.dialog.open(DialogRestobarDetalleComponent, {
  //         width: isSmallScreen ? '90%' : '50%',
  //         panelClass: 'custom-dialog',
  //         data: { restobar, menuDia: this.menuDia }
  //       });
  //       this.loading = false;


  //       console.log('Menú cargado correctamente:', this.menuDia);
  //     },
  //     error: (err) => {
  //       console.error('Error obteniendo menú', err);
  //       this.loading = false;
  //     }
  //   });
  // }

  verDetalle(restobar: Restobar) {
    const id = Number(restobar.id);
    localStorage.setItem('data-restobar-detalle', JSON.stringify(restobar));
    const url = `/detalle-restobar/${id}`;
    window.open(url, '_blank');
  }

  ngOnInit(): void {
    this.landingService.listaAll().subscribe({
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
    this.landingService.buscarPorNombre(this.busquedaNombre.trim()).subscribe({
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

        this.landingService.buscarPorUbicacion(lat, lng, this.busquedaNombre).subscribe({
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

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

}
