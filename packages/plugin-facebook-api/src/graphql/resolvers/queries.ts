import { IContext } from '../../connectionResolver';
import { getPageList } from '../../utils';

interface IKind {
  kind: string;
}

interface IDetailParams {
  erxesApiId: string;
}

interface ICommentsParams {
  postId: string;
  isResolved?: boolean;
  commentId?: string;
  senderId: string;
  skip?: number;
  limit?: number;
}

const integrationQueries = {
  async facebookGetAccounts(_root, { kind }: IKind, { models }: IContext) {
    return models.Accounts.find({ kind });
  },

  async facebookGetIntegrations(_root, { kind }: IKind, { models }: IContext) {
    return models.Integrations.find({ kind });
  },

  facebookGetIntegrationDetail(
    _root,
    { erxesApiId }: IDetailParams,
    { models }: IContext
  ) {
    return models.Integrations.findOne({ erxesApiId });
  },

  async facebookGetConfigs(_root, _args, { models }: IContext) {
    return models.Configs.find({}).lean();
  },

  async facebookGetComments(
    _root,
    args: ICommentsParams,
    { models }: IContext
  ) {
    const { postId, isResolved, commentId, senderId, limit = 10 } = args;
    const post = await models.Posts.getPost({ erxesApiId: postId });

    const query: {
      postId: string;
      isResolved?: boolean;
      parentId?: string;
      senderId?: string;
    } = {
      postId: post.postId,
      isResolved
    };

    if (senderId !== 'undefined') {
      const customer = await models.Customers.findOne({ erxesApiId: senderId });

      if (!customer) {
        return null;
      }

      query.senderId = customer.userId;
    } else {
      query.parentId = commentId !== 'undefined' ? commentId : '';
    }

    const result = await models.Comments.aggregate([
      {
        $match: query
      },
      {
        $lookup: {
          from: 'customers_facebooks',
          localField: 'senderId',
          foreignField: 'userId',
          as: 'customer'
        }
      },
      {
        $unwind: {
          path: '$customer',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'posts_facebooks',
          localField: 'postId',
          foreignField: 'postId',
          as: 'post'
        }
      },
      {
        $unwind: {
          path: '$post',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'comments_facebooks',
          localField: 'commentId',
          foreignField: 'parentId',
          as: 'replies'
        }
      },
      {
        $addFields: {
          commentCount: { $size: '$replies' },
          'customer.avatar': '$customer.profilePic',
          'customer._id': '$customer.erxesApiId',
          conversationId: '$post.erxesApiId'
        }
      },

      { $sort: { timestamp: -1 } },
      { $limit: limit }
    ]);

    return result.reverse();
  },

  async facebookGetCommentCount(_root, args, { models }: IContext) {
    const { postId, isResolved = false } = args;

    const post = await models.Posts.getPost({ erxesApiId: postId }, true);

    const commentCount = await models.Comments.countDocuments({
      postId: post.postId,
      isResolved
    });
    const commentCountWithoutReplies = await models.Comments.countDocuments({
      postId: post.postId,
      isResolved,
      parentId: null
    });

    return {
      commentCount,
      commentCountWithoutReplies
    };
  },

  async facebookGetPages(_root, args, { models }: IContext) {
    const { kind, accountId } = args;
    const account = await models.Accounts.getAccount({ _id: accountId });
    const accessToken = account.token;
    let pages: any[] = [];

    try {
      pages = await getPageList(models, accessToken, kind);
    } catch (e) {
      if (!e.message.includes('Application request limit reached')) {
        await models.Integrations.updateOne(
          { accountId },
          { $set: { healthStatus: 'account-token', error: `${e.message}` } }
        );
      }
    }

    return pages;
  }
};

export default integrationQueries;