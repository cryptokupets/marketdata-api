import { Edm } from "odata-v4-server";
import { Asset } from "./Asset";

export class Currency {
  @Edm.Key
  @Edm.String
  public key: string;

  @Edm.Key
  @Edm.String
  public exchangeKey: string;

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Asset)))
  public Assets: Asset[];

  constructor({ key, exchangeKey }: { key: string; exchangeKey: string }) {
    Object.assign(this, { key, exchangeKey });
  }
}
