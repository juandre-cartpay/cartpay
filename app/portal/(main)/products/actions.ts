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

    const updates: any = {}

    // Helper to safely add to updates if key exists in formData
    const setIfPresent = (key: string, parse?: (v: string) => any) => {
        if (formData.has(key)) {
            const val = formData.get(key) as string
            updates[key] = parse ? parse(val) : val
        }
    }

    setIfPresent("name")
    setIfPresent("description")
    setIfPresent("price", (v) => v ? parseFloat(v) : null)
    setIfPresent("type")
    setIfPresent("payment_type")
    setIfPresent("status")
    setIfPresent("guarantee_days", (v) => v ? parseInt(v) : null)
    setIfPresent("support_whatsapp")
    setIfPresent("support_email")
    setIfPresent("sales_page_url")
    setIfPresent("confirmation_email_body")

    // Special handling for payment settings (booleans)
    if (formData.has("payment_express_enabled")) {
        updates.payment_express_enabled = formData.get("payment_express_enabled") === "true"
    }
    if (formData.has("payment_reference_enabled")) {
        updates.payment_reference_enabled = formData.get("payment_reference_enabled") === "true"
    }
    setIfPresent("payment_default_method")

    // Handle Image Upload if present
    const imageFile = formData.get("image") as File
    if (imageFile && imageFile.size > 0) {
        // Simple upload logic
        const fileExt = imageFile.name.split('.').pop()
        const filePath = `${user.id}/${id}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(filePath, imageFile)

        if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(filePath)

            updates.image_url = publicUrl
        }
    }

    const { error } = await supabase
        .from('products')
        .update(updates)
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

export async function createOffer(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("User not authenticated")
    }

    const product_id = formData.get("product_id") as string
    const name = formData.get("name") as string

    // Parse formatted prices (e.g., "2.000,00" -> 2000.00)
    const priceStr = formData.get("price") as string
    const price = priceStr ? parseFloat(priceStr.replace(/\./g, '').replace(',', '.')) : 0

    const originalPriceStr = formData.get("original_price") as string
    const original_price = originalPriceStr ? parseFloat(originalPriceStr.replace(/\./g, '').replace(',', '.')) : null

    const domain = formData.get("domain") as string
    const slug = formData.get("slug") as string

    const { error } = await supabase
        .from('offers')
        .insert({
            product_id,
            user_id: user.id,
            name,
            price,
            original_price,
            domain,
            slug
        })

    if (error) {
        console.error("Error creating offer:", error)
        throw new Error("Failed to create offer")
    }

    revalidatePath(`/products/${product_id}`)
    return { success: true }
}

export async function deleteOffer(id: string, product_id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("User not authenticated")
    }

    const { error } = await supabase
        .from('offers')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error("Error deleting offer:", error)
        throw new Error("Failed to delete offer")
    }

    revalidatePath(`/products/${product_id}`)
    return { success: true }
}
