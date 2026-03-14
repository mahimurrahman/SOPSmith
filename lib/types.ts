export type CreateSopInput = {
  title: string;
  rawNotes: string;
};

export type CreateSopActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<keyof CreateSopInput, string>>;
};

export type LoginActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};
