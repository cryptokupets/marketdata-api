import moment from "moment";
import * as request from "request-promise-native";
import { ICandle, IMarketDataSource } from "../engine/Exchange";

const BASE_URL = "https://api.hitbtc.com/api/2/";
const CANDLES_LIMIT = 1000;

export class Hitbtc implements IMarketDataSource {
  // UNDONE перевести в общепринятые обозначения
  public static timeframeToMinutes(timeframe: string): number {
    let duration = "P";
    if (timeframe === "1M") {
      duration += timeframe;
    } else if (["D1", "D7"].indexOf(timeframe) > -1) {
      duration += timeframe.slice(1) + timeframe.slice(0, 1);
    } else if (
      ["M1", "M3", "M5", "M15", "M30", "H1", "H4"].indexOf(timeframe) > -1
    ) {
      duration += "T" + timeframe.slice(1) + timeframe.slice(0, 1);
    }

    return moment.duration(duration).asMinutes(); // FIXME для месяца не сработает
  }

  public static timeframeToTimeunits(timeframe: string): string {
    let timeunits;
    if (timeframe === "1M") {
      timeunits = "M";
    } else if (["D1", "D7"].indexOf(timeframe) > -1) {
      timeunits = "D";
    } else if (["M1", "M3", "M5", "M15", "M30"].indexOf(timeframe) > -1) {
      timeunits = "m";
    } else if (["H1", "H4"].indexOf(timeframe) > -1) {
      timeunits = "h";
    }
    return timeunits;
  }

  public async _requestCandles(
    currency: string,
    asset: string,
    period: string,
    limit: number,
    from: string // UNDONE унифицировать здесь
  ): Promise<ICandle[]> {
    const options = {
      baseUrl: BASE_URL,
      url: `public/candles/${asset}${currency}`,
      qs: {
        period,
        from,
        limit
      }
    };

    return (JSON.parse(await request.get(options)) as any[]).map(e => {
      return {
        time: e.timestamp,
        open: +e.open,
        high: +e.max,
        low: +e.min,
        close: +e.close,
        volume: +e.volume
      };
    });
  }

  // TODO перенести логику работы с лимитом в обобщающий класс
  public async getCandles({
    currency,
    asset,
    timeframe,
    start,
    end,
    limit
  }: {
    currency: string;
    asset: string;
    timeframe: string;
    start?: string;
    end?: string;
    limit?: number;
  }): Promise<ICandle[]> {
    const endMoment = moment.utc(end); // FIXME некорректно срабатывает
    const timeframeMinutes = Hitbtc.timeframeToMinutes(timeframe);
    const startMoment = moment.utc(start);

    if (!start) {
      startMoment.add(-(limit ? limit : CANDLES_LIMIT) * timeframeMinutes, "m");
    }

    const ticks = endMoment.diff(startMoment, "m") / timeframeMinutes;
    const iterations = ticks / CANDLES_LIMIT;

    // цикл по этим итерациям
    const candles: ICandle[] = [];
    for (let index = 0; index < iterations; index++) { // UNDONE в действительности это не используется
      const response = await this._requestCandles(
        currency,
        asset,
        timeframe,
        CANDLES_LIMIT,
        startMoment.toISOString()
      );
      for (const candle of response.filter(e =>
        moment.utc(e.time).isSameOrBefore(endMoment)
      )) {
        candles.push(candle);
      }
      startMoment.add(CANDLES_LIMIT * timeframeMinutes, "m");
    }

    return candles;
  }
}
