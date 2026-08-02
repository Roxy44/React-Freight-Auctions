export type CityOption = {
    id: string;
    name: string;
};

/** Mock dictionary for load_city / unload_city filters (assignment requirement). */
export const CITIES: CityOption[] = [
    { id: 'msk', name: 'Москва' },
    { id: 'spb', name: 'Санкт-Петербург' },
    { id: 'kzn', name: 'Казань' },
    { id: 'nsk', name: 'Новосибирск' },
    { id: 'ekb', name: 'Екатеринбург' },
    { id: 'nnov', name: 'Нижний Новгород' },
    { id: 'rnd', name: 'Ростов-на-Дону' },
    { id: 'smr', name: 'Самара' },
];

export function getCityName(idOrName: string): string {
    return CITIES.find((city) => city.id === idOrName || city.name === idOrName)?.name ?? idOrName;
}
