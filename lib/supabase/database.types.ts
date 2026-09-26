/*
 * Supabase veritabanı tip tanımları.
 *
 * Bu dosya mevcut şema gözlemlenerek elle yazılmıştır.
 * Şema değiştiğinde güncellenmelidir. İleride Supabase CLI
 * kurulursa aşağıdaki komutla yeniden üretilebilir:
 *
 *   npx supabase gen types typescript --project-id <project-id> > lib/supabase/database.types.ts
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string | null;
                    full_name: string | null;
                    role: string;
                    age: number | null;
                    gender: string | null;
                    avatar_url: string | null;
                    birth_date: string | null;
                    join_date: string | null;
                    interested_sports: string[] | null;
                };
                Insert: {
                    id: string;
                    email?: string | null;
                    full_name?: string | null;
                    role?: string;
                    age?: number | null;
                    gender?: string | null;
                    avatar_url?: string | null;
                    birth_date?: string | null;
                    join_date?: string | null;
                    interested_sports?: string[] | null;
                };
                Update: {
                    id?: string;
                    email?: string | null;
                    full_name?: string | null;
                    role?: string;
                    age?: number | null;
                    gender?: string | null;
                    avatar_url?: string | null;
                    birth_date?: string | null;
                    join_date?: string | null;
                    interested_sports?: string[] | null;
                };
                Relationships: [];
            };
            saved_workouts: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    goal: string | null;
                    environment: string | null;
                    muscles: string[];
                    exercises: Json;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    title: string;
                    goal?: string | null;
                    environment?: string | null;
                    muscles?: string[];
                    exercises?: Json;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    title?: string;
                    goal?: string | null;
                    environment?: string | null;
                    muscles?: string[];
                    exercises?: Json;
                    created_at?: string;
                };
                Relationships: [];
            };
            events: {
                Row: {
                    id: string;
                    slug: string;
                    title: string;
                    category: string;
                    short_description: string | null;
                    description: string | null;
                    location: string;
                    address: string | null;
                    starts_at: string;
                    ends_at: string;
                    registration_deadline: string | null;
                    capacity: number | null;
                    participant_count: number;
                    level: string | null;
                    is_free: boolean;
                    fee_amount: number;
                    currency: string;
                    price_note: string | null;
                    cover_image_path: string | null;
                    registration_open: boolean;
                    featured: boolean;
                    status: string;
                    published_at: string | null;
                    updated_by: string | null;
                    created_by: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    slug: string;
                    title: string;
                    category: string;
                    short_description?: string | null;
                    description?: string | null;
                    location: string;
                    address?: string | null;
                    starts_at: string;
                    ends_at: string;
                    registration_deadline?: string | null;
                    capacity?: number | null;
                    participant_count?: number;
                    level?: string | null;
                    is_free?: boolean;
                    fee_amount?: number;
                    currency?: string;
                    price_note?: string | null;
                    cover_image_path?: string | null;
                    registration_open?: boolean;
                    featured?: boolean;
                    status?: string;
                    published_at?: string | null;
                    updated_by?: string | null;
                    created_by?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    slug?: string;
                    title?: string;
                    category?: string;
                    short_description?: string | null;
                    description?: string | null;
                    location?: string;
                    address?: string | null;
                    starts_at?: string;
                    ends_at?: string;
                    registration_deadline?: string | null;
                    capacity?: number | null;
                    participant_count?: number;
                    level?: string | null;
                    is_free?: boolean;
                    fee_amount?: number;
                    currency?: string;
                    price_note?: string | null;
                    cover_image_path?: string | null;
                    registration_open?: boolean;
                    featured?: boolean;
                    status?: string;
                    published_at?: string | null;
                    updated_by?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            event_images: {
                Row: {
                    id: string;
                    event_id: string;
                    storage_path: string;
                    alt_text: string | null;
                    caption: string | null;
                    sort_order: number;
                };
                Insert: {
                    id?: string;
                    event_id: string;
                    storage_path: string;
                    alt_text?: string | null;
                    caption?: string | null;
                    sort_order?: number;
                };
                Update: {
                    id?: string;
                    event_id?: string;
                    storage_path?: string;
                    alt_text?: string | null;
                    caption?: string | null;
                    sort_order?: number;
                };
                Relationships: [];
            };
            event_registrations: {
                Row: {
                    id: string;
                    event_id: string;
                    user_id: string | null;
                    full_name: string;
                    email: string;
                    phone: string;
                    gender: string;
                    notes: string | null;
                    status: string;
                    consent_accepted: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    event_id: string;
                    user_id?: string | null;
                    full_name: string;
                    email: string;
                    phone: string;
                    gender: string;
                    notes?: string | null;
                    status?: string;
                    consent_accepted?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    event_id?: string;
                    user_id?: string | null;
                    full_name?: string;
                    email?: string;
                    phone?: string;
                    gender?: string;
                    notes?: string | null;
                    status?: string;
                    consent_accepted?: boolean;
                    created_at?: string;
                };
                Relationships: [];
            };
            support_requests: {
                Row: {
                    id: string;
                    full_name: string;
                    phone: string;
                    email: string | null;
                    city: string | null;
                    support_types: string[];
                    volunteer_roles: string[];
                    organization_name: string | null;
                    website: string | null;
                    amount_type: string | null;
                    estimated_amount: number | null;
                    message: string | null;
                    name_visibility: string;
                    display_consent: boolean;
                    kvkk_accepted: boolean;
                    status: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    full_name: string;
                    phone: string;
                    email?: string | null;
                    city?: string | null;
                    support_types?: string[];
                    volunteer_roles?: string[];
                    organization_name?: string | null;
                    website?: string | null;
                    amount_type?: string | null;
                    estimated_amount?: number | null;
                    message?: string | null;
                    name_visibility?: string;
                    display_consent?: boolean;
                    kvkk_accepted?: boolean;
                    status?: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    full_name?: string;
                    phone?: string;
                    email?: string | null;
                    city?: string | null;
                    support_types?: string[];
                    volunteer_roles?: string[];
                    organization_name?: string | null;
                    website?: string | null;
                    amount_type?: string | null;
                    estimated_amount?: number | null;
                    message?: string | null;
                    name_visibility?: string;
                    display_consent?: boolean;
                    kvkk_accepted?: boolean;
                    status?: string;
                    created_at?: string;
                };
                Relationships: [];
            };
            individual_supporters: {
                Row: {
                    id: string;
                    support_request_id: string | null;
                    display_name: string;
                    supporter_category: string;
                    support_types: string[];
                    sort_order: number;
                    is_active: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    support_request_id?: string | null;
                    display_name: string;
                    supporter_category: string;
                    support_types?: string[];
                    sort_order?: number;
                    is_active?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    support_request_id?: string | null;
                    display_name?: string;
                    supporter_category?: string;
                    support_types?: string[];
                    sort_order?: number;
                    is_active?: boolean;
                    created_at?: string;
                };
                Relationships: [];
            };
            sponsors: {
                Row: {
                    id: string;
                    name: string;
                    website: string | null;
                    category: string;
                    sort_order: number;
                    logo_path: string | null;
                    logo_storage_path: string | null;
                    is_active: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    website?: string | null;
                    category: string;
                    sort_order?: number;
                    logo_path?: string | null;
                    logo_storage_path?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    website?: string | null;
                    category?: string;
                    sort_order?: number;
                    logo_path?: string | null;
                    logo_storage_path?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                };
                Relationships: [];
            };
            contact_questions: {
                Row: {
                    id: string;
                    full_name: string;
                    email: string;
                    phone: string | null;
                    category: string;
                    subject: string;
                    question: string;
                    kvkk_accepted: boolean;
                    status: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    full_name: string;
                    email: string;
                    phone?: string | null;
                    category: string;
                    subject: string;
                    question: string;
                    kvkk_accepted?: boolean;
                    status?: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    full_name?: string;
                    email?: string;
                    phone?: string | null;
                    category?: string;
                    subject?: string;
                    question?: string;
                    kvkk_accepted?: boolean;
                    status?: string;
                    created_at?: string;
                };
                Relationships: [];
            };
            dream_submissions: {
                Row: {
                    id: string;
                    full_name: string;
                    phone: string;
                    email: string;
                    dream_title: string;
                    dream_description: string;
                    kvkk_accepted: boolean;
                    status: string;
                    admin_note: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    full_name: string;
                    phone: string;
                    email: string;
                    dream_title: string;
                    dream_description: string;
                    kvkk_accepted?: boolean;
                    status?: string;
                    admin_note?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    full_name?: string;
                    phone?: string;
                    email?: string;
                    dream_title?: string;
                    dream_description?: string;
                    kvkk_accepted?: boolean;
                    status?: string;
                    admin_note?: string | null;
                    created_at?: string;
                };
                Relationships: [];
            };
            community_reviews: {
                Row: {
                    id: string;
                    full_name: string;
                    rating: number;
                    membership_duration: string;
                    comment: string;
                    photo_path: string | null;
                    consent: boolean;
                    status: string;
                    approved_at: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    full_name: string;
                    rating: number;
                    membership_duration: string;
                    comment: string;
                    photo_path?: string | null;
                    consent?: boolean;
                    status?: string;
                    approved_at?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    full_name?: string;
                    rating?: number;
                    membership_duration?: string;
                    comment?: string;
                    photo_path?: string | null;
                    consent?: boolean;
                    status?: string;
                    approved_at?: string | null;
                    created_at?: string;
                };
                Relationships: [];
            };
            exercises: {
                Row: {
                    id: string;
                    name: string;
                    target_muscle: string;
                    environment: string;
                    sets: string;
                    reps: string;
                    description: string | null;
                    goals: string[];
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    target_muscle: string;
                    environment: string;
                    sets: string;
                    reps: string;
                    description?: string | null;
                    goals?: string[];
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    target_muscle?: string;
                    environment?: string;
                    sets?: string;
                    reps?: string;
                    description?: string | null;
                    goals?: string[];
                    created_at?: string;
                };
                Relationships: [];
            };
            custom_program_requests: {
                Row: {
                    id: string;
                    full_name: string;
                    contact: string;
                    age: number | null;
                    height: number | null;
                    weight: number | null;
                    goal: string;
                    notes: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    full_name: string;
                    contact: string;
                    age?: number | null;
                    height?: number | null;
                    weight?: number | null;
                    goal: string;
                    notes?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    full_name?: string;
                    contact?: string;
                    age?: number | null;
                    height?: number | null;
                    weight?: number | null;
                    goal?: string;
                    notes?: string | null;
                    created_at?: string;
                };
                Relationships: [];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            check_and_record_form_rate_limit: {
                Args: {
                    p_form_key: string;
                    p_identifier_hash: string;
                    p_limit: number;
                    p_window_seconds: number;
                };
                Returns: boolean;
            };
            review_event_registration: {
                Args: {
                    p_registration_id: string;
                    p_new_status: string;
                };
                Returns: undefined;
            };
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};
