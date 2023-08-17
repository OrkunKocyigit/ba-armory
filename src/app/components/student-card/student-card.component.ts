import { Subscription } from 'rxjs';

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';

import { environment } from '../../../environments/environment';
import { DeckStudent } from '../../entities/deck-student';
import { ArmorType, BulletType, SquadType, Terrain } from '../../entities/enum';
import { DataService } from '../../services/data.service';
import { ELIGMA_ID } from '../../entities/deck';

@Component({
	selector: 'ba-student-card',
	templateUrl: './student-card.component.html',
	styleUrls: ['./student-card.component.less'],
	changeDetection: ChangeDetectionStrategy.Default,
})
export class StudentCardComponent implements OnInit, OnDestroy {
	@Input()
	id: number;

	@Input()
	terrain?: Terrain;

	model: DeckStudent;

	action_remove: string;
	action_upgrade: string;
	action_target: string;
	action_update: string;

	name: string;
	dbUrl: string;
	school: string;
	bulletType: BulletType;
	bulletTypeText: string;
	armorType: ArmorType;
	armorTypeText: string;
	squadType: SquadType;
	squadTypeText: string;
	position: string;
	collectionTextureUrl: string;
	schoolIconUrl: string;

	@HostBinding('class.is_target')
	isTarget = false;

	isUpgraded: boolean = false;
	isUpdatable: boolean = false;

	get star() {
		return this.isTarget ? this.model.starTarget : this.model.star;
	}

	set star(star: number) {
		if (this.isTarget) this.model.starTarget = star;
		else this.model.star = star;
	}

	get weapon() {
		return this.isTarget ? this.model.weaponTarget : this.model.weapon;
	}

	set weapon(weapon: number) {
		if (this.isTarget) this.model.weaponTarget = weapon;
		else this.model.weapon = weapon;
	}

	get adaptationIcon() {
		if (this.terrain == null) return null;

		const adaptations = this.model.getAdaptations(this.dataService);
		return `${environment.CDN_BASE}/images/ui/Ingame_Emo_Adaptresult${this.dataService.adaptaionAmount[adaptations[this.terrain]]}.png`;
	}

	private changeSubscription: Subscription;

	constructor(private readonly dataService: DataService, private readonly changeDetectorRef: ChangeDetectorRef) {}

	ngOnInit(): void {
		this.model = this.dataService.deck.students.get(this.id);
		const student = this.dataService.students.get(this.id);

		this.action_remove = this.dataService.i18n.student_action_remove;
		this.action_upgrade = this.dataService.i18n.student_action_upgrade;
		this.action_target = this.dataService.i18n.student_action_target;
		this.action_update = this.dataService.i18n.student_action_update;

		this.name = student.name;
		this.dbUrl = `${environment.SCHALEDB_BASE}/?chara=${encodeURIComponent(student.pathName)}`;
		// i18n
		this.school = this.dataService.localization.School[student.school];
		this.bulletType = student.bulletType;
		// i18n
		this.bulletTypeText = this.dataService.localization.BulletType[this.bulletType];
		this.armorType = student.armorType;
		// i18n
		this.armorTypeText = this.dataService.localization.ArmorType[this.armorType];
		this.squadType = student.squadType;
		// i18n
		this.squadTypeText = this.dataService.localization.SquadType[this.squadType];
		this.collectionTextureUrl = student.collectionTextureUrl;
		this.schoolIconUrl = student.schoolIconUrl;
		this.isTarget = this.model.isTarget;

		this.updateIsUpgraded();
		this.updateIsUpdatable();

		this.dataService.deck.stocksChanged.subscribe(() => {
			this.updateIsUpdatable();
		});

		this.model.requiredUpdated$.subscribe(() => {
			this.updateIsUpdatable();
		});

		this.changeSubscription = this.model.change$.subscribe((changes) => {
			if (changes.hasOwnProperty('equipments')) {
				this.updateIsUpgraded();
			}
			if (changes.gear !== undefined) {
				this.updateIsUpdatable();
			}
			if (changes.hasOwnProperty('isTarget')) {
				this.isTarget = changes.isTarget.currentValue;
			}
			this.changeDetectorRef.markForCheck();
		});
	}

	ngOnDestroy(): void {
		this.changeSubscription?.unsubscribe();
	}

	handleClickDelete() {
		this.dataService.deck.selectedSquad.removeStudent(this.model.id);
	}

	handleClickUpgrade() {
		for (const equipment of this.model.equipments) {
			equipment.tierTarget = equipment.tierMax;
		}
	}

	handleClickTarget() {
		this.model.isTarget = !this.model.isTarget;
	}

	handleFocusLevel(event: FocusEvent) {
		if (event.target instanceof HTMLInputElement) {
			event.target.select();
		}
	}

	private updateIsUpgraded() {
		this.isUpgraded = this.model.equipments.every((equipment) => equipment.tierTarget === equipment.tierMax);
	}

	private updateIsUpdatable() {
		const { requiredItems } = this.model;
		function checkInventoryForUpdate(dataService: DataService) {
			for (const [id, amount] of requiredItems) {
				if (id !== ELIGMA_ID) {
					const stock = dataService.deck.stocks[id];
					if (stock < amount) {
						return false;
					}
				}
			}
			return true;
		}

		const upgradeGear = this.model.gear !== this.model.gearTarget && this.model.gearTarget !== 2;
		this.isUpdatable = (requiredItems.size > 0 || upgradeGear) && checkInventoryForUpdate(this.dataService);
	}

	handleClickUpdate() {
		this.dataService.deck.updateStudent(this.model);
	}
}
