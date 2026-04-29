import type { Plan } from "@/lib/database.types";

export const PLAN_ORDER = ["free", "starter", "pro", "team"] as const;

export const PLAN_CATALOG: Plan[] = [
  {
    agent_run_limit: 5,
    created_at: "",
    id: "free",
    monthly_price: 0,
    name: "Free",
    sop_limit: 3,
  },
  {
    agent_run_limit: 100,
    created_at: "",
    id: "starter",
    monthly_price: 19,
    name: "Starter",
    sop_limit: 50,
  },
  {
    agent_run_limit: 1000,
    created_at: "",
    id: "pro",
    monthly_price: 49,
    name: "Pro",
    sop_limit: 300,
  },
  {
    agent_run_limit: null,
    created_at: "",
    id: "team",
    monthly_price: 149,
    name: "Team",
    sop_limit: null,
  },
];

export function getFallbackPlan(planId = "free") {
  return PLAN_CATALOG.find((plan) => plan.id === planId) ?? PLAN_CATALOG[0];
}

export function formatLimit(value: number | null) {
  return value === null ? "Unlimited" : value.toLocaleString();
}

export function formatMoney(amount: number) {
  return `$${amount.toLocaleString()}`;
}
