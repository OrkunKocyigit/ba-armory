import { Exclude, Expose, Type } from 'class-transformer';
import { Change, ChangeDispatcher, dispatchChanges, Dispatcher } from 'prop-change-decorators';
import { debounceTime, filter, Subject, Subscription } from 'rxjs';

import { environment } from '../../environments/environment';
import { ACTION_POINT_ID, ALT_OFFSET } from './deck';
import { DeckStocks, DeckStocksClear, wrapStocks } from './deck-stocks';
import { DeckStudent } from './deck-student';
import { CampaignDifficulty, StuffCategory, Terrain } from './enum';
import { ElephSortOption, ItemSortOption, SortOption, StudentSortOption, Tab } from './types';

import type { DataService } from '../services/data.service';
import { RewardService } from '../services/reward.service';

@Exclude()
export class DeckSquad {
	id: number = 0;

	@Expose({ name: 'icon' })
	icon: string = '';

	@Expose({ name: 'name' })
	name: string = '';

	@Expose({ name: 'terrain' })
	terrain: Terrain = Terrain.Street;

	@Expose({ name: 'students' })
	@Type(() => Number)
	students: number[] = [];

	@Expose({ name: 'pinned' })
	pinned: boolean = false;

	@Expose({ name: 'bounded' })
	bounded: boolean = false;

	@Expose({ name: 'tab' })
	tab: Tab = Tab.items;

	readonly required: DeckStocks = wrapStocks({});

	readonly stages: {
		id: number;
		amount: number;
	}[] = [];

	@Dispatcher()
	readonly change$: ChangeDispatcher<DeckSquad>;
	readonly requiredStaled$ = new Subject<void>();
	readonly requiredUpdated$ = new Subject<void>();
	readonly stagesStaled$ = new Subject<void>();
	readonly stagesUpdated$ = new Subject<void>();

	autoIcon: string = '';

	hydrate(dataService: DataService, rewardService: RewardService) {
		this.id = dataService.deck.squads.indexOf(this);

		// i18n
		if (this.name == null || this.name === '') {
			this.name = `${dataService.i18n.squad_name} #${this.id + 1}`;
		}

		if (this.terrain == null) {
			this.terrain = Terrain.Street;
		}

		if (this.pinned == null) {
			this.pinned = false;
		}

		if (this.tab == null) {
			this.tab = 0;
		}

		this.students = (this.students ?? []).filter((studentId) => dataService.deck.students.has(studentId));

		if (this.icon == null || this.icon === '') {
			this.icon = '';
		} else {
			this.icon = this.icon.replace(`${environment.CDN_BASE}/images/items/icon/`, `${environment.CDN_BASE}/images/item/icon/`);
		}
		this.updateAutoIcon(dataService);

		const changeSubscriptionMap = new Map<number, Subscription>();

		const subscribeDeckStudent = (deckStudent: DeckStudent) => {
			unsubscribeDeckStudent(deckStudent);
			changeSubscriptionMap.set(
				deckStudent.id,
				deckStudent.requiredUpdated$.subscribe(() => {
					this.requiredStaled$.next();
				})
			);
		};
		const unsubscribeDeckStudent = (deckStudent: DeckStudent) => {
			changeSubscriptionMap.get(deckStudent.id)?.unsubscribe();
		};

		this.change$.subscribe((changes) => {
			if (Array.isArray(changes.students)) {
				for (const studentChange of changes.students) {
					if (studentChange.previousValue) {
						const deckStudent = dataService.deck.students.get(studentChange.previousValue);
						if (!deckStudent.isAlt()) {
							unsubscribeDeckStudent(deckStudent);
							this.requiredStaled$.next();
						}
					}

					if (studentChange.currentValue) {
						const deckStudent = dataService.deck.students.get(studentChange.currentValue);
						if (!deckStudent.isAlt()) {
							subscribeDeckStudent(deckStudent);
							this.requiredStaled$.next();
						}
					}
				}
				this.updateAutoIcon(dataService);
			}
		});

		dataService.deck.options.change$.subscribe((changes) => {
			if (changes.showCampaignHard || changes.showOnlyCampaignHard || changes.normalCampaignDropRate || changes.hardCampaignDropRate) {
				this.requiredStaled$.next();
			}
		});

		dataService.deck.change$.subscribe((changes) => {
			if (changes.stocks) {
				this.stagesStaled$.next();
			}
		});

		this.requiredStaled$
			.pipe(
				filter(() => dataService.deck.selectedSquadId === this.id),
				debounceTime(200)
			)
			.subscribe(() => {
				this.updateRequiredItems(dataService, rewardService);
			});

		this.stagesStaled$
			.pipe(
				filter(() => dataService.deck.selectedSquadId === this.id && dataService.deck.selectedSquad.tab === Tab.campaigns),
				debounceTime(200)
			)
			.subscribe(() => {
				this.updateStages(dataService, rewardService);
			});

		for (const studentId of this.students) {
			const deckStudent = dataService.deck.students.get(studentId);
			if (!deckStudent.isAlt()) {
				subscribeDeckStudent(deckStudent);
			}
		}
	}

	hasStudent(studentId: number) {
		return this.students.includes(studentId);
	}

	addStudent(this: DeckSquad, dataService: DataService, studentId: number) {
		if (studentId > ALT_OFFSET) {
			if (!dataService.deck.students.has(studentId)) {
				const student = dataService.getStudent(studentId);
				if (student == null) return false;

				const deckStudent = DeckStudent.fromStudent(dataService, student);
				(deckStudent as any).id = studentId;
				dataService.deck.students.set(studentId, deckStudent);
			}
		} else {
			if (!dataService.students.has(studentId)) return false;
		}

		this.students.push(studentId);
		dispatchChanges(this, { students: [new Change(undefined, studentId)] });

		return true;
	}

	removeStudent(this: DeckSquad, studentId: number) {
		const index = this.students.indexOf(studentId);
		if (index === -1) return false;

		const deckStudent = this.students.splice(index, 1);
		dispatchChanges(this, { students: [new Change(deckStudent[0], undefined)] });

		return true;
	}

	updateRequiredItems(dataService: DataService, rewardService: RewardService) {
		this.required[DeckStocksClear]();

		const counted = new Set<number>();
		for (const studentId of this.students) {
			if (counted.has(studentId)) continue;

			const deckStudent = dataService.deck.students.get(studentId);

			if (deckStudent.isAlt()) continue;

			for (const [id, amount] of deckStudent.requiredItems) {
				this.required[id] += amount;
			}

			counted.add(studentId);
		}

		this.requiredUpdated$.next();
		this.updateStages(dataService, rewardService);
	}

	updateStages(dataService: DataService, rewardService: RewardService) {
		const candidates = dataService.stages.campaign
			.filter((campaign) => dataService.deck.options.showCampaignHard || campaign.difficulty !== CampaignDifficulty.Hard)
			.filter((campaign) => !dataService.deck.options.showOnlyCampaignHard || campaign.difficulty === CampaignDifficulty.Hard)
			.filter((campaign) => campaign.entryCost.every(([itemId]) => itemId === ACTION_POINT_ID))
			.map((campaign) => {
				let weight = 0;
				const cost = campaign.entryCost.find(([itemId]) => itemId === ACTION_POINT_ID)?.[1] ?? 0;
				if (cost > 0) {
					const rewards = rewardService.createRewardForCampaign(campaign);
					for (let [rewardId, rate] of rewards) {
						const required = this.required[rewardId];
						if (required > 0) {
							let scale = dataService.deck.options.normalCampaignDropRate;
							if (campaign.difficulty === CampaignDifficulty.Hard) {
								scale = dataService.deck.options.hardCampaignDropRate;
								const reward = dataService.getStuff(rewardId);
								if (reward == null) {
									scale = 0;
								}
							}
							weight += Math.max(0, required - dataService.deck.stocks[rewardId]) * rate * scale;
						}
					}
				}

				return {
					weight: cost > 0 ? weight / cost : 0,
					campaign,
				};
			})
			.filter(({ weight }) => weight > 0)
			.sort((a, b) => b.weight - a.weight)
			.slice(0, 20)
			.map(({ campaign }) => {
				let amount = 0;
				const rewards = rewardService.createRewardForCampaign(campaign);
				for (let [rewardId, rate] of rewards) {
					const required = this.required[rewardId];
					if (required > 0) amount = Math.max(amount, Math.max(0, required - dataService.deck.stocks[rewardId]) / rate);
				}
				let scale;
				if (campaign.difficulty === CampaignDifficulty.Hard) {
					scale = dataService.deck.options.hardCampaignDropRate;
				} else {
					scale = dataService.deck.options.normalCampaignDropRate;
				}

				return { id: campaign.id, amount: Math.ceil(amount / scale) };
			});

		this.stages.splice(0, this.stages.length, ...candidates);

		this.stagesUpdated$.next();
	}

	updateAutoIcon(dataService: DataService) {
		if (this.students.length > 0) {
			this.autoIcon = dataService.getStudent(this.students[0]).collectionTextureUrl;
		} else {
			this.autoIcon = './assets/icons/icon-32x32.png';
		}
	}

	sortStudents(dataService: DataService, option: StudentSortOption, direction: -1 | 1) {
		if (option == null) {
			this.students.reverse();
			return;
		}

		this.students.sort((aId, bId) => sortObject(dataService.deck.students.get(aId), dataService.deck.students.get(bId), option, direction));
	}

	sortItems(dataService: DataService, option: ItemSortOption, direction: -1 | 1) {
		if (option == null) {
			dataService.stockables.reverse();
			return;
		}

		dataService.stockables.sort((aId, bId) => sortObject(dataService.getStuff(aId), dataService.getStuff(bId), option, direction));
	}

	sortElephs(dataService: DataService, ids: number[], option: ElephSortOption, direction: -1 | 1) {
		if (option == null) {
			ids.reverse();
			return;
		}

		ids.sort((aId, bId) => sortObject(dataService.deck.students.get(aId), dataService.deck.students.get(bId), option, direction));
	}

	sortGears(dataService: DataService, ids: number[], option: ItemSortOption, direction: -1 | 1) {
		if (option == null) {
			ids.reverse();
			return;
		}

		ids.sort((aId, bId) => sortObject(dataService.getStuff(aId), dataService.getStuff(bId), option, direction));
	}
}

const compare = (a: string | number, b: string | number) => {
	return typeof a === 'string' && typeof b === 'string' ? a.localeCompare(b) : +a - +b;
};

const sortObject = <T>(a: T, b: T, option: SortOption<T>, direction: -1 | 1) => {
	for (const key of option.key) {
		const aValue = key(a);
		const bValue = key(b);
		const diff = compare(aValue, bValue);
		if (diff !== 0) return direction * diff;
	}
	return 0;
};
