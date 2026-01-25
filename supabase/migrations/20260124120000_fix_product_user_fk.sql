alter table products drop constraint if exists products_user_id_fkey;

alter table products 
  add constraint products_user_id_fkey 
  foreign key (user_id) 
  references auth.users(id) 
  on delete cascade;
