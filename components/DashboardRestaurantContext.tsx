'use client';

import { createContext, useContext, type ReactNode } from 'react';

export type DashboardRestaurant = {
  id: string;
  name: string;
  slug: string;
};

const DashboardRestaurantContext = createContext<DashboardRestaurant | null>(null);

export function DashboardRestaurantProvider({
  restaurant,
  children,
}: {
  restaurant: DashboardRestaurant;
  children: ReactNode;
}) {
  return (
    <DashboardRestaurantContext.Provider value={restaurant}>
      {children}
    </DashboardRestaurantContext.Provider>
  );
}

export function useDashboardRestaurant() {
  const restaurant = useContext(DashboardRestaurantContext);
  if (!restaurant) {
    throw new Error('Dashboard pages must be rendered inside DashboardRestaurantProvider.');
  }
  return restaurant;
}
