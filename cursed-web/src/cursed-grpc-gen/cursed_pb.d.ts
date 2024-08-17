import * as jspb from 'google-protobuf'



export class TopicListRequest extends jspb.Message {
  getLimit(): number;
  setLimit(value: number): TopicListRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TopicListRequest.AsObject;
  static toObject(includeInstance: boolean, msg: TopicListRequest): TopicListRequest.AsObject;
  static serializeBinaryToWriter(message: TopicListRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TopicListRequest;
  static deserializeBinaryFromReader(message: TopicListRequest, reader: jspb.BinaryReader): TopicListRequest;
}

export namespace TopicListRequest {
  export type AsObject = {
    limit: number,
  }
}

export class TopicListResponse extends jspb.Message {
  getTopicsList(): Array<string>;
  setTopicsList(value: Array<string>): TopicListResponse;
  clearTopicsList(): TopicListResponse;
  addTopics(value: string, index?: number): TopicListResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TopicListResponse.AsObject;
  static toObject(includeInstance: boolean, msg: TopicListResponse): TopicListResponse.AsObject;
  static serializeBinaryToWriter(message: TopicListResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TopicListResponse;
  static deserializeBinaryFromReader(message: TopicListResponse, reader: jspb.BinaryReader): TopicListResponse;
}

export namespace TopicListResponse {
  export type AsObject = {
    topicsList: Array<string>,
  }
}

