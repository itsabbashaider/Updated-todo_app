import * as yup from "yup";

// ─── Create ─────────────────────────

export const createTaskSchema =
  yup.object({

    title:
      yup
        .string()
        .required(
          "Title is required"
        )
        .min(
          3,
          "Title must be at least 3 characters"
        )
        .max(
          100,
          "Title must not exceed 100 characters"
        ),

    description:
      yup
        .string()
        .required("Description is required"),

    completed:
      yup
        .boolean()
        .default(false),

    priority:
      yup
        .string()
        .oneOf([
          "high",
          "medium",
          "low",
        ])
        .nullable(),

    category:
      yup
        .string()
        .nullable(),

    created_at:
      yup
        .date()
        .nullable(),

  });

// ─── Update ─────────────────────────

export const updateTaskSchema =
  yup.object({

    title:
      yup
        .string()
        .min(
          3,
          "Title must be at least 3 characters"
        )
        .max(
          100,
          "Title must not exceed 100 characters"
        ),

    description:
      yup
        .string()
        .required("Description is required"), 

    completed:
      yup
        .boolean(),

    completed_at:
      yup
        .date()
        .nullable(),

    priority:
      yup
        .string()
        .oneOf([
          "high",
          "medium",
          "low",
        ])
        .nullable(),

    category:
      yup
        .string()
        .nullable(),

    created_at:
      yup
        .date()
        .nullable(),

  });