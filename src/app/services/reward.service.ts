import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Reward } from '../entities/enum';
import { CURRENCY_OFFSET, GACHA_END_OFFSET, GACHA_OFFSET } from '../entities/deck';
import { Campaign } from '../entities/stage';

@Injectable({
	providedIn: 'root',
})
export class RewardService {
	constructor(private dataService: DataService) {}

	convertGachaRewards(reward: Reward): Reward[] {
		if (!(reward[0] >= GACHA_OFFSET && reward[1] < GACHA_END_OFFSET)) {
			return [];
		}
		const groupId = reward[0] - 4000000;
		const group = this.dataService.groups.find((group) => group.Id === groupId);
		if (!group && !((group.Id >= 600000 && group.Id < 700000) || (group.Id >= 300000 && group.Id < 360000))) {
			return [];
		}
		const totalProbability =
			group.ItemList.reduce((pv, cv) => {
				return pv + cv[1];
			}, 0) / reward[1];
		const result: Reward[] = [];
		for (const item of group.ItemList) {
			let [itemID, probability, ..._] = item;
			probability /= totalProbability;
			const equipment = this.dataService.equipments.get(itemID);
			if (equipment) {
				result.push([itemID, probability]);
			}
		}
		return result;
	}

	mergeRewards(base: Reward[], sub: Reward[]) {
		let rewards: Reward[] = JSON.parse(JSON.stringify(base));
		let ids = rewards.map((reward) => reward[0]);
		for (const newReward of sub) {
			if (ids.includes(newReward[0])) {
				const index = rewards.findIndex((reward) => reward[0] == newReward[0]);
				rewards[index][1] += newReward[1];
			} else {
				rewards.push(newReward);
			}
		}
		return rewards;
	}

	createRewardForCampaign(campaign: Campaign) {
		let baseRewards = campaign.regionalRewards(this.dataService)?.default;
		let dropRewards = baseRewards?.filter((reward) => reward[0] < CURRENCY_OFFSET) ?? [];
		const gachaRewards = baseRewards
			?.filter((reward) => reward[0] >= GACHA_OFFSET && reward[0] < GACHA_END_OFFSET)
			.flatMap((reward) => this.convertGachaRewards(reward));
		return this.mergeRewards(dropRewards, gachaRewards).filter((reward) => this.dataService.getStuff(reward[0]) !== undefined);
	}
}
