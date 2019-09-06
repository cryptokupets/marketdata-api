import { Advice } from "../models/Advice";
import { Indicator } from "../models/Indicator";
import { ICandle } from "./Exchange";

export class BacktestEngine {
  public static async getAdvices({
    strategyFunction,
    candles,
    indicators,
    parameters
  }: {
    // tslint:disable-next-line: ban-types
    strategyFunction: Function;
    candles: ICandle[];
    indicators: Indicator[];
    parameters: number[];
  }): Promise<Advice[]> {
    const { Output } = indicators[0]; // UNDONE сделать для нескольких индикаторов
    // перебор выполнять по свечам
    // лучше с обратной стороны
    // лучше сразу ограничить минимальным набором данных
    return Output.map((e, index) => {
      return new Advice({
        time: e.time,
        value: strategyFunction(
          Output.slice(0, index + 1)
            .map(e1 => e1.values)
            .reverse()
        )
      });
    }).filter(e => e.value);
  }
}
