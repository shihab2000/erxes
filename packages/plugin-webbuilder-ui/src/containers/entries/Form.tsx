import gql from 'graphql-tag';
import React from 'react';

import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils';
import Form from '../../components/entries/Form';
import { mutations, queries } from '../../graphql';

type Props = {
  entry?: any;
  contentType: any;
  closeModal: () => void;
  queryParams: any;
};

type FinalProps = {} & Props;

class EntryFormContainer extends React.Component<FinalProps> {
  render() {
    const { queryParams } = this.props;

    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback,
      object
    }: IButtonMutateProps) => {
      return (
        <ButtonMutate
          mutation={object ? mutations.edit : mutations.entriesAdd}
          variables={values}
          callback={callback}
          refetchQueries={getRefetchQueries(queryParams)}
          isSubmitted={isSubmitted}
          type="submit"
          uppercase={false}
          successMessage={`You successfully ${
            object ? 'updated' : 'added'
          } a ${name}`}
        />
      );
    };

    const updatedProps = {
      ...this.props,
      renderButton
    };

    return <Form {...updatedProps} />;
  }
}

const getRefetchQueries = queryParams => {
  return [
    {
      query: gql(queries.entries),
      variables: {
        contentTypeId: queryParams.contentTypeId
      }
    }
  ];
};

export default withProps<Props>(EntryFormContainer);