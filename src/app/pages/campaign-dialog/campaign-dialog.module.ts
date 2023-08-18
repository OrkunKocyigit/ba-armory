import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CampaignDialogComponent } from './campaign-dialog.component';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
	declarations: [CampaignDialogComponent],
	imports: [CommonModule, ComponentsModule],
})
export class CampaignDialogModule {}
