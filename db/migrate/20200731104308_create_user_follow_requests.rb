class CreateUserFollowRequests < ActiveRecord::Migration[5.1]
  def change
    create_table :user_follow_requests do |t|
      t.references :user
      t.references :user_to_follow

      t.boolean :is_confirmed, default: 0    
      t.timestamps
    end

    add_foreign_key :user_follow_requests, :users, column: :user_id, primary_key: :id
    add_foreign_key :user_follow_requests, :users, column: :user_to_follow_id, primary_key: :id

  end
end
