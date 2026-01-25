-- Create products table
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  price numeric,
  type text not null,
  payment_type text not null,
  category text,
  image_url text,
  user_id uuid references auth.users not null,
  status text default 'draft'
);

-- Enable RLS
alter table products enable row level security;

-- Create policies
create policy "Users can view their own products"
  on products for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own products"
  on products for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own products"
  on products for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own products"
  on products for delete
  using ( auth.uid() = user_id );
