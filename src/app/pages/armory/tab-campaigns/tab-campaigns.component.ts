import { Subscription } from 'rxjs';

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

import { DataService } from '../../../services/data.service';
import { MatDialog } from '@angular/material/dialog';
import { CampaignDialogComponent } from '../../campaign-dialog/campaign-dialog.component';

@Component({
	selector: 'ba-tab-campaigns',
	templateUrl: './tab-campaigns.component.html',
	styleUrls: ['./tab-campaigns.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabCampaignsComponent implements OnInit, OnDestroy {
	private changeSubscription: Subscription;
	private requiredUpdatedSubscription: Subscription;

	constructor(
		public readonly dataService: DataService,
		private readonly changeDetectorRef: ChangeDetectorRef,
		private readonly dialog: MatDialog
	) {}

	ngOnInit(): void {
		this.changeSubscription = this.dataService.deck.change$.subscribe((changes) => {
			if (changes.hasOwnProperty('selectedSquadId')) {
				this.handleChangeSquad();
			}
		});
		this.handleChangeSquad();
	}

	ngOnDestroy(): void {
		this.requiredUpdatedSubscription?.unsubscribe();
		this.changeSubscription?.unsubscribe();
	}

	handleChangeSquad() {
		this.requiredUpdatedSubscription?.unsubscribe();
		this.requiredUpdatedSubscription = this.dataService.deck.selectedSquad.requiredUpdated$.subscribe(() => {
			this.changeDetectorRef.markForCheck();
		});
		this.changeDetectorRef.markForCheck();
	}

	async showCampaignModal(id: number, amount: number) {
		const dialogRef = this.dialog.open(CampaignDialogComponent, {
			data: { id: id, amount: amount },
			autoFocus: false,
			restoreFocus: false,
		});
		dialogRef.afterClosed();
	}
}
