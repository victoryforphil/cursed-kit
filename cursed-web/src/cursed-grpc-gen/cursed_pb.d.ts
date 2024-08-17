import * as jspb from 'google-protobuf'



export class CSVRequest extends jspb.Message {
  getPath(): string;
  setPath(value: string): CSVRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CSVRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CSVRequest): CSVRequest.AsObject;
  static serializeBinaryToWriter(message: CSVRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CSVRequest;
  static deserializeBinaryFromReader(message: CSVRequest, reader: jspb.BinaryReader): CSVRequest;
}

export namespace CSVRequest {
  export type AsObject = {
    path: string,
  }
}

export class CSVResponse extends jspb.Message {
  getCsvContents(): string;
  setCsvContents(value: string): CSVResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CSVResponse.AsObject;
  static toObject(includeInstance: boolean, msg: CSVResponse): CSVResponse.AsObject;
  static serializeBinaryToWriter(message: CSVResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CSVResponse;
  static deserializeBinaryFromReader(message: CSVResponse, reader: jspb.BinaryReader): CSVResponse;
}

export namespace CSVResponse {
  export type AsObject = {
    csvContents: string,
  }
}

