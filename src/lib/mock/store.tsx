"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import {
  buildActivity,
  buildAutomations,
  buildBookings,
  buildCustomers,
  buildOrders,
} from "./seed";
import type {
  ActivityEntry,
  Address,
  AutomationRule,
  BookingStatus,
  CartLine,
  Customer,
  Order,
  OrderStatus,
  CustomProduct,
  ProductOverride,
  RentalBooking,
  RentalLine,
  Session,
} from "./types";

const STORAGE_KEY = "pagdandi.prototype.v1";

export type MockState = {
  /** False until persisted state has been read; keeps SSR markup stable. */
  hydrated: boolean;
  cart: CartLine[];
  rentalCart: RentalLine[];
  wishlist: string[];
  session: Session | null;
  addresses: Address[];
  orders: Order[];
  bookings: RentalBooking[];
  customers: Customer[];
  overrides: Record<string, ProductOverride>;
  /** Products created in the dashboard, merged into the storefront at runtime. */
  customProducts: CustomProduct[];
  automations: AutomationRule[];
  activity: ActivityEntry[];
};

/** Seeded starting point — identical on the server and on first client render. */
function initialState(): MockState {
  return {
    hydrated: false,
    cart: [],
    rentalCart: [],
    wishlist: [],
    session: null,
    addresses: [],
    orders: buildOrders(),
    bookings: buildBookings(),
    customers: buildCustomers(),
    overrides: {},
    customProducts: [],
    automations: buildAutomations(),
    activity: buildActivity(),
  };
}

type Action =
  | { type: "hydrate"; state: MockState }
  | { type: "cart/add"; line: Omit<CartLine, "quantity">; quantity: number }
  | { type: "cart/quantity"; id: string; quantity: number }
  | { type: "cart/remove"; id: string }
  | { type: "cart/clear" }
  | { type: "rental/add"; line: Omit<RentalLine, "quantity">; quantity: number }
  | { type: "rental/remove"; id: string }
  | { type: "rental/clear" }
  | { type: "wishlist/toggle"; slug: string }
  | { type: "session/set"; session: Session | null }
  | { type: "address/add"; address: Address }
  | { type: "order/place"; order: Order }
  | { type: "order/status"; id: string; status: OrderStatus }
  | { type: "booking/place"; booking: RentalBooking }
  | { type: "booking/status"; id: string; status: BookingStatus }
  | { type: "product/override"; slug: string; override: ProductOverride }
  | { type: "product/create"; product: CustomProduct }
  | { type: "product/update"; slug: string; patch: Partial<CustomProduct> }
  | { type: "product/delete"; slug: string }
  | { type: "automation/toggle"; id: string }
  | { type: "automation/add"; rule: AutomationRule }
  | { type: "automation/run"; id: string; entry: ActivityEntry }
  | { type: "reset" };

function reducer(state: MockState, action: Action): MockState {
  switch (action.type) {
    case "hydrate":
      return action.state;

    case "cart/add": {
      const existing = state.cart.find((line) => line.id === action.line.id);
      const cart = existing
        ? state.cart.map((line) =>
            line.id === action.line.id
              ? { ...line, quantity: line.quantity + action.quantity }
              : line,
          )
        : [...state.cart, { ...action.line, quantity: action.quantity }];
      return { ...state, cart };
    }

    case "cart/quantity":
      return {
        ...state,
        cart: state.cart
          .map((line) =>
            line.id === action.id ? { ...line, quantity: Math.max(0, action.quantity) } : line,
          )
          .filter((line) => line.quantity > 0),
      };

    case "cart/remove":
      return { ...state, cart: state.cart.filter((line) => line.id !== action.id) };

    case "cart/clear":
      return { ...state, cart: [] };

    case "rental/add": {
      const existing = state.rentalCart.find((line) => line.id === action.line.id);
      const rentalCart = existing
        ? state.rentalCart.map((line) =>
            line.id === action.line.id
              ? { ...line, quantity: line.quantity + action.quantity }
              : line,
          )
        : [...state.rentalCart, { ...action.line, quantity: action.quantity }];
      return { ...state, rentalCart };
    }

    case "rental/remove":
      return { ...state, rentalCart: state.rentalCart.filter((l) => l.id !== action.id) };

    case "rental/clear":
      return { ...state, rentalCart: [] };

    case "wishlist/toggle":
      return {
        ...state,
        wishlist: state.wishlist.includes(action.slug)
          ? state.wishlist.filter((slug) => slug !== action.slug)
          : [...state.wishlist, action.slug],
      };

    case "session/set":
      return { ...state, session: action.session };

    case "address/add":
      return { ...state, addresses: [...state.addresses, action.address] };

    case "order/place":
      return { ...state, orders: [action.order, ...state.orders], cart: [] };

    case "order/status":
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === action.id ? { ...order, status: action.status } : order,
        ),
      };

    case "booking/place":
      return { ...state, bookings: [action.booking, ...state.bookings], rentalCart: [] };

    case "booking/status":
      return {
        ...state,
        bookings: state.bookings.map((booking) =>
          booking.id === action.id ? { ...booking, status: action.status } : booking,
        ),
      };

    case "product/override":
      return {
        ...state,
        overrides: {
          ...state.overrides,
          [action.slug]: { ...state.overrides[action.slug], ...action.override },
        },
      };

    case "product/create":
      return { ...state, customProducts: [action.product, ...state.customProducts] };

    case "product/update":
      return {
        ...state,
        customProducts: state.customProducts.map((product) =>
          product.slug === action.slug ? { ...product, ...action.patch } : product,
        ),
      };

    case "product/delete":
      return {
        ...state,
        customProducts: state.customProducts.filter((p) => p.slug !== action.slug),
      };

    case "automation/toggle":
      return {
        ...state,
        automations: state.automations.map((rule) =>
          rule.id === action.id ? { ...rule, enabled: !rule.enabled } : rule,
        ),
      };

    case "automation/add":
      return { ...state, automations: [action.rule, ...state.automations] };

    case "automation/run":
      return {
        ...state,
        automations: state.automations.map((rule) =>
          rule.id === action.id
            ? { ...rule, runCount: rule.runCount + 1, lastRunAt: action.entry.at }
            : rule,
        ),
        activity: [action.entry, ...state.activity],
      };

    case "reset":
      return initialState();

    default:
      return state;
  }
}

type StoreValue = {
  state: MockState;
  dispatch: React.Dispatch<Action>;
  /** False until the persisted state has been read, to keep SSR markup stable. */
  hydrated: boolean;
};

const StoreContext = createContext<StoreValue | null>(null);

export function MockStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const hydrated = state.hydrated;

  // Read persisted state after mount — localStorage does not exist on the server.
  // The flag lives in reducer state so this effect dispatches rather than
  // setting component state, which would cascade an extra render.
  useEffect(() => {
    let saved: Partial<MockState> = {};
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) saved = JSON.parse(raw) as Partial<MockState>;
    } catch {
      // Private browsing or blocked storage: carry on with seed data.
    }
    dispatch({ type: "hydrate", state: { ...initialState(), ...saved, hydrated: true } });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Quota or blocked storage — the prototype still works in memory.
    }
  }, [state, hydrated]);

  const value = useMemo(() => ({ state, dispatch, hydrated }), [state, hydrated]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore must be used inside MockStoreProvider");
  return value;
}

/** Cart helpers, kept here so every screen totals the basket identically. */
export function useCart() {
  const { state, dispatch, hydrated } = useStore();

  const subtotal = state.cart.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const count = state.cart.reduce((sum, line) => sum + line.quantity, 0);
  // Free delivery over ₹2,000, mirroring the kind of rule the shop would set.
  const shipping = state.cart.length === 0 || subtotal > 200_000 ? 0 : 9900;

  return {
    lines: state.cart,
    count: hydrated ? count : 0,
    subtotal,
    shipping,
    total: subtotal + shipping,
    hydrated,
    add: useCallback(
      (line: Omit<CartLine, "quantity">, quantity = 1) =>
        dispatch({ type: "cart/add", line, quantity }),
      [dispatch],
    ),
    setQuantity: useCallback(
      (id: string, quantity: number) => dispatch({ type: "cart/quantity", id, quantity }),
      [dispatch],
    ),
    remove: useCallback((id: string) => dispatch({ type: "cart/remove", id }), [dispatch]),
    clear: useCallback(() => dispatch({ type: "cart/clear" }), [dispatch]),
  };
}

export function useWishlist() {
  const { state, dispatch, hydrated } = useStore();
  return {
    slugs: hydrated ? state.wishlist : [],
    has: (slug: string) => hydrated && state.wishlist.includes(slug),
    toggle: (slug: string) => dispatch({ type: "wishlist/toggle", slug }),
    count: hydrated ? state.wishlist.length : 0,
  };
}
