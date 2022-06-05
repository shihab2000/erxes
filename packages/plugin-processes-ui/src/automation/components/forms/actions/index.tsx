import { ACTIONS } from '../../../constants';
import BoardItemForm from '../../../containers/forms/actions/subForms/BoardItemForm';
import IfForm from '../../../containers/forms/actions/subForms/IfForm';
import SetProperty from '../../../containers/forms/actions/subForms/SetProperty';
import { IAction } from '../../../types';
import Button from '@erxes/ui/src/components/Button';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from 'coreui/utils';
import React from 'react';
import Common from './Common';
import CustomCode from './subForms/CustomCode';
import { IJob } from '../../../../flow/types';
import { IJobRefer } from '../../../../job/types';

type Props = {
  onSave: () => void;
  closeModal: () => void;
  activeAction: IJob;
  jobRefers: IJobRefer[];
  addAction: (action: IJob, actionId?: string, jobReferId?: string) => void;
};

class DefaultForm extends React.Component<Props> {
  render() {
    const { onSave, closeModal } = this.props;

    const { jobRefers } = this.props;
    console.log('jobRefers on index subform:', jobRefers);

    const currentAction = ACTIONS.find(
      action => action.type === 'job' && action.component
    );

    if (currentAction) {
      const Component = currentAction.component;
      return <Component {...this.props} common={Common} />;
    }

    return (
      <>
        <div>
          {__('contents')} {'job'}
        </div>
        <ModalFooter>
          <Button
            btnStyle="simple"
            size="small"
            icon="times-circle"
            onClick={closeModal}
          >
            {__('Cancel')}
          </Button>

          <Button btnStyle="success" icon="checked-1" onClick={onSave}>
            Saves
          </Button>
        </ModalFooter>
      </>
    );
  }
}

export const ActionForms = {
  default: DefaultForm,
  // delay: Delay,
  // setProperty: SetProperty,
  // if: IfForm,
  // boardItem: BoardItemForm,
  // customCode: CustomCode,
  // voucher: LoyaltyForm,
  // changeScore: ChangeScore,
  job: CustomCode
};