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
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { BannerService } from '../../services/banner.service';
import { DashBoardBanner } from '../../interfaces/DashBoardBanner';
import { LandingService } from '../../services/landing.service';
import { FooterComponent } from '../footer/footer.component';
import { data } from '../dataLanding/jsonHelper.landing';
import { AlertService } from '../../services/alert.service';

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

  services = data.dataServices;

  features = data.dataFeatures;

  restobars: Restobar[] = [];
  banners: DashBoardBanner[] = [];
  loading = false;
  menuDia: string[] = [];
  isPopoverOpen = false;
  isCollapsed = false;

  isMenuOpen = false;
  currentSlide = 0;
  selectedFeature: any;
  formData = {
    name: '',
    email: '',
    restaurant: '',
    message: ''
  };

  isBusquedaOpen = false;

  constructor(private alert: AlertService) {
    this.selectedFeature = this.features[0];
    this.startCarousel();
  }

  @ViewChild('carousel') carouselRef!: ElementRef;

  ingresar() {
    this.router.navigate(['login']);
  }

  registrarse() {
    this.router.navigate(['registro']);
  }

  verDetalle(restobar: Restobar) {
    const id = Number(restobar.id);
    localStorage.setItem('data-restobar-detalle', JSON.stringify(restobar));
    const url = `/detalle-restobar/${id}`;    
    window.open(url, '_blank');
  }

  ngOnInit(): void {
    this.landingService.listaAll().subscribe({
      next: (data) => {
        this.restobars = data;        
      },
      error: (error) => {
        console.error('Error al cargar los restobars:', error);
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
        this.restobars = data;
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
            this.restobars = data;
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
  /*Desde aqui se esta agregando para el nuevo front */
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  startCarousel() {
    setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.restobars.length;
  }

  previousSlide() {
    this.currentSlide = this.currentSlide === 0 ? this.restobars.length - 1 : this.currentSlide - 1;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }

  selectFeature(feature: any) {
    this.selectedFeature = feature;
  }

  submitForm() {/*Pendiente para añadir tabla para recepcionar el feedback */
    console.log('Form submitted:', this.formData);
    this.alert.success('¡Gracias por tu mensaje!', 'Te contactaremos pronto.');
    // Reset form
    this.formData = {
      name: '',
      email: '',
      restaurant: '',
      message: ''
    };
  }

  mostrarPopupBusqueda() {
    this.isBusquedaOpen = true;
  }

  ocultarPopupBusqueda() {
    this.isBusquedaOpen = false;
  }


}
