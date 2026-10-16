import type { FC } from 'react';
import { AppHeaderUI } from '@ui';
import type { TAppHeaderUIProps } from '../ui/app-header/type';

export const AppHeader: FC<TAppHeaderUIProps> = ({ userName }) => (
  <AppHeaderUI userName={userName} />
);