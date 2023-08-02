import { Subscription } from "rxjs";

import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from "@angular/core";

import { DataService } from "../../services/data.service";

@Component({
	selector: "ba-selector",
	templateUrl: "./selector.component.html",
	styleUrls: ["./selector.component.less"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectorComponent implements OnInit, OnDestroy {
	title = "";
	missingStudents: number[] = [];
	studentName = "";
	filterText: string = "";

	private changeSubscription: Subscription;

	constructor(public readonly dataService: DataService) {
	}

	ngOnInit(): void {
		// i18n
		this.title = this.dataService.localization.ui["navbar_students"];
		this.studentName = this.dataService.localization.ui["student"];

		this.dataService.deck.change$.subscribe((changes) => {
			if (changes.hasOwnProperty("selectedSquadId")) {
				this.handleChangeSquad();
			}
		});

		this.dataService.deck.options.change$.subscribe((changes) => {
			if (changes.showDuplicatedStudents) {
				this.updateMissingStudents();
			}
		});

		this.handleChangeSquad();
	}

	ngOnDestroy(): void {
		this.changeSubscription?.unsubscribe();
	}

	handleChangeSquad() {
		this.changeSubscription?.unsubscribe();
		this.changeSubscription = this.dataService.deck.selectedSquad.change$.subscribe((changes) => {
			if (Array.isArray(changes.students)) {
				this.updateMissingStudents();
			}
		});
		this.updateMissingStudents();
	}

	handleClickStudent(id: number) {
		this.dataService.deck.selectedSquad.addStudent(this.dataService, id);
	}

	handleUpdateFilterText(newText: string) {
		this.filterText = newText.toLowerCase();
		this.updateMissingStudents();
	}

	handleFilterInputClicked($event: FocusEvent) {
		const target = $event.target as HTMLInputElement;
		target.select();
	}

	updateMissingStudents() {
		this.missingStudents = [];

		for (const [, student] of this.dataService.students) {
			if ((this.dataService.deck.options.showDuplicatedStudents ||!this.dataService.deck.selectedSquad.hasStudent(student.id)) && student.name.toLowerCase().startsWith(this.filterText)) {
				this.missingStudents.push(student.id);
			}
		}
	}
}
