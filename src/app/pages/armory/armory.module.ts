import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SortablejsModule } from '../../services/sortable';

import { ArmoryComponent } from '../armory/armory.component';
import { ComponentsModule } from '../../components/components.module';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
	declarations: [ArmoryComponent],
	imports: [
		CommonModule,
		FormsModule,
		SortablejsModule,
		MatIconModule,
		MatButtonModule,
		MatCheckboxModule,
		MatMenuModule,
		MatTabsModule,
		MatDividerModule,
		ComponentsModule,
	],
})
export class ArmoryModule {}
