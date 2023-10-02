import { plainToClassFromExist, plainToInstance } from 'class-transformer';

import { Injectable } from '@angular/core';
import { Common } from '../entities/common';
import { Deck, ELIGMA_ID, EQUIPMENT_OFFSET, FURNITURE_OFFSET } from '../entities/deck';
import { ArmorType, BulletType, EquipmentCategory, ItemCategory, Reward, SkillType, StuffCategory, Terrain } from '../entities/enum';
import { Equipment } from '../entities/equipment';
import { I18N } from '../entities/i18n';
import { EXTRA_ICONS, RAID_ICONS } from '../entities/icons';
import { Localization } from '../entities/localization';
import { Stage } from '../entities/stage';
import { Student } from '../entities/student';
import { ElephSortOption, ItemSortOption, LanguageOption, RegionOption, StudentSortOption, TerrainOption } from '../entities/types';
import { RewardService } from './reward.service';
import { Config } from '../entities/config';

@Injectable({
	providedIn: 'root',
})
export class DataService {
	language = 'cn';
	region = 0;

	students = new Map<number, Student>();
	equipments = new Map<number, Equipment>();
	items = new Map<number, Equipment>();

	stockables: number[] = [];

	equipmentsByCategory = new Map<ItemCategory, Map<number, number>>();
	equipmentCategoryMaxTier = new Map<ItemCategory, number>();

	stages: Stage = new Stage();

	config: Config;
	common: Common;
	localization: Localization;
	i18n: I18N;

	icons: string[] = [];

	deck: Deck = new Deck();

	starSecretStoneAmount = [0, 0, 30, 110, 210, 330];
	weaponSecretStoneAmount = [0, 0, 120, 300];
	skillExUpgradeCredits = [0, 0, 80000, 580000, 3580000, 13580000];
	skillUpgradeCredits = [0, 0, 5000, 12500, 72500, 162500, 462500, 912500, 2412500, 4812500, 8812500];
	weaponUpgradeCredits = [0, 0, 500000];

	studentLevelMax = 0;
	weaponLevelMax = 0;

	adaptaionAmount = ['D', 'C', 'B', 'A', 'S', 'SS'];

	regionOptions: RegionOption[] = [
		{ id: 0, label: 'Japan' },
		{ id: 1, label: 'Global' },
		{ id: 2, label: 'China' },
	];
	languageOptions: LanguageOption[] = [
		{ id: 'cn', label: '简体中文', code: 'zh-Hans' },
		{ id: 'en', label: 'English', code: 'en' },
		{ id: 'jp', label: '日本語', code: 'ja' },
		{ id: 'tw', label: '繁體中文', code: 'zh-Hant' },
	];

	studentSortOptions: StudentSortOption[] = [];
	itemSortOptions: ItemSortOption[] = [];
	elephSortOptions: ElephSortOption[] = [];

	terrainOptions: TerrainOption[] = [];

	link = '';

	constructor() {}

	setConfig(json: any) {
		this.config = json;
	}

	setCommon(json: any) {
		this.common = json;

		const region = this.common.regions[this.region];

		this.studentLevelMax = region.studentlevel_max;
		this.weaponLevelMax = region.weaponlevel_max;
	}

	setStudents(json: any[]) {
		const region = this.region;
		this.students = new Map(
			plainToInstance(Student, json, {
				excludeExtraneousValues: true,
				exposeDefaultValues: true,
			})
				.filter((student) => student.isReleased[region])
				.map((student) => {
					student.skills = student.skills.filter(
						(skill) =>
							skill.skillType === SkillType.Ex ||
							skill.skillType === SkillType.Normal ||
							skill.skillType === SkillType.Passive ||
							skill.skillType === SkillType.Sub
					);
					return [student.id, student];
				})
		);
	}

	setEquipments(json: any[]) {
		this.equipments = new Map(
			plainToInstance(Equipment, json, {
				excludeExtraneousValues: true,
				exposeDefaultValues: true,
			}).map((equipment) => {
				equipment.id = equipment.id + EQUIPMENT_OFFSET;
				return [equipment.id, equipment];
			})
		);

		for (const [id, equipment] of this.equipments) {
			if (!equipment.isReleased[this.region]) continue;

			const category = equipment.category;
			let categoryMap = this.equipmentsByCategory.get(category);
			if (categoryMap == null) {
				categoryMap = new Map<number, number>();
				this.equipmentsByCategory.set(category, categoryMap);
			}
			if (!categoryMap.has(equipment.tier)) {
				categoryMap.set(equipment.tier, id);
			}
			if (equipment.recipe == null) {
				if (equipment.category in EquipmentCategory) {
					this.stockables.push(equipment.id);
				}
			} else {
				for (const recipe of equipment.recipe) {
					recipe[0] = recipe[0] + EQUIPMENT_OFFSET;
				}
			}
		}

		for (const [category, equipments] of this.equipmentsByCategory) {
			this.equipmentCategoryMaxTier.set(category, Math.max(...equipments.keys()));
		}
	}

	setItems(json: any[]) {
		this.items = new Map(
			plainToInstance(Equipment, json, {
				excludeExtraneousValues: true,
				exposeDefaultValues: true,
			})
				.filter((item) => item.isReleased[this.region])
				.map((item) => [item.id, item])
		);

		for (const [_, item] of this.items) {
			if (
				(item.category === StuffCategory.Material &&
					(item.tags.includes('MaterialItem') ||
						item.tags.includes('CDItem') ||
						item.tags.includes('BookItem') ||
						item.tags.includes('ShiftingCraftCategory_BookItem'))) ||
				item.tags.includes('SecretStone') ||
				item.tags.includes('FavorItem')
			) {
				this.stockables.push(item.id);
			}
		}
	}

	setStage(json: any[]) {
		plainToClassFromExist(this.stages, json, {
			excludeExtraneousValues: true,
			exposeDefaultValues: true,
		});

		function mergeSameIds(reward: Reward[]) {
			const ids = reward.map((value) => value[0]).filter((value, index, array) => index == array.indexOf(value));
			const merged = [];
			for (const id of ids) {
				const newReward: Reward = [
					id,
					reward
						.filter((value) => value[0] === id)
						.map((value) => value[1])
						.reduce((previousValue, currentValue) => previousValue + currentValue, 0),
				];
				merged.push(newReward);
			}
			return merged;
		}

		for (const campaign of this.stages.campaign) {
			campaign.rewards.default = mergeSameIds(campaign.rewards.default);
			campaign.rewards.firstClear = mergeSameIds(campaign.rewards.firstClear);
			campaign.rewards.threeStar = mergeSameIds(campaign.rewards.threeStar);
			if (campaign.rewardsGlobal) {
				campaign.rewardsGlobal.default = mergeSameIds(campaign.rewardsGlobal.default);
				campaign.rewardsGlobal.firstClear = mergeSameIds(campaign.rewardsGlobal.firstClear);
				campaign.rewardsGlobal.threeStar = mergeSameIds(campaign.rewardsGlobal.threeStar);
			}
			if (campaign.RewardsCn) {
				campaign.RewardsCn.default = mergeSameIds(campaign.RewardsCn.default);
				campaign.RewardsCn.firstClear = mergeSameIds(campaign.RewardsCn.firstClear);
				campaign.RewardsCn.threeStar = mergeSameIds(campaign.RewardsCn.threeStar);
			}
		}
		this.stages.hydrate(this);
	}

	setLocalization(json: any) {
		this.localization = json;
	}

	setI18N(json: any) {
		this.i18n = json;
	}

	setOthers() {
		this.icons.push(...RAID_ICONS);
		this.icons.push(...EXTRA_ICONS);
		const schoolIcons: string[] = [];
		for (const [, student] of this.students) {
			this.icons.push(student.collectionTextureUrl);
			if (!schoolIcons.includes(student.schoolIconUrl)) {
				schoolIcons.push(student.schoolIconUrl);
			}
		}
		this.icons.push(...schoolIcons);

		this.studentSortOptions = [
			{
				id: 'level',
				// i18n
				label: this.localization.Stat['Level'],
				key: [(deckStudent) => -deckStudent.level, (deckStudent) => -deckStudent.star, (deckStudent) => deckStudent.id],
			},
			{
				id: 'star',
				label: 'star',
				key: [(deckStudent) => -deckStudent.star, (deckStudent) => -deckStudent.level, (deckStudent) => deckStudent.id],
			},
			{
				id: 'streetBattleAdaptation',
				// i18n
				label: this.localization.AdaptationType['Street'],
				key: [
					(deckStudent) => -this.students.get(deckStudent.id).streetBattleAdaptation,
					(deckStudent) => -deckStudent.star,
					(deckStudent) => -deckStudent.level,
					(deckStudent) => deckStudent.id,
				],
			},
			{
				id: 'outdoorBattleAdaptation',
				// i18n
				label: this.localization.AdaptationType['Outdoor'],
				key: [
					(deckStudent) => -this.students.get(deckStudent.id).outdoorBattleAdaptation,
					(deckStudent) => -deckStudent.star,
					(deckStudent) => -deckStudent.level,
					(deckStudent) => deckStudent.id,
				],
			},
			{
				id: 'indoorBattleAdaptation',
				// i18n
				label: this.localization.AdaptationType['Indoor'],
				key: [
					(deckStudent) => -this.students.get(deckStudent.id).indoorBattleAdaptation,
					(deckStudent) => -deckStudent.star,
					(deckStudent) => -deckStudent.level,
					(deckStudent) => deckStudent.id,
				],
			},
			{
				id: 'bulletType',
				// i18n
				label: this.localization.ui['attacktype'],
				key: [
					(deckStudent) => -Object.keys(BulletType).indexOf(this.students.get(deckStudent.id).bulletType),
					(deckStudent) => -deckStudent.star,
					(deckStudent) => -deckStudent.level,
					(deckStudent) => deckStudent.id,
				],
			},
			{
				id: 'armorType',
				// i18n
				label: this.localization.ui['defensetype'],
				key: [
					(deckStudent) => -Object.keys(ArmorType).indexOf(this.students.get(deckStudent.id).armorType),
					(deckStudent) => -deckStudent.star,
					(deckStudent) => -deckStudent.level,
					(deckStudent) => deckStudent.id,
				],
			},
		];

		this.itemSortOptions = [
			{
				id: 'basic',
				// i18n
				label: this.i18n.item_sort_basic,
				key: [
					(equipment) => (equipment.category in StuffCategory ? -Object.keys(StuffCategory).indexOf(equipment.category) : -1000),
					(equipment) => -equipment.id,
				],
			},
			{
				id: 'deficit',
				// i18n
				label: this.i18n.item_sort_deficit,
				key: [(equipment) => this.deck.stocks[equipment.id] - this.deck.selectedSquad.required[equipment.id], (equipment) => -equipment.id],
			},
			{
				id: 'required',
				// i18n
				label: this.i18n.item_sort_required,
				key: [(equipment) => -this.deck.selectedSquad.required[equipment.id], (equipment) => -equipment.id],
			},
			{
				id: 'stock',
				// i18n
				label: this.i18n.item_sort_stock,
				key: [(equipment) => -this.deck.stocks[equipment.id], (equipment) => -equipment.id],
			},
		];

		this.elephSortOptions = [
			{
				id: 'basic',
				// i18n
				label: this.i18n.eleph_sort_basic,
				key: [(student) => -student.id],
			},
			{
				id: 'total',
				// i18n
				label: this.i18n.eleph_sort_total,
				key: [(student) => -(student.requiredItems.get(ELIGMA_ID) ?? 0), (student) => -student.id],
			},
			{
				id: 'deficit',
				// i18n
				label: this.i18n.eleph_sort_deficit,
				key: [(student) => this.deck.stocks[student.id] - this.deck.selectedSquad.required[student.id], (student) => -student.id],
			},
			{
				id: 'required',
				// i18n
				label: this.i18n.eleph_sort_required,
				key: [(student) => -this.deck.selectedSquad.required[student.id], (student) => -student.id],
			},
			{
				id: 'stock',
				// i18n
				label: this.i18n.eleph_sort_stock,
				key: [(student) => -this.deck.stocks[student.id], (student) => -student.id],
			},
		];

		this.terrainOptions = [Terrain.Street, Terrain.Outdoor, Terrain.Indoor].map((terrain) => ({
			id: terrain,
			label: this.localization.AdaptationType[terrain],
		}));
	}

	setDeck(json: any, rewardService: RewardService) {
		plainToClassFromExist(this.deck, json, {
			excludeExtraneousValues: true,
			exposeDefaultValues: true,
		});
		this.deck.hydrate(this, rewardService);
	}

	getEquipmentTier(equipmentCategory: EquipmentCategory, tier: number) {
		const categoryMap = this.equipmentsByCategory.get(equipmentCategory);
		return categoryMap?.get(tier) ?? 0;
	}

	getStuff(id: number) {
		if (id >= EQUIPMENT_OFFSET) {
			return this.equipments.get(id);
		} else if (id >= FURNITURE_OFFSET) {
			return null;
		} else {
			return this.items.get(id);
		}
	}
}
