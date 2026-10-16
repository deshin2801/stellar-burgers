import type { TIngredient, TOrder } from '@utils-types';

export type OrderInfoUIProps = {
  orderInfo: TOrder & {
    ingredientsInfo: {
      [key: string]: TIngredient & { count: number };
    };
    date: Date;
    total: number;
  };
  isModal?: boolean;
};

