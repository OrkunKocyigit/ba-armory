import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { Change, ChangeDispatcher, dispatchChange, dispatchChanges, Dispatcher } from 'prop-change-decorators';

import { DeckOptions } from './deck-options';
import { DeckSquad } from './deck-squad';
import { DeckStocks, DeckStocksChange, transformStocks, wrapStocks } from './deck-stocks';
import { DeckStudent } from './deck-student';

import type { DataService } from '../services/data.service';
import { RewardService } from '../services/reward.service';
import { Subject } from 'rxjs';

export const GACHA_END_OFFSET = 5000000;
export const GACHA_OFFSET = 4000000;
export const CURRENCY_OFFSET = 3000000;
export const EQUIPMENT_OFFSET = 2000000;
export const FURNITURE_OFFSET = 1000000;
export const GOLD_ID = 1;
export const ACTION_POINT_ID = 5;
export const ELIGMA_ID = 23;

export const ALT_OFFSET = 1000000;

@Exclude()
export class Deck {
	@Expose({ name: 'options' })
	@Type(() => DeckOptions)
	options: DeckOptions;

	@Expose({ name: 'students' })
	@Type(() => DeckStudent)
	@Transform(({ value }: { value: DeckStudent[] }) => new Map((value ?? []).map((item: any) => [item.id, item])), { toClassOnly: true })
	@Transform(({ value }: { value: Map<number, DeckStudent> }) => Array.from(value.values()), { toPlainOnly: true })
	students: Map<number, DeckStudent> = new Map<number, DeckStudent>();

	@Expose({ name: 'stocks' })
	@Transform(transformStocks, { toClassOnly: true })
	stocks: DeckStocks;

	stocksChanged: Subject<DeckStocks> = new Subject<DeckStocks>();

	@Expose({ name: 'squads' })
	@Type(() => DeckSquad)
	squads: DeckSquad[] = [];

	@Expose({ name: 'selectedSquadId' })
	private __selectedSquadId__: number = undefined;

	constructor() {
		this.stocksChanged.subscribe((value) => {
			this.stocks = value;
		});
	}

	updateStock(id: number, amount: number) {
		this.stocks[id] = amount;
		this.stocksChanged.next(this.stocks);
	}

	get selectedSquadId() {
		return this.__selectedSquadId__;
	}

	set selectedSquadId(selectedSquadId: number) {
		selectedSquadId = Math.max(Math.min(selectedSquadId, this.squads.length - 1), 0);

		if (this.selectedSquad !== this.squads[selectedSquadId]) {
			const selectedSquadIdOld = this.__selectedSquadId__;
			this.__selectedSquadId__ = selectedSquadId;

			this.selectedSquad = this.squads[selectedSquadId];
			dispatchChange(this, 'selectedSquadId', selectedSquadIdOld, this.__selectedSquadId__);
		}
	}

	selectedSquad: DeckSquad = undefined;

	@Dispatcher()
	readonly change$: ChangeDispatcher<Deck>;

	hydrate(dataService: DataService, rewardService: RewardService) {
		if (this.options == null) {
			this.options = new DeckOptions();
		}

		if (this.stocks == null) {
			this.stocks = wrapStocks({});
		}
		this.stocks[DeckStocksChange]().subscribe(([itemId, oldValue]) => {
			dispatchChanges(this as Deck, { stocks: { [itemId]: new Change(oldValue, this.stocks[itemId]) } });
		});

		if (this.students == null) {
			this.students = new Map();
		}
		for (const [, deckStudent] of this.students) {
			deckStudent.hydrate(dataService);
		}

		for (const [studentId, student] of dataService.students) {
			if (!this.students.has(studentId)) {
				const deckStudent = DeckStudent.fromStudent(dataService, student);
				this.students.set(studentId, deckStudent);
			}
		}
		if (this.squads == null) {
			this.squads = [];
		}
		if (this.squads.length === 0) {
			const deckSquad = new DeckSquad();
			this.squads.push(deckSquad);
		}

		for (const deckSquad of this.squads) {
			deckSquad.hydrate(dataService, rewardService);
		}

		this.selectedSquadId = this.selectedSquadId ?? 0;
	}

	addSquad(dataService: DataService, rewardService: RewardService) {
		const deckSquad = new DeckSquad();
		this.squads.push(deckSquad);
		deckSquad.hydrate(dataService, rewardService);
	}

	removeSquad(dataService: DataService) {
		if (this.squads.length === 1) return;

		const selectedSquad = this.selectedSquad;
		const selectedSquadId = selectedSquad.id;
		this.squads.splice(selectedSquadId, 1);

		for (let id = 0; id < this.squads.length; id++) {
			this.squads[id].id = id;
		}

		this.selectedSquadId = selectedSquadId;
	}

	moveSquad(dataService: DataService, dir: -1 | 1) {
		const selectedSquad = this.selectedSquad;
		const selectedSquadId = selectedSquad.id;
		const newSquadId = Math.max(Math.min(selectedSquadId + dir, this.squads.length - 1), 0);

		if (newSquadId !== selectedSquadId) {
			[this.squads[newSquadId], this.squads[selectedSquadId]] = [this.squads[selectedSquadId], this.squads[newSquadId]];
			this.squads[newSquadId].id = newSquadId;
			this.squads[selectedSquadId].id = selectedSquadId;
			this.selectedSquadId = newSquadId;
		}
	}

	updateStudent(model: DeckStudent) {
		for (const [id, amount] of model.requiredItems) {
			this.stocks[id] = Math.max(0, this.stocks[id] - amount);
		}
		this.stocksChanged.next(this.stocks);
		model.star = model.starTarget;
		model.weapon = model.weaponTarget;
		for (const skill of model.skills) {
			skill.level = skill.levelTarget;
		}
		for (const equipment of model.equipments) {
			equipment.tier = equipment.tierTarget;
		}
		model.gear = model.gearTarget;
	}
}
