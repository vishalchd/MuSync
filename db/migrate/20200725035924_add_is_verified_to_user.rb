class AddIsVerifiedToUser < ActiveRecord::Migration[5.1]
  def change
    add_column :users, :is_verified, :boolean, default: 0
  end
end
