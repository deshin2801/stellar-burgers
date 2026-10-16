import {  memo } from 'react';
import type { FC } from 'react'
import { BurgerConstructorElementUI } from '@ui';
import type { BurgerConstructorElementProps } from './type';
import { useAppDispatch } from '../../services/store';
import {
  moveDownConstructorItems,
  moveUpConstructorItems,
  removeConstructorItems
} from '../../services/slices/constructorSlice';

export const BurgerConstructorElement: FC<BurgerConstructorElementProps> = memo(
  ({ ingredient, index, totalItems }) => {
    const dispatch = useAppDispatch();

    const handleMoveDown = () => {
      dispatch(moveDownConstructorItems(ingredient.id));
    };

    const handleMoveUp = () => {
      dispatch(moveUpConstructorItems(ingredient.id));
    };

    const handleClose = () => {
      dispatch(removeConstructorItems(ingredient.id));
    };

    return (
      <BurgerConstructorElementUI
        ingredient={ingredient}
        index={index}
        totalItems={totalItems}
        handleMoveUp={handleMoveUp}
        handleMoveDown={handleMoveDown}
        handleClose={handleClose}
      />
    );
  }
);