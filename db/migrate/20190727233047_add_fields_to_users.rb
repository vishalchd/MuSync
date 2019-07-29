class AddFieldsToUsers < ActiveRecord::Migration[5.1]
  def change

    add_column :users, :name, :string
    add_column :users, :photo, :string
    add_column :users, :device_token, :string


  end
end
