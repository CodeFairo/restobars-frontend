import { Component, inject } from '@angular/core';
import { FooterData, FooterService } from '../../services/footer.service';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [NgIf,NgFor],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  private footerService = inject(FooterService);

  footerData: FooterData | null = null;

   ngOnInit(): void {
    this.footerService.getFooterData().subscribe(data => {
      this.footerData = data;
    });
  }

}
