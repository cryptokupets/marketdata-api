import EventEmitter from "events";
import { ObjectID } from "mongodb";
import { Edm, odata } from "odata-v4-server";
import { TraderEngine } from "../engine/Trader";

export class Trader extends EventEmitter {
  @Edm.Key
  @Edm.Computed
  @Edm.String
  // tslint:disable-next-line: variable-name
  public _id: ObjectID;

  @Edm.String
  public asset: string;

  @Edm.String
  public currency: string;

  @Edm.String
  public exchange: string;

  @Edm.Int32
  public period: number;

  constructor(data: any) {
    super();
    Object.assign(this, data);
  }

  @Edm.Action
  public async start(@odata.result result: any): Promise<void> {
    return TraderEngine.start(result._id);
  }

  @Edm.Action
  public async stop(@odata.result result: any): Promise<void> {
    return TraderEngine.stop(result._id);
  }
}
