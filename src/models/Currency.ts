import { Edm } from "odata-v4-server";
import { AssetModel } from "./Asset";

export class CurrencyModel {
  @Edm.Key
  @Edm.String
  public key: string;

  @Edm.Key
  @Edm.String
  public exchangeKey: string;

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => AssetModel)))
  public Assets: AssetModel[];

  constructor({ key, exchangeKey }: { key: string; exchangeKey: string }) {
    Object.assign(this, { key, exchangeKey });
  }
}
