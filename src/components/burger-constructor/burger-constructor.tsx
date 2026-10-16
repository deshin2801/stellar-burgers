import { useMemo } from 'react';
import type { FC } from 'react'
import type { TConstructorIngredient } from '@utils-types';
import { BurgerConstructorUI } from '@ui';
import { useAppDispatch, useAppSelector } from '../../services/store';
import { useNavigate } from 'react-router-dom';
import {
  selectItems,
  selectBun,
  removeConstructorItemsAll
} from '../../services/slices/constructorSlice';
import { selectUser } from '../../services/slices/userSlice';
import {
  selectOrder,
  selectOrderIsRequested,
  removeOrder,
  orderBurger
} from '../../services/slices/currentSlice';

export const BurgerConstructor: FC = () => {
  const orderModalData = useAppSelector(selectOrder);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const ingredients = useAppSelector(selectItems);
  const bun = useAppSelector(selectBun);
  const orderRequest = useAppSelector(selectOrderIsRequested);

  const constructorItems = {
    bun,
    ingredients
  };

  const price = useMemo(
    () =>
      (bun ? bun.price * 2 : 0) +
      ingredients.reduce(
        (s: number, v: TConstructorIngredient) => s + v.price,
        0
      ),
    [bun, ingredients]
  );

  const onOrderClick = async () => {
    if (!bun || orderRequest) {
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    const ingredientIds = [
      bun._id,
      ...ingredients.map((ingredient) => ingredient._id),
      bun._id
    ];

    try {
      await dispatch(orderBurger(ingredientIds)).unwrap();
      dispatch(removeConstructorItemsAll());
    } catch {}
  };

  const closeOrderModal = () => {
    dispatch(removeOrder());
  };

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      constructorItems={constructorItems}
      orderModalData={orderModalData}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
    />
  );
};