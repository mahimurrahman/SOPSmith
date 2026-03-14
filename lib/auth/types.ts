export type LoginActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};
