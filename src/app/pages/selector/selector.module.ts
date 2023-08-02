import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { ComponentsModule } from "../../components/components.module";
import { SelectorComponent } from "./selector.component";
import { FormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatDialogModule } from "@angular/material/dialog";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatDividerModule } from "@angular/material/divider";

@NgModule({
	declarations: [SelectorComponent],
	imports: [CommonModule, ComponentsModule, FormsModule, MatInputModule, MatDialogModule, MatCheckboxModule, MatDividerModule]
})
export class SelectorModule {}
