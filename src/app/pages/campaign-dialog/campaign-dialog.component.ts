import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
	selector: 'ba-campaign-dialog',
	templateUrl: './campaign-dialog.component.html',
	styleUrls: ['./campaign-dialog.component.less'],
})
export class CampaignDialogComponent {
	constructor(@Inject(MAT_DIALOG_DATA) public data: { id: number; amount: number }) {}
}
