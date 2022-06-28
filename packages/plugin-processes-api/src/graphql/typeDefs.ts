import { gql } from 'apollo-server-express';

import {
  types as jobReferTypes,
  queries as jobReferQueries,
  mutations as jobReferMutations
} from './schema/jobRefer';

import {
  types as jobCategoryTypes,
  queries as jobCategoryQueries,
  mutations as jobCategoryMutations
} from './schema/jobCategory';

import {
  types as flowTypes,
  queries as flowQueries,
  mutations as flowMutations
} from './schema/flow';

import {
  types as flowCategoryTypes,
  queries as flowCategoryQueries,
  mutations as flowCategoryMutations
} from './schema/flowCategory';

import {
  types as workTypes,
  queries as workQueries,
  mutations as workMutations
} from './schema/work';

import {
  types as overallWorkTypes,
  queries as overallWorkQueries,
  mutations as overallWorkMutations
} from './schema/overallWork';

const typeDefs = async _serviceDiscovery => {
  return gql`
    scalar JSON
    scalar Date

    enum CacheControlScope {
      PUBLIC
      PRIVATE
    }

    directive @cacheControl(
      maxAge: Int
      scope: CacheControlScope
      inheritMaxAge: Boolean
    ) on FIELD_DEFINITION | OBJECT | INTERFACE | UNION

    ${jobReferTypes}
    ${jobCategoryTypes}
    ${flowTypes}
    ${flowCategoryTypes}
    ${workTypes}
    ${overallWorkTypes}

    extend type Query {
      ${jobReferQueries}
      ${jobCategoryQueries}
      ${flowQueries}
      ${flowCategoryQueries}
      ${workQueries}
      ${overallWorkQueries}
    }

    extend type Mutation {
      ${jobReferMutations}
      ${jobCategoryMutations}
      ${flowMutations}
      ${flowCategoryMutations}
      ${workMutations}
      ${overallWorkMutations}
    }
  `;
};

export default typeDefs;
