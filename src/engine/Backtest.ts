import { Advice } from "../models/Advice";
import { Indicator } from "../models/Indicator";

export class BacktestEngine {
  public static async getAdvices({
    strategyFunction,
    indicator
  }: {
    // tslint:disable-next-line: ban-types
    strategyFunction: Function;
    indicator: Indicator;
  }): Promise<Advice[]> {
    const { output } = indicator;
    return output
      .map((e, index) => {
        return new Advice({
          time: e.time,
          value: strategyFunction(
            output
              .slice(0, index + 1)
              .map(e1 => e1.values)
              .reverse()
          )
        });
      })
      .filter(e => e.value);
  }
}
