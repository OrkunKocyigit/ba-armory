import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ComponentsModule } from '../../components/components.module';
import { SelectorComponent } from "./selector.component";
import { FormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatDialogModule } from "@angular/material/dialog";

@NgModule({
	declarations: [SelectorComponent],
	imports: [CommonModule, ComponentsModule, FormsModule, MatInputModule, MatDialogModule]
})
export class SelectorModule {}
