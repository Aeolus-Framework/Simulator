import { market as MarketCollection } from "./models/market";
import { powerplant as PowerplantCollection } from "./models/powerplant";

export const MARKET_DEFAULT_DB_NAME = "default";
export const POWERPLANT_DEFAULT_DB_NAME = "default";

export async function defaultCollectionsExist(): Promise<boolean> {
    return (await defaultCollectionsExists_internal()).every(c => c === true);
}

export async function generateDefaultCollections(): Promise<void> {
    const [marketExist, powerplantExist] = await defaultCollectionsExists_internal();

    if (!marketExist) {
        await new MarketCollection({
            name: MARKET_DEFAULT_DB_NAME,
            demand: 0,
            supply: 0,
            basePrice: 0.7,
            price: {
                currency: "sek"
            }
        }).save();
    }

    if (!powerplantExist) {
        await new PowerplantCollection({
            name: POWERPLANT_DEFAULT_DB_NAME,
            active: false
        }).save();
    }
}

async function defaultCollectionsExists_internal(): Promise<
    [marketExist: boolean, powerplantExist: boolean]
> {
    return await Promise.all([
        MarketCollection.exists({ name: MARKET_DEFAULT_DB_NAME }),
        PowerplantCollection.exists({ name: POWERPLANT_DEFAULT_DB_NAME })
    ]);
}
