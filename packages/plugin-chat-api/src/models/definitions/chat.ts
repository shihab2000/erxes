import { Schema, Document } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

const attachmentSchema = {
  name: { type: String },
  url: { type: String },
  type: { type: String },
  size: { type: Number, optional: true },
};
export interface IAttachment {
  name: string;
  type: string;
  url: string;
  size?: number;
}
export interface IChat {
  name: string;
  participantIds: string[];
  userIds: string[];
}

export interface IChatMessage {
  chatId: string;
  content: string;
  isPinned: boolean;
  attachments: IAttachment[];
}

export const CHAT_TYPE = {
  DIRECT: 'direct',
  GROUP: 'group',
  ALL: ['direct', 'group'],
};

export const VISIBILITIES = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  ALL: ['public', 'private'],
};
export interface IChatMessage {
  attachments: IAttachment[];
  chatId: string;
  relatedId: String;
  isPinned: boolean;
  content: string;
  createdAt: Date;
  createdBy: String;
}
export interface IChatMessageDocument extends IChatMessage, Document {
  _id: String;
}

export const chatMessageSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    attachments: field({ type: [attachmentSchema], label: 'attachments' }),
    chatId: field({ type: String, label: 'Connected chat' }),
    relatedId: field({ type: String, label: 'Related message' }),
    isPinned: field({ type: Boolean, default: false, label: 'Has pinned' }),
    content: field({ type: String, label: 'Content' }),
    createdAt: field({ type: Date, label: 'Created at' }),
    createdBy: field({ type: String, label: 'Created by' }),
  }),
  'erxes_chatMessage'
);

const seenSchema = {
  userId: String,
  seenDate: Date,
  lastSeenMessageId: String,
};

export interface IChat {
  name: string;
  description: String;
  visibility: String;
  type: String;
  isPinned: boolean;
  participantIds: string[];
  adminIds: String;
  seenInfos: String;
  createdAt: Date;
  createdBy: String;
}
export interface IChatDocument extends IChat, Document {
  _id: String;
}

export const chatSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String }),
    description: field({ type: String }),
    visibility: field({ type: String, enum: VISIBILITIES.ALL }),
    type: field({ type: String, enum: CHAT_TYPE.ALL }),
    isPinned: field({ type: Boolean, default: false, label: 'Has pinned' }),
    participantIds: field({ type: [String], label: 'User ids' }),
    adminIds: field({ type: [String], label: 'Admin user ids' }),
    seenInfos: field({ type: [seenSchema], label: 'Seen info', default: [] }),
    createdAt: field({ type: Date, label: 'Created at' }),
    createdBy: field({ type: String, label: 'Created by' }),
  }),
  'erxes_chat'
);
