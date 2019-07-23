import { Edm, odata, ODataController } from "odata-v4-server";
import { ExchangeEngine } from "../engine/Exchange";
import { IndicatorsEngine } from "../engine/Indicators";
import { Buffer } from "../models/Buffer";
import { Indicator } from "../models/Indicator";
import { IndicatorRow } from "../models/IndicatorRow";

@odata.type(Buffer)
@Edm.EntitySet("Buffer")
export class BufferController extends ODataController {
  @odata.GET
  public async getById(
    @odata.key assetKey: string,
    @odata.key exchangeKey: string,
    @odata.key currencyKey: string,
    @odata.key timeframe: string,
    @odata.key start: string,
    @odata.key end: string,
    @odata.key indicatorInputs: string
  ): Promise<Buffer> {
    const candles = await ExchangeEngine.getCandles({
      exchange: exchangeKey,
      currency: currencyKey,
      asset: assetKey,
      timeframe,
      start,
      end
    });

    // UNDONE передавать набор параметров через пробел, парсить, первое всегда название, далее опции
    // подумать как лучше, можно как раньше через функцию и пост
    // проблема в том, что для одного индикатора набор можно распарсить.
    // но как отделить наборы друг от друга?

    const inputs = indicatorInputs.split(";").map(e => {
      const parsed = e.split(" ");
      return { name: parsed[0], options: parsed.splice(1).map(o => +o) };
    });

    return Promise.all(
      inputs.map(input =>
        IndicatorsEngine.getIndicator(candles, input).then(
          output =>
            new Indicator({
              name: input.name,
              options: input.options,
              output: output.map(o => new IndicatorRow(o.time, o.values))
            })
        )
      )
    ).then(
      indicatorOutputs =>
        new Buffer({
          assetKey,
          currencyKey,
          exchangeKey,
          timeframe,
          start,
          end,
          candles,
          indicatorInputs,
          indicatorOutputs
        })
    );
  }
}
