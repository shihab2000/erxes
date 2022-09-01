import { IContext } from '..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import { IPost } from '../../db/models/post';

const ForumPost: IObjectTypeResolver<IPost, IContext> = {
  async category({ categoryId }, _, { models: { Category } }) {
    return Category.findById(categoryId).lean();
  },
  async createdBy({ createdById }) {
    return createdById && { __typename: 'User', _id: createdById };
  },
  async updatedBy({ updatedById }) {
    return updatedById && { __typename: 'User', _id: updatedById };
  },
  async stateChangedBy({ stateChangedById }) {
    return stateChangedById && { __typename: 'User', _id: stateChangedById };
  },
  async createdByCp({ createdByCpId }) {
    return (
      createdByCpId && { __typename: 'ClientPortalUser', _id: createdByCpId }
    );
  },
  async updatedByCp({ updatedByCpId }) {
    return (
      updatedByCpId && { __typename: 'ClientPortalUser', _id: updatedByCpId }
    );
  },
  async stateChangedByCp({ stateChangedByCpId }) {
    return (
      stateChangedByCpId && {
        __typename: 'ClientPortalUser',
        _id: stateChangedByCpId
      }
    );
  }
};

export default ForumPost;