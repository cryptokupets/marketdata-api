import { Edm } from "odata-v4-server";
import { ExchangeModel } from "./Exchange";

export class CurrencyModel {
  @Edm.Key
  @Edm.String
  public key: string;

  @Edm.Key
  @Edm.String
  public exchangeKey: string;

  @Edm.EntityType(Edm.ForwardRef(() => ExchangeModel))
  public Exchange: ExchangeModel;

  @Edm.Collection(Edm.String)
  public Assets: string[];

  constructor({
    key,
    exchangeKey,
    Assets
  }: {
    key: string;
    exchangeKey: string;
    Assets: string[];
  }) {
    Object.assign(this, { key, exchangeKey, Assets });
  }
}
