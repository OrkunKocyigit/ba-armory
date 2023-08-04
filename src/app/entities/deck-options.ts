import { Exclude, Expose } from 'class-transformer';
import { ChangeDispatcher, Dispatcher, WatchBoolean, WatchNumber } from 'prop-change-decorators';

@Exclude()
export class DeckOptions {
	@Expose({ name: 'showSurplusItems' })
	@WatchBoolean({ name: 'showSurplusItems' })
	private __showSurplusItems__: boolean = false;
	showSurplusItems: boolean;

	@Expose({ name: 'showRequiredItems' })
	@WatchBoolean({ name: 'showRequiredItems' })
	private __showRequiredItems__: boolean = false;
	showRequiredItems: boolean;

	@Expose({ name: 'showElephs' })
	@WatchBoolean({ name: 'showElephs' })
	private __showElephs__: boolean = false;
	showElephs: boolean;

	@Expose({ name: 'showCampaignHard' })
	@WatchBoolean({ name: 'showCampaignHard' })
	private __showCampaignHard__: boolean = false;
	showCampaignHard: boolean;

	@Expose({ name: 'showDuplicatedStudents' })
	@WatchBoolean({ name: 'showDuplicatedStudents' })
	private __showDuplicatedStudents__: boolean = false;
	showDuplicatedStudents: boolean;

	@Expose({ name: 'showOnlyCampaignHard' })
	@WatchBoolean({ name: 'showOnlyCampaignHard' })
	private __showOnlyCampaignHard__: boolean = false;
	showOnlyCampaignHard: boolean;

	@Expose({ name: 'normalCampaignDropRate' })
	@WatchNumber({ name: 'normalCampaignDropRate' })
	private __normalCampaignDropRate__: number = 1;
	normalCampaignDropRate: number;

	@Expose({ name: 'hardCampaignDropRate' })
	@WatchNumber({ name: 'hardCampaignDropRate' })
	private __hardCampaignDropRate__: number = 1;
	hardCampaignDropRate: number;

	@Dispatcher()
	readonly change$: ChangeDispatcher<DeckOptions>;
}
