'use server'

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function createProduct(formData: FormData) {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("User not authenticated")
    }

    const name = formData.get("name") as string
    const type = formData.get("type") as string
    const paymentType = formData.get("payment_type") as string

    // Insert into Supabase
    const { data, error } = await supabase
        .from('products')
        .insert([
            {
                name,
                type,
                payment_type: paymentType,
                user_id: user.id,
                status: 'draft', // Default status
            }
        ])
        .select() // Return the created record to get the ID
        .single()

    if (error) {
        console.error("Error creating product:", error)
        throw new Error("Failed to create product")
    }

    revalidatePath('/products')
    redirect(`/products/${data.id}`)
}

export async function updateProduct(id: string, formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("User not authenticated")
    }

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const price = formData.get("price") ? parseFloat(formData.get("price") as string) : null
    const type = formData.get("type") as string
    const payment_type = formData.get("payment_type") as string
    const status = formData.get("status") as string
    const guarantee_days = formData.get("guarantee_days") ? parseInt(formData.get("guarantee_days") as string) : null
    const support_whatsapp = formData.get("support_whatsapp") as string
    const support_email = formData.get("support_email") as string
    const sales_page_url = formData.get("sales_page_url") as string
    const confirmation_email_body = formData.get("confirmation_email_body") as string

    const { error } = await supabase
        .from('products')
        .update({
            name,
            description,
            price,
            type,
            payment_type,
            status,
            guarantee_days,
            support_whatsapp,
            support_email,
            sales_page_url,
            confirmation_email_body
        })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error("Error updating product:", error)
        throw new Error("Failed to update product")
    }

    revalidatePath('/products')
    revalidatePath(`/products/${id}`)
    return { success: true }
}

export async function deleteProduct(id: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("User not authenticated")
    }

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error("Error deleting product:", error)
        throw new Error("Failed to delete product")
    }

    revalidatePath('/products')
    return { success: true }
}
