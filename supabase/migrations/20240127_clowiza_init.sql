-- Create table for Clowiza Links
create table if not exists public.clowiza_links (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    name text,
    safe_page text not null,
    offer_page text not null,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.clowiza_links enable row level security;

-- Policies for clowiza_links
create policy "Users can view their own links"
    on public.clowiza_links for select
    using (auth.uid() = user_id);

create policy "Users can insert their own links"
    on public.clowiza_links for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own links"
    on public.clowiza_links for update
    using (auth.uid() = user_id);

create policy "Users can delete their own links"
    on public.clowiza_links for delete
    using (auth.uid() = user_id);


-- Create table for logs (counters)
create table if not exists public.clowiza_logs (
    id uuid default gen_random_uuid() primary key,
    link_id uuid references public.clowiza_links(id) on delete cascade not null,
    action_type text not null check (action_type in ('allow', 'block_geo', 'block_device')),
    ip_address text, -- optional, maybe hashed for privacy
    country text,
    user_agent text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for logs
alter table public.clowiza_logs enable row level security;

-- Users can view logs for their links
create policy "Users can view logs for their links"
    on public.clowiza_logs for select
    using (exists (
        select 1 from public.clowiza_links
        where public.clowiza_links.id = public.clowiza_logs.link_id
        and public.clowiza_links.user_id = auth.uid()
    ));

-- We need a function to insert logs securely from the Edge Function (service role)
-- or simply grant insert to authenticated if we use the client (but edge function uses service role usually).
