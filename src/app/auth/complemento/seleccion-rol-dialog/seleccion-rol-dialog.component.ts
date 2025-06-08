import { Component, inject } from '@angular/core';
import { MatDialogActions, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-seleccion-rol-dialog',
  standalone: true,
  imports: [MatDialogActions, MatDialogModule],
  templateUrl: './seleccion-rol-dialog.component.html',
  styleUrl: './seleccion-rol-dialog.component.css'
})
export class SeleccionRolDialogComponent {

  private dialogRef = inject(MatDialogRef<SeleccionRolDialogComponent>);

  seleccionar(rol: string) {
    this.dialogRef.close(rol);
  }
}
