import { Edm } from "odata-v4-server";

export class Asset {
  @Edm.Key
  @Edm.String
  public key: string;

  @Edm.Key
  @Edm.String
  public currencyKey: string;

  @Edm.Key
  @Edm.String
  public exchangeKey: string;

  constructor({
    key,
    currencyKey,
    exchangeKey
  }: {
    key: string;
    currencyKey: string;
    exchangeKey: string;
  }) {
    Object.assign(this, { key, currencyKey, exchangeKey });
  }
}
