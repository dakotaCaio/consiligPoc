
export type Counter = {
    name: string;
    value: number;
};

export type CounterMap = Record<string, Counter>;

export class CounterManager {
    private counters: CounterMap = {};

    incrementCounter(name: string, amount: number = 1): number {
        if (!this.counters[name]) {
            this.counters[name] = { name, value: 0 };
        }
        this.counters[name].value += amount;
        return this.counters[name].value;
    }

    decrementCounter(name: string, amount: number = 1): number {
        if (this.counters[name]) {
            this.counters[name].value -= amount;
            if (this.counters[name].value < 0) {
                this.counters[name].value = 0; 
            }
            return this.counters[name].value;
        }
        return 0; 
    }
}
