-- Add payment settings to products
alter table products add column if not exists payment_express_enabled boolean default true;
alter table products add column if not exists payment_reference_enabled boolean default false;
alter table products add column if not exists payment_default_method text default 'express';

-- Create offers table
create table if not exists offers (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  product_id uuid references products(id) on delete cascade not null,
  name text not null,
  price numeric not null,
  original_price numeric,
  domain text default 'platform',
  slug text,
  user_id uuid references auth.users not null
);

-- Enable RLS for offers
alter table offers enable row level security;

-- Create policies for offers
create policy "Users can view their own offers"
  on offers for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own offers"
  on offers for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own offers"
  on offers for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own offers"
  on offers for delete
  using ( auth.uid() = user_id );
