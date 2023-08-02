import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ComponentsModule } from '../../components/components.module';
import { IconSelectorComponent } from './icon-selector.component';
import { MatDialogModule } from "@angular/material/dialog";

@NgModule({
	declarations: [IconSelectorComponent],
	imports: [CommonModule, FormsModule, ComponentsModule, MatDialogModule]
})
export class IconSelectorModule {}
