export interface Config {
	links: Link[];
	build: number;
	TypeEffectiveness: TypeEffectiveness;
	GachaGroups: GachaGroup[];
}

export interface GachaGroup {
	Id: number;
	ItemList: Array<number[]>;
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
