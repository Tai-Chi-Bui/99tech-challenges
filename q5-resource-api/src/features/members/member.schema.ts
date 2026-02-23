import * as v from 'valibot';

export const MemberPayloadSchema = v.object({
  fullName: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
  email: v.pipe(v.string(), v.email(), v.maxLength(255)),
});

export const MemberFiltersSchema = v.object({
  fullName: v.optional(v.string()),
  email: v.optional(v.string()),
});

export type MemberPayload = v.InferOutput<typeof MemberPayloadSchema>;
export type MemberFilters = v.InferOutput<typeof MemberFiltersSchema>;
