import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field'; // ⬅ necesario
import { MatInputModule } from '@angular/material/input'; // ⬅ necesario

@Component({
  selector: 'app-seleccion-rol-dialog',
  standalone: true,
  imports: [
    MatDialogActions,
    MatDialogModule,
    FormsModule,
    MatFormFieldModule, // ✅ Importado
    MatInputModule       // ✅ Importado
  ],
  templateUrl: './seleccion-rol-dialog.component.html',
  styleUrl: './seleccion-rol-dialog.component.css'
})
export class SeleccionRolDialogComponent {
  nombreCompleto: string = '';

  private dialogRef = inject(MatDialogRef<SeleccionRolDialogComponent>);

  constructor(@Inject(MAT_DIALOG_DATA) public data: { displayName: string }) {}

  ngOnInit() {
    this.nombreCompleto = this.data.displayName || '';
  }

  seleccionar(rol: string) {
    this.dialogRef.close({
      rol,
      nombreCompleto: this.nombreCompleto
    });
  }
}
