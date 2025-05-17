import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';

const SUPABASE_URL = 'https://qchcpenckaojjggkjgcb.supabase.co';
const SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjaGNwZW5ja2FvampnZ2tqZ2NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0OTA4OTMsImV4cCI6MjA2MzA2Njg5M30.8wHQQzGPdytYJ2oMAOWXRSCnRBE9fPd-f9gSHM13lK8';

export class SupabaseService {
    private client: SupabaseClient;

    constructor() {
        this.client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }

    async register(email: string, password: string) {
        const { data, error } = await this.client.auth.signUp({ email, password });
        if (error) throw new Error(error.message);
        return data;
    }

    async login(email: string, password: string) {
        const { data, error } = await this.client.auth.signInWithPassword({ email, password });
        if (error) throw new Error(error.message);
        return data;
    }

    async logout() {
        const { error } = await this.client.auth.signOut();
        if (error) throw new Error(error.message);
    }

    async getCurrentUser() {
        const { data, error } = await this.client.auth.getUser();
        if (error || !data.user) throw new Error('User is not authenticated');
        return data.user;
    }

    async createShortLink(originalUrl: string, customCode?: string) {
        const user = await this.getCurrentUser();

        if (customCode) {
            const { data: existing } = await this.client
                .from('links')
                .select('id')
                .eq('short_code', customCode)
                .maybeSingle();

            if (existing) {
                throw new Error('This short code is already taken. Please choose another.');
            }

            const { error } = await this.client.from('links').insert([
                {
                    user_id: user.id,
                    original_url: originalUrl,
                    short_code: customCode,
                },
            ]);

            if (error) throw new Error(error.message);
            return customCode;
        } else {
            const existing = await this.client
                .from('links')
                .select('short_code')
                .eq('user_id', user.id)
                .eq('original_url', originalUrl)
                .maybeSingle();

            if (existing.data) {
                return existing.data.short_code;
            }

            let shortCode = nanoid(6);
            let attempt = 0;

            while (attempt < 5) {
                const { data: duplicate } = await this.client
                    .from('links')
                    .select('id')
                    .eq('short_code', shortCode)
                    .maybeSingle();

                if (!duplicate) break;
                shortCode = nanoid(6);
                attempt++;
            }

            const { error } = await this.client.from('links').insert([
                {
                    user_id: user.id,
                    original_url: originalUrl,
                    short_code: shortCode,
                },
            ]);

            if (error) throw new Error(error.message);
            return shortCode;
        }
    }

    async getMyLinks() {
        const user = await this.getCurrentUser();
        const { data, error } = await this.client
            .from('links')
            .select('id, original_url, short_code, created_at, click_count')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        if (error) throw new Error(error.message);
        return data;
    }

    async deleteLink(shortCode: string) {
        const user = await this.getCurrentUser();
        const { error } = await this.client
            .from('links')
            .delete()
            .eq('user_id', user.id)
            .eq('short_code', shortCode);
        if (error) throw new Error(error.message);
    }

    async updateShortCode(linkId: string, newCode: string) {
        const { data: existing } = await this.client
            .from('links')
            .select('id')
            .eq('short_code', newCode)
            .maybeSingle();

        if (existing) {
            throw new Error('This short code is already taken.');
        }

        const { error } = await this.client
            .from('links')
            .update({ short_code: newCode })
            .eq('id', linkId);

        if (error) throw new Error(error.message);
    }

    async getOriginalUrl(shortCode: string) {
        const { data, error } = await this.client
            .from('links')
            .select('*')
            .eq('short_code', shortCode)
            .single();
        if (error || !data) throw new Error('Link not found');

        await this.trackClick(data.id);

        // Optional: update click_count in links table
        await this.client.rpc('increment_click_count', { link_id_input: data.id });

        return data.original_url;
    }

    async trackClick(linkId: string) {
        const { error } = await this.client.from('clicks').insert([
            {
                link_id: linkId,
                user_agent: navigator.userAgent,
                referrer: document.referrer,
            },
        ]);
        if (error) throw new Error('Failed to track click');
    }

    async getLinkClicks(linkId: string) {
        const { data, error } = await this.client
            .from('clicks')
            .select('*')
            .eq('link_id', linkId)
            .order('clicked_at', { ascending: false });
        if (error) throw new Error(error.message);
        return data;
    }
}

export const supabaseService = new SupabaseService();
