export interface Config {
	links: Link[];
	build: number;
	Regions: Region[];
	Changelog: Changelog[];
	TypeEffectiveness: TypeEffectiveness;
	GachaGroups: GachaGroup[];
}

export interface Changelog {
	date: string;
	contents: string[];
}

export interface GachaGroup {
	Id: number;
	ItemList: Array<number[]>;
}

export interface Region {
	Name: string;
	StudentMaxLevel: number;
	WeaponMaxLevel: number;
	BondMaxLevel: number;
	EquipmentMaxLevel: number[];
	CampaignMax: number;
	CampaignExtra: boolean;
	Events: number[];
	Event701Max: number[];
	ChaserMax: number;
	BloodMax: number;
	FindGiftMax: number;
	SchoolDungeonMax: number;
	FurnitureSetMax: number;
	FurnitureTemplateMax: number;
	CurrentGacha: CurrentGacha[];
	CurrentEvents: CurrentEvent[];
	CurrentRaid: CurrentRAID[];
}

export interface CurrentEvent {
	event: number;
	start: number;
	end: number;
}

export interface CurrentGacha {
	characters: number[];
	start: number;
	end: number;
}

export interface CurrentRAID {
	type: string;
	raid: number;
	terrain?: string;
	start: number;
	end: number;
}

export interface TypeEffectiveness {
	Normal: WeaponType;
	Explosion: WeaponType;
	Pierce: WeaponType;
	Mystic: WeaponType;
	Sonic: WeaponType;
}

export interface WeaponType {
	LightArmor: number;
	HeavyArmor: number;
	Unarmed: number;
	Structure: number;
	ElasticArmor: number;
	Normal: number;
}

export interface Link {
	section: string;
	content: Content[];
}

export interface Content {
	title: string;
	description: string;
	url: string;
	author: string;
}
