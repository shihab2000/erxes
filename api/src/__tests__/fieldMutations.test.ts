import * as faker from 'faker';
import { graphqlRequest } from '../db/connection';
import {
  boardFactory,
  fieldFactory,
  fieldGroupFactory,
  formFactory,
  pipelineFactory,
  userFactory
} from '../db/factories';
import { Fields, FieldsGroups, Users } from '../db/models';

import './setup.ts';

/*
 * Generate test data
 */
const fieldArgs = {
  contentType: faker.random.word(),
  contentTypeId: faker.random.word(),
  validation: 'number',
  type: 'text',
  description: faker.random.word(),
  options: [],
  isRequired: false,
  order: faker.random.number(),
  groupId: faker.random.word(),
  isVisible: false
};

const fieldGroupArgs = {
  name: faker.random.word(),
  contentType: 'customer',
  order: 2,
  description: faker.random.word(),
  isVisible: true
};

const checkFieldGroupMutationResults = (result, args) => {
  expect(result.contentType).toBe(args.contentType);
  expect(result.name).toBe(args.name);
  expect(result.description).toBe(args.description);
  expect(result.isVisible).toBe(args.isVisible);
  expect(result.boardsPipelines.length).toBe(1);
};

describe('Fields mutations', () => {
  let _user;
  let _field;
  let _fieldGroup;
  let context;

  const fieldsCommonParamDefs = `
    $type: String
    $validation: String
    $text: String
    $description: String
    $code: String
    $options: [String]
    $isRequired: Boolean
    $order: Int
    $groupId: String
    $isVisible: Boolean
  `;

  const fieldsCommonParams = `
    type: $type
    validation: $validation
    text: $text
    description: $description
    options: $options
    code: $code
    isRequired: $isRequired
    order: $order
    groupId: $groupId
    isVisible: $isVisible
  `;

  const fieldsGroupsCommonParamDefs = `
    $name: String
    $contentType: String
    $code: String
    $order: Int
    $description: String
    $isVisible: Boolean
    $boardsPipelines: [BoardsPipelinesInput]
  `;

  const fieldsGroupsCommonParams = `
    name: $name
    contentType: $contentType
    order: $order
    code: $code
    description: $description
    isVisible: $isVisible
    boardsPipelines: $boardsPipelines
  `;

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory({});
    _field = await fieldFactory({});
    _fieldGroup = await fieldGroupFactory({});

    context = { user: _user };
  });

  afterEach(async () => {
    // Clearing test data
    await Users.deleteMany({});
    await Fields.deleteMany({});
    await FieldsGroups.deleteMany({});
  });

  test('Add field', async () => {
    const mutation = `
      mutation fieldsAdd(
        $contentType: String!
        $contentTypeId: String
        ${fieldsCommonParamDefs}
      ) {
        fieldsAdd(
          contentType: $contentType
          contentTypeId: $contentTypeId
          ${fieldsCommonParams}
        ) {
          contentType
          contentTypeId
          type
          validation
          description
          options
          isRequired
          order
          groupId
          isVisible
          code
        }
      }
    `;

    const field = await graphqlRequest(
      mutation,
      'fieldsAdd',
      fieldArgs,
      context
    );

    expect(field.contentType).toBe(fieldArgs.contentType);
    expect(field.contentTypeId).toBe(fieldArgs.contentTypeId);
    expect(field.validation).toBe(fieldArgs.validation);
    expect(field.type).toBe(fieldArgs.type);
    expect(field.description).toBe(fieldArgs.description);
    expect(field.options).toEqual(fieldArgs.options);
    expect(field.isRequired).toEqual(fieldArgs.isRequired);
    expect(field.order).toBe(fieldArgs.order);
    expect(field.groupId).toBe(fieldArgs.groupId);
    expect(field.isVisible).toBe(fieldArgs.isVisible);

    const code = '123';

    const fieldWithCode = await graphqlRequest(
      mutation,
      'fieldsAdd',
      { ...fieldArgs, code },
      context
    );

    expect(fieldWithCode.code).toBe(code);

    try {
      await graphqlRequest(
        mutation,
        'fieldsAdd',
        { ...fieldArgs, code },
        context
      );
    } catch (e) {
      expect(e[0].message).toBe('Code must be unique');
    }
  });

  test('Edit field', async () => {
    const mutation = `
      mutation fieldsEdit(
        $_id: String!
        ${fieldsCommonParamDefs}
      ) {
        fieldsEdit(
          _id: $_id
          ${fieldsCommonParams}
        ) {
          _id
          type
          validation
          description
          options
          isRequired
          order
          groupId
          code
          isVisible
        }
      }
    `;

    const field = await graphqlRequest(
      mutation,
      'fieldsEdit',
      { _id: _field._id, ...fieldArgs },
      context
    );

    expect(field._id).toBe(_field._id);
    expect(field.validation).toBe(fieldArgs.validation);
    expect(field.type).toBe(fieldArgs.type);
    expect(field.description).toBe(fieldArgs.description);
    expect(field.options).toEqual(fieldArgs.options);
    expect(field.isRequired).toEqual(fieldArgs.isRequired);
    expect(field.order).toBe(fieldArgs.order);
    expect(field.groupId).toBe(fieldArgs.groupId);
    expect(field.isVisible).toBe(fieldArgs.isVisible);

    const code = '123';

    const fieldWithCode = await graphqlRequest(
      mutation,
      'fieldsEdit',
      { _id: _field._id, ...fieldArgs, code },
      context
    );

    expect(fieldWithCode.code).toBe(code);
  });

  test('Remove field', async () => {
    const mutation = `
      mutation fieldsRemove($_id: String!) {
        fieldsRemove(_id: $_id) {
          _id
        }
      }
    `;

    await graphqlRequest(
      mutation,
      'fieldsRemove',
      { _id: _field._id },
      context
    );

    expect(await Fields.findOne({ _id: _field._id })).toBe(null);
  });

  test('Update order field', async () => {
    const orders = [
      {
        _id: _field._id,
        order: 1
      }
    ];

    const mutation = `
      mutation fieldsUpdateOrder($orders: [OrderItem]) {
        fieldsUpdateOrder(orders: $orders) {
          _id
          order
        }
      }
    `;

    const [fields] = await graphqlRequest(
      mutation,
      'fieldsUpdateOrder',
      { orders },
      context
    );

    const orderIds = orders.map(order => order._id);
    const orderItems = orders.map(item => item.order);

    expect(orderIds).toContain(fields._id);
    expect(orderItems).toContain(fields.order);
  });

  test('Update field visible', async () => {
    const args = {
      _id: _field._id,
      isVisible: _field.isVisible
    };

    const mutation = `
      mutation fieldsUpdateVisible($_id: String! $isVisible: Boolean) {
        fieldsUpdateVisible(_id: $_id isVisible: $isVisible) {
          _id
          isVisible
        }
      }
    `;

    const field = await graphqlRequest(
      mutation,
      'fieldsUpdateVisible',
      args,
      context
    );

    expect(field._id).toBe(args._id);
    expect(field.isVisible).toBe(args.isVisible);
  });

  test('fieldsBulkAddAndEdit', async () => {
    const form = await formFactory();
    const field1 = await fieldFactory({
      contentType: 'form',
      contentTypeId: form._id
    });
    const field2 = await fieldFactory({
      contentType: 'form',
      contentTypeId: form._id
    });
    const field3 = await fieldFactory({
      contentType: 'form',
      contentTypeId: form._id
    });

    const addingFields = [
      {
        text: '1',
        type: 'input',
        tempFieldId: '123'
      },
      {
        text: '2',
        type: 'input',
        logicAction: 'show',
        tempFieldId: '001',
        logics: [
          {
            tempFieldId: '123',
            logicOperator: 'numberigt',
            logicValue: 10
          },
          {
            fieldId: field1._id,
            logicOperator: 'c',
            logicValue: 'hi'
          }
        ]
      }
    ];

    const editingFields = [
      {
        text: '3',
        type: 'input',
        _id: field2._id
      },
      {
        text: '4',
        type: 'input',
        logicAction: 'show',
        _id: field3._id,
        logics: [
          {
            tempFieldId: '123',
            logicOperator: 'numberigt',
            logicValue: 10
          },
          {
            fieldId: field2._id,
            logicOperator: 'c',
            logicValue: 'hi'
          }
        ]
      }
    ];

    const args = {
      contentType: 'form',
      contentTypeId: form._id,
      addingFields,
      editingFields
    };

    const mutation = `
      mutation fieldsBulkAddAndEdit($contentType: String!, $contentTypeId: String, $addingFields: [FieldItem], $editingFields: [FieldItem]) {
        fieldsBulkAddAndEdit(contentType: $contentType
          contentTypeId: $contentTypeId
          addingFields: $addingFields
          editingFields: $editingFields) {
          _id
          text
        }
      }
    `;

    await graphqlRequest(mutation, 'fieldsBulkAddAndEdit', args, context);

    const fields = await Fields.find({ contentTypeId: form._id });

    expect(fields.length).toBe(5);

    const mutationResult = await graphqlRequest(
      mutation,
      'fieldsBulkAddAndEdit',
      {
        contentType: 'form',
        contentTypeId: form._id
      },
      context
    );

    expect(mutationResult).toBeNull();
  }),
    test('Add group field', async () => {
      const board = await boardFactory({ type: 'task' });
      const pipeline = await pipelineFactory({ boardId: board._id });

      const mutation = `
      mutation fieldsGroupsAdd(${fieldsGroupsCommonParamDefs}) {
        fieldsGroupsAdd(${fieldsGroupsCommonParams}) {
          name
          contentType
          order
          description
          isVisible
          code
          boardsPipelines {
            boardId
            pipelineIds
          }
        }
      }
    `;

      const fieldGroup = await graphqlRequest(mutation, 'fieldsGroupsAdd', {
        ...fieldGroupArgs,
        boardsPipelines: [{ boardId: board._id, pipelineIds: [pipeline._id] }]
      });

      expect(fieldGroup.order).toBe(1);
      checkFieldGroupMutationResults(fieldGroup, fieldGroupArgs);

      const code = '123';

      const fieldGroupWithCode = await graphqlRequest(
        mutation,
        'fieldsGroupsAdd',
        {
          ...fieldGroupArgs,
          code,
          boardsPipelines: [{ boardId: board._id, pipelineIds: [pipeline._id] }]
        }
      );

      expect(fieldGroupWithCode.code).toBe(code);

      try {
        await graphqlRequest(mutation, 'fieldsGroupsAdd', {
          ...fieldGroupArgs,
          code,
          boardsPipelines: [{ boardId: board._id, pipelineIds: [pipeline._id] }]
        });
      } catch (e) {
        expect(e[0].message).toBe('Code must be unique');
      }
    });

  test('Edit group field', async () => {
    const board = await boardFactory({ type: 'task' });
    const pipeline = await pipelineFactory({ boardId: board._id });

    const mutation = `
      mutation fieldsGroupsEdit($_id: String! ${fieldsGroupsCommonParamDefs}) {
        fieldsGroupsEdit(_id: $_id ${fieldsGroupsCommonParams}) {
          _id
          name
          contentType
          order
          description
          isVisible
          code
          boardsPipelines {
            boardId
            pipelineIds
          }
        }
      }
    `;

    const fieldGroup = await graphqlRequest(
      mutation,
      'fieldsGroupsEdit',
      {
        _id: _fieldGroup._id,
        ...fieldGroupArgs,
        boardsPipelines: [{ boardId: board._id, pipelineIds: [pipeline._id] }]
      },
      context
    );

    expect(fieldGroup._id).toBe(_fieldGroup._id);
    expect(fieldGroup.order).toBe(fieldGroupArgs.order);
    checkFieldGroupMutationResults(fieldGroup, fieldGroupArgs);

    const code = '123';

    const fieldGroupWithCode = await graphqlRequest(
      mutation,
      'fieldsGroupsEdit',
      {
        _id: _fieldGroup._id,
        ...fieldGroupArgs,
        code,
        boardsPipelines: [{ boardId: board._id, pipelineIds: [pipeline._id] }]
      },
      context
    );

    expect(fieldGroupWithCode.code).toBe(code);
  });

  test('Remove group field', async () => {
    const mutation = `
      mutation fieldsGroupsRemove($_id: String!) {
        fieldsGroupsRemove(_id: $_id)
      }
    `;

    await graphqlRequest(
      mutation,
      'fieldsGroupsRemove',
      { _id: _fieldGroup._id },
      context
    );
    expect(await FieldsGroups.findOne({ _id: _fieldGroup._id })).toBe(null);
  });

  test('Update group field visible', async () => {
    const args = {
      _id: _fieldGroup._id,
      isVisible: true
    };

    const mutation = `
      mutation fieldsGroupsUpdateVisible($_id: String, $isVisible: Boolean) {
        fieldsGroupsUpdateVisible(_id: $_id isVisible: $isVisible) {
          _id
          isVisible
        }
      }
    `;

    const fieldGroup = await graphqlRequest(
      mutation,
      'fieldsGroupsUpdateVisible',
      args,
      context
    );

    expect(fieldGroup._id).toBe(args._id);
    expect(fieldGroup.isVisible).toBe(args.isVisible);
  });

  test('Update order fieldGroup', async () => {
    const orders = [
      {
        _id: _fieldGroup._id,
        order: 1
      }
    ];

    const mutation = `
      mutation fieldsGroupsUpdateOrder($orders: [OrderItem]) {
        fieldsGroupsUpdateOrder(orders: $orders) {
          _id
          order
        }
      }
    `;

    const [fields] = await graphqlRequest(
      mutation,
      'fieldsGroupsUpdateOrder',
      { orders },
      context
    );

    const orderIds = orders.map(order => order._id);
    const orderItems = orders.map(item => item.order);

    expect(orderIds).toContain(fields._id);
    expect(orderItems).toContain(fields.order);
  });
});
