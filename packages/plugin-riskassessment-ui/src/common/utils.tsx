import React from 'react';
import { Wrapper, Spinner, DataWithLoader, __, Pagination, ControlLabel } from '@erxes/ui/src';
import { menuRiskAssessment } from './constants';
import { CustomFormGroupProps } from './types';
import { FormGroupRow } from '../styles';

export const DefaultWrapper = ({
  title,
  rightActionBar,
  loading,
  totalCount,
  content,
  sidebar,
}: {
  title: string;
  rightActionBar?: JSX.Element;
  loading?: boolean;
  totalCount?: number;
  content: JSX.Element;
  sidebar?: JSX.Element;
}) => {
  if (loading) {
    return <Spinner objective />;
  }
  return (
    <Wrapper
      header={<Wrapper.Header title={title} submenu={menuRiskAssessment} />}
      actionBar={<Wrapper.ActionBar right={rightActionBar} />}
      content={<DataWithLoader loading={loading || false} data={content} count={totalCount} emptyImage="/images/actions/5.svg" emptyText={__('No data of risk assessment')} />}
      leftSidebar={sidebar}
      footer={<Pagination count={totalCount} />}
    />
  );
};

export const CustomFormGroup = ({ children, label, required, row, spaceBetween }: CustomFormGroupProps) => {
  return (
    <FormGroupRow horizontal={row} spaceBetween={spaceBetween}>
      <ControlLabel required={required}>{label}</ControlLabel>
      {children}
    </FormGroupRow>
  );
};

export const subOption = (category) => {
  const { order } = category;
  const foundedString = order.match(/[/]/gi);
  return '\u00A0 '.repeat(foundedString.length);
};