"use server";
import { z } from "zod";
import { sql } from "@vercel/postgres";
import {
  insertInvoiceInDB,
  updateInvoiceInDB,
  deleteInvoiceInDB,
} from "@/app/lib/data";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(["pending", "paid"]),
  date: z.string(),
});
const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];

  try {
    await insertInvoiceInDB(customerId, amountInCents, status, date);
  } catch (error) {
    return {
      message: "Database Error: Failed to Create Invoice.",
    };
  }
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  const amountInCents = amount * 100;

  try {
     await updateInvoiceInDB(customerId, amountInCents, status, id);
  } catch(error) {
    return  {
        message: "Database error: Failed to Update Invoice."
    }
  }
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
    // throw new Error('Failed to Delete Invoice');

  try{
    await deleteInvoiceInDB(id);
  } catch(error) {
    return {
        message: "Database Error: Failed to delete Invoice."
    }
  }
  revalidatePath("/dashboard/invoices");
}
