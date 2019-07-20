import { Edm } from "odata-v4-server";

export class CurrencyModel {
  @Edm.Key
  @Edm.String
  public key: string;

  @Edm.Key
  @Edm.String
  public exchangeKey: string;

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
