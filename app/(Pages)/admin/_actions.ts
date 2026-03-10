// app/(Pages)/admin/_actions.ts
'use server'

import { checkRole } from '@/utils/roles'
import { clerkClient } from '@clerk/nextjs/server'

export async function setRole(prevState: any, formData: FormData) {
    const client = await clerkClient()
    const userId = formData.get('id') as string;
    const role = formData.get('role') as string;

    if (!checkRole('admin')) {
        return {
            success: false,
            message: 'Not Authorized',
            userId
        }
    }

    try {
        const res = await client.users.updateUserMetadata(userId, {
            publicMetadata: { role },
        })
        return {
            success: true,
            message: `Role updated to ${role} successfully`,
            data: res.publicMetadata,
            userId
        }
    } catch (err) {
        return {
            success: false,
            message: err instanceof Error ? err.message : 'Failed to update role',
            userId
        }
    }
}

export async function removeRole(prevState: any, formData: FormData) {
    const client = await clerkClient()
    const userId = formData.get('id') as string;

    if (!checkRole('admin')) {
        return {
            success: false,
            message: 'Not Authorized',
            userId
        }
    }

    try {
        const res = await client.users.updateUserMetadata(userId, {
            publicMetadata: { role: null },
        })
        return {
            success: true,
            message: 'Role removed successfully',
            data: res.publicMetadata,
            userId
        }
    } catch (err) {
        return {
            success: false,
            message: err instanceof Error ? err.message : 'Failed to remove role',
            userId
        }
    }
}