import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { DataService } from '../../services/data.service';

@Component({
	selector: 'ba-item-user',
	templateUrl: './item-user.component.html',
	changeDetection: ChangeDetectionStrategy.Default,
})
export class ItemUserComponent implements OnInit {
	@Input()
	id: number;

	@HostBinding('class')
	readonly className = 'contents';

	users: { id: number; amount: number }[] = [];

	constructor(
		@Inject(MAT_DIALOG_DATA) data: { id: number },
		public readonly dataService: DataService,
		private readonly changeDetectorRef: ChangeDetectorRef
	) {
		if (typeof data?.id === 'number') {
			this.id = data.id;
		}
	}

	ngOnInit(): void {
		const item = this.dataService.getStuff(this.id);

		const counted = new Set<number>();
		this.users = [];

		for (const studentId of this.dataService.deck.selectedSquad.students) {
			if (counted.has(studentId)) continue;
			const amount = this.dataService.deck.students.get(studentId)?.requiredItems?.get(item.id) ?? 0;

			if (amount > 0) {
				this.users.push({ id: studentId, amount });
			}

			counted.add(studentId);
		}
	}
}
