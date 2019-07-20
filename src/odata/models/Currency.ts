import { Edm } from "odata-v4-server";
import { AssetModel } from "./Asset";
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

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => AssetModel)))
  public Assets: AssetModel[];

  constructor({
    key,
    exchangeKey,
    Assets
  }: {
    key: string;
    exchangeKey: string;
    Assets: AssetModel[];
  }) {
    Object.assign(this, { key, exchangeKey, Assets });
  }
}
