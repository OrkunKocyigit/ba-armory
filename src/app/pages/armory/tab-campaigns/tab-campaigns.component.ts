import { hasKeys } from 'prop-change-decorators';
import { Subscription } from 'rxjs';

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

import { DataService } from '../../../services/data.service';
import { MatDialog } from '@angular/material/dialog';
import { CampaignDialogComponent } from '../../campaign-dialog/campaign-dialog.component';

@Component({
	selector: 'ba-tab-campaigns',
	templateUrl: './tab-campaigns.component.html',
	changeDetection: ChangeDetectionStrategy.Default,
})
export class TabCampaignsComponent implements OnInit, OnDestroy {
	private changeSubscription: Subscription;
	private requiredUpdatedSubscription: Subscription;
	private stagesUpdatedSubscription: Subscription;

	constructor(
		public readonly dataService: DataService,
		private readonly changeDetectorRef: ChangeDetectorRef,
		private readonly dialog: MatDialog
	) {}

	ngOnInit(): void {
		this.changeSubscription = this.dataService.deck.change$.subscribe((changes) => {
			if (hasKeys(changes, 'selectedSquadId')) {
				this.handleChangeSquad();
			}
		});
		this.handleChangeSquad();
	}

	ngOnDestroy(): void {
		this.requiredUpdatedSubscription?.unsubscribe();
		this.stagesUpdatedSubscription?.unsubscribe();
		this.changeSubscription?.unsubscribe();
	}

	handleChangeSquad() {
		this.requiredUpdatedSubscription?.unsubscribe();
		this.stagesUpdatedSubscription?.unsubscribe();
		this.requiredUpdatedSubscription = this.dataService.deck.selectedSquad.requiredUpdated$.subscribe(() => {
			this.changeDetectorRef.markForCheck();
		});
		this.stagesUpdatedSubscription = this.dataService.deck.selectedSquad.stagesUpdated$.subscribe(() => {
			this.changeDetectorRef.markForCheck();
		});
		this.changeDetectorRef.markForCheck();
		this.dataService.deck.selectedSquad.stagesStaled$.next();
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
