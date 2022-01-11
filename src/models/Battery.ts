export class Battery {
    public maxEnergy: number;
    public readonly minEnergy: number;

    private currentEnergy: number;

    constructor(currentEnergy: number, maxEnergy: number) {
        this.currentEnergy = currentEnergy;
        this.maxEnergy = maxEnergy;
        this.minEnergy = 0;
    }

    /**
     * Use energy from battery.
     * @param effect The effect to use the battery with, in watt [W].
     * @param time Time to apply the effect in seconds [s]
     * @returns energy taken from battery.
     */
    useBattery(effect: number, time: number): number {
        const energyToTake = effect * time;
        const betteryEnergyAfterTake = this.currentEnergy - energyToTake;

        let energyToReturn = 0;
        if (betteryEnergyAfterTake < this.minEnergy) {
            energyToReturn = this.currentEnergy;
            this.currentEnergy = 0;
        } else {
            energyToReturn = energyToTake;
            this.currentEnergy -= energyToTake;
        }

        return energyToReturn;
    }

    /**
     * Get current energy stored in battery in joule [J]
     */
    getCurrentEnergy() {
        return this.currentEnergy;
    }

    /**
     * Charge battery
     * @param effect The effect to charge the battery with, in watt [W].
     * @param time Time to apply the effect in seconds [s]
     */
    charge(effect: number, time: number): void {
        const energyToAdd = effect * time;
        this.currentEnergy += energyToAdd;

        if (this.currentEnergy > this.maxEnergy) {
            this.currentEnergy = this.maxEnergy;
        }
    }
}
