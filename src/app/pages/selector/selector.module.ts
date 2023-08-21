import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';

import { ComponentsModule } from '../../components/components.module';
import { SelectorComponent } from './selector.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
	declarations: [SelectorComponent],
	imports: [
		CommonModule,
		FormsModule,
		ComponentsModule,
		MatCheckboxModule,
		MatDividerModule,
		MatButtonModule,
		MatIconModule,
		MatInputModule,
		MatDialogModule,
	],
})
export class SelectorModule {}
